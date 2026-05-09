import assert from "node:assert/strict";
import { after, afterEach, before, describe, it } from "node:test";
import crypto from "node:crypto";

const originalNodeEnv = process.env.NODE_ENV;
const originalDbName = process.env.PSQL_DB_NAME;
const originalDbUser = process.env.PSQL_DB_USER;
const originalDbPass = process.env.PSQL_DB_PASS;
const originalSyncDbForApp = process.env.SYNC_DB_FOR_APP;
const originalForceDbSync = process.env.FORCE_DB_SYNC;
const originalPublicKey = process.env.RSA_API_ENCRYPTION_PUBLIC_KEY;
const originalPrivateKey = process.env.RSA_API_ENCRYPTION_PRIVATE_KEY;

type DbIndexModule = typeof import("../../dbModels/index.js");
type SequelizeModule = typeof import("../../dbModels/sequelize.js");
type PrivateAccessModule = typeof import("../../dbModels/privateAccessStore.js");

let dbIndex: DbIndexModule;
let sequelizeModule: SequelizeModule;
let privateAccessModule: PrivateAccessModule;

const restoreEnv = (key: string, value: string | undefined) => {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
};

before(async () => {
  process.env.NODE_ENV = "test";
  process.env.PSQL_DB_NAME = "policy_synth_test";
  process.env.PSQL_DB_USER = "policy_synth_test";
  process.env.PSQL_DB_PASS = "policy_synth_test";
  process.env.SYNC_DB_FOR_APP = "false";
  delete process.env.FORCE_DB_SYNC;

  [dbIndex, sequelizeModule, privateAccessModule] = await Promise.all([
    import("../../dbModels/index.js"),
    import("../../dbModels/sequelize.js"),
    import("../../dbModels/privateAccessStore.js"),
  ]);
});

afterEach(() => {
  restoreEnv("SYNC_DB_FOR_APP", originalSyncDbForApp);
  restoreEnv("FORCE_DB_SYNC", originalForceDbSync);
  restoreEnv("RSA_API_ENCRYPTION_PUBLIC_KEY", originalPublicKey);
  restoreEnv("RSA_API_ENCRYPTION_PRIVATE_KEY", originalPrivateKey);
});

after(async () => {
  restoreEnv("NODE_ENV", originalNodeEnv);
  restoreEnv("PSQL_DB_NAME", originalDbName);
  restoreEnv("PSQL_DB_USER", originalDbUser);
  restoreEnv("PSQL_DB_PASS", originalDbPass);
  await sequelizeModule.sequelize.close();
});

describe("dbModels model definitions", () => {
  it("initializes model metadata without a live database connection", async () => {
    const extraModelModules = await Promise.all([
      import("../../dbModels/agentEval.js"),
      import("../../dbModels/ypOrganization.js"),
    ]);
    await dbIndex.initializeModels();

    for (const [name, model] of Object.entries(dbIndex.models)) {
      assert.equal(typeof model.getTableName, "function", name);
      assert.ok(Object.keys(model.getAttributes()).length > 0, name);
    }
    for (const moduleRecord of extraModelModules) {
      const model = Object.values(moduleRecord)[0] as {
        getTableName: () => string | { tableName: string };
        getAttributes: () => Record<string, unknown>;
      };
      assert.ok(model.getTableName());
      assert.ok(Object.keys(model.getAttributes()).length > 0);
    }

    assert.equal(dbIndex.PsAgent.getTableName(), "ps_agents");
    assert.equal(dbIndex.PsAgentClass.getTableName(), "ps_agent_classes");
    assert.equal(dbIndex.PsAgentConnector.getTableName(), "ps_agent_connectors");
    assert.equal(dbIndex.PsModelUsage.getTableName(), "ps_model_usage");
    assert.equal(dbIndex.PsModelUsageItem.getTableName(), "ps_model_usage_item");
  });

  it("runs application-level table and index sync idempotently", async () => {
    const calls: string[] = [];
    const originalGetQueryInterface = dbIndex.sequelize.getQueryInterface;
    Reflect.set(dbIndex.sequelize, "getQueryInterface", () => ({
      describeTable: async () => {
        calls.push("describe");
        throw new Error("missing table");
      },
      createTable: async (_tableName: string, attributes: Record<string, unknown>) => {
        calls.push(`create:${Object.keys(attributes).length}`);
      },
      showIndex: async () => [
        {
          name: "ps_model_usage_item_user_id",
        },
      ],
      addIndex: async (_tableName: string, fields: string[], options: { name: string }) => {
        calls.push(`index:${options.name}:${fields.join(",")}`);
      },
    }));

    try {
      await dbIndex.applicationLevelSync();
    } finally {
      Reflect.set(dbIndex.sequelize, "getQueryInterface", originalGetQueryInterface);
    }

    assert.deepEqual(calls, [
      "describe",
      "create:8",
      "index:ps_model_usage_item_model_id:model_id",
      "index:ps_model_usage_item_agent_id:agent_id",
      "index:ps_model_usage_item_connector_id:connector_id",
      "index:ps_model_usage_item_created_at:created_at",
    ]);
  });

  it("handles existing application-level tables and concurrent index creation", async () => {
    const originalGetQueryInterface = dbIndex.sequelize.getQueryInterface;
    const addedIndexes: string[] = [];
    Reflect.set(dbIndex.sequelize, "getQueryInterface", () => ({
      describeTable: async () => ({
        id: {},
      }),
      showIndex: async () => [
        {
          name: "ps_model_usage_item_user_id",
        },
      ],
      addIndex: async (
        _tableName: string,
        _fields: string[],
        options: { name: string }
      ) => {
        addedIndexes.push(options.name);
        throw Object.assign(new Error("already exists"), {
          original: { code: "42P07" },
        });
      },
    }));

    try {
      await dbIndex.applicationLevelSync();
    } finally {
      Reflect.set(dbIndex.sequelize, "getQueryInterface", originalGetQueryInterface);
    }

    assert.deepEqual(addedIndexes, [
      "ps_model_usage_item_model_id",
      "ps_model_usage_item_agent_id",
      "ps_model_usage_item_connector_id",
      "ps_model_usage_item_created_at",
    ]);
  });

  it("rethrows non-concurrent application-level sync failures", async () => {
    const originalGetQueryInterface = dbIndex.sequelize.getQueryInterface;
    Reflect.set(dbIndex.sequelize, "getQueryInterface", () => ({
      describeTable: async () => {
        throw new Error("missing");
      },
      createTable: async () => {
        throw new Error("permission denied");
      },
      showIndex: async () => [],
      addIndex: async () => undefined,
    }));

    try {
      await assert.rejects(
        () => dbIndex.applicationLevelSync(),
        /permission denied/
      );
    } finally {
      Reflect.set(dbIndex.sequelize, "getQueryInterface", originalGetQueryInterface);
    }
  });

  it("skips app-level sync unless explicitly enabled", async () => {
    process.env.SYNC_DB_FOR_APP = "false";
    const originalGetQueryInterface = dbIndex.sequelize.getQueryInterface;
    let called = false;
    Reflect.set(dbIndex.sequelize, "getQueryInterface", () => {
      called = true;
      return originalGetQueryInterface.call(dbIndex.sequelize);
    });

    try {
      await dbIndex.ensureApplicationLevelSync();
    } finally {
      Reflect.set(dbIndex.sequelize, "getQueryInterface", originalGetQueryInterface);
    }

    assert.equal(called, false);
  });

  it("runs app-level sync once when enabled and resets the memoized promise on failure", async () => {
    process.env.SYNC_DB_FOR_APP = "true";
    const originalGetQueryInterface = dbIndex.sequelize.getQueryInterface;
    let attempts = 0;
    Reflect.set(dbIndex.sequelize, "getQueryInterface", () => {
      attempts += 1;
      if (attempts === 1) {
        return {
          describeTable: async () => {
            throw new Error("missing");
          },
          createTable: async () => {
            throw new Error("not concurrent");
          },
          showIndex: async () => [],
          addIndex: async () => undefined,
        };
      }
      return {
        describeTable: async () => ({}),
        showIndex: async () => [
          { name: "ps_model_usage_item_user_id" },
          { name: "ps_model_usage_item_model_id" },
          { name: "ps_model_usage_item_agent_id" },
          { name: "ps_model_usage_item_connector_id" },
          { name: "ps_model_usage_item_created_at" },
        ],
        addIndex: async () => undefined,
      };
    });

    try {
      await assert.rejects(
        () => dbIndex.ensureApplicationLevelSync(),
        /not concurrent/
      );
      await dbIndex.ensureApplicationLevelSync();
      await dbIndex.ensureApplicationLevelSync();
    } finally {
      Reflect.set(dbIndex.sequelize, "getQueryInterface", originalGetQueryInterface);
    }

    assert.equal(attempts, 2);
  });

  it("runs optional sync and exits on model initialization failures", async () => {
    const originalForceSync = process.env.FORCE_DB_SYNC;
    const originalSync = dbIndex.sequelize.sync;
    const modelEntries = Object.entries(dbIndex.models) as Array<
      [string, { associate?: (models: unknown) => Promise<void> | void }]
    >;
    const originalAssociates = modelEntries.map(([name, model]) => [
      name,
      model.associate,
    ] as const);
    let syncCalls = 0;
    process.env.FORCE_DB_SYNC = "true";
    dbIndex.sequelize.sync = (async () => {
      syncCalls += 1;
      return dbIndex.sequelize;
    }) as typeof dbIndex.sequelize.sync;
    for (const [, model] of modelEntries) {
      model.associate = async () => undefined;
    }

    try {
      await dbIndex.initializeModels();
    } finally {
      dbIndex.sequelize.sync = originalSync;
      restoreEnv("FORCE_DB_SYNC", originalForceSync);
      for (const [name, associate] of originalAssociates) {
        dbIndex.models[name].associate = associate;
      }
    }

    assert.equal(syncCalls, 1);

    const originalAssociate = dbIndex.models.PsAgentClass.associate;
    const originalExit = process.exit;
    dbIndex.models.PsAgentClass.associate = async () => {
      throw new Error("bad associate");
    };
    process.exit = ((code?: string | number | null) => {
      throw new Error(`process.exit:${code}`);
    }) as typeof process.exit;

    try {
      await assert.rejects(
        () => dbIndex.initializeModels(),
        /process\.exit:1/
      );
    } finally {
      dbIndex.models.PsAgentClass.associate = originalAssociate;
      process.exit = originalExit;
    }
  });
});

describe("sequelize connection helper", () => {
  it("authenticates with the configured sequelize instance", async () => {
    const originalAuthenticate = sequelizeModule.sequelize.authenticate;
    let authenticated = false;
    sequelizeModule.sequelize.authenticate = (async () => {
      authenticated = true;
    }) as typeof sequelizeModule.sequelize.authenticate;

    try {
      await sequelizeModule.connectToDatabase();
    } finally {
      sequelizeModule.sequelize.authenticate = originalAuthenticate;
    }

    assert.equal(authenticated, true);
  });

  it("exits when database authentication fails", async () => {
    const originalAuthenticate = sequelizeModule.sequelize.authenticate;
    const originalExit = process.exit;
    sequelizeModule.sequelize.authenticate = (async () => {
      throw new Error("auth failed");
    }) as typeof sequelizeModule.sequelize.authenticate;
    process.exit = ((code?: string | number | null) => {
      throw new Error(`process.exit:${code}`);
    }) as typeof process.exit;

    try {
      await assert.rejects(
        () => sequelizeModule.connectToDatabase(),
        /process\.exit:1/
      );
    } finally {
      sequelizeModule.sequelize.authenticate = originalAuthenticate;
      process.exit = originalExit;
    }
  });

  it("covers alternate sequelize environment configuration branches", async () => {
    assert.deepEqual(
      sequelizeModule.buildPoolConfig({
        DB_POOL_MAX: "7",
        DB_POOL_MIN: "2",
        DB_POOL_ACQUIRE_MS: "111",
        DB_POOL_IDLE_MS: "222",
      } as NodeJS.ProcessEnv),
      {
        max: 7,
        min: 2,
        acquire: 111,
        idle: 222,
      }
    );

    const originalExit = process.exit;
    process.exit = ((code?: string | number | null) => {
      throw new Error(`process.exit:${code}`);
    }) as typeof process.exit;
    try {
      assert.throws(
        () =>
          sequelizeModule.validatePoolConfig({
            max: 1,
            min: 2,
            acquire: 100,
            idle: 100,
          }),
        /process\.exit:1/
      );
    } finally {
      process.exit = originalExit;
    }

    const productionSsl = sequelizeModule.createSequelizeFromEnv({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      DISABLE_PG_SSL: undefined,
      PS_LOG_SQL: "true",
    } as NodeJS.ProcessEnv);
    assert.ok(productionSsl);
    assert.equal(productionSsl.getDialect(), "postgres");
    const logging = (Reflect.get(productionSsl, "options") as {
      logging?: unknown;
    }).logging;
    assert.equal(typeof logging, "function");
    if (typeof logging === "function") {
      assert.deepEqual(logging("select 1", { bind: [1] }), { bind: [1] });
    }
    await productionSsl.close();

    const productionNoSsl = sequelizeModule.createSequelizeFromEnv({
      NODE_ENV: "production",
      DATABASE_URL: "postgres://user:pass@localhost:5432/db",
      DISABLE_PG_SSL: "true",
      PS_LOG_SQL: "false",
    } as NodeJS.ProcessEnv);
    assert.ok(productionNoSsl);
    assert.equal(productionNoSsl.getDialect(), "postgres");
    await productionNoSsl.close();

    const devFallback = sequelizeModule.createSequelizeFromEnv({
      NODE_ENV: "test",
      PSQL_DB_NAME: undefined,
      PSQL_DB_USER: undefined,
      PSQL_DB_PASS: undefined,
      YP_DEV_DATABASE_NAME: "yp_dev",
      YP_DEV_DATABASE_USERNAME: "yp_user",
      YP_DEV_DATABASE_PASSWORD: "yp_pass",
      DB_PORT: "not-a-number",
    } as NodeJS.ProcessEnv);
    assert.ok(devFallback);
    assert.equal(devFallback.config.database, "yp_dev");
    assert.equal(devFallback.config.port, 5432);
    await devFallback.close();

    assert.equal(
      sequelizeModule.createSequelizeFromEnv({
        NODE_ENV: "test",
      } as NodeJS.ProcessEnv),
      undefined
    );
  });
});

describe("PsPrivateAccessStore", () => {
  it("encrypts and decrypts API keys with configured RSA keys", () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });
    process.env.RSA_API_ENCRYPTION_PUBLIC_KEY = publicKey;
    process.env.RSA_API_ENCRYPTION_PRIVATE_KEY = privateKey;

    const encrypted =
      privateAccessModule.PsPrivateAccessStore.encryptApiKey("secret-api-key");
    const decrypted = privateAccessModule.PsPrivateAccessStore.decryptApiKey(
      encrypted.encryptedApiKey,
      encrypted.encryptedAesKey
    );

    assert.equal(decrypted, "secret-api-key");
    assert.match(encrypted.encryptedApiKey, /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i);
    assert.match(encrypted.encryptedAesKey, /^[A-Za-z0-9+/]+=*$/);
  });

  it("throws clear errors when RSA key env vars are missing", () => {
    delete process.env.RSA_API_ENCRYPTION_PUBLIC_KEY;
    delete process.env.RSA_API_ENCRYPTION_PRIVATE_KEY;

    assert.throws(
      () => privateAccessModule.PsPrivateAccessStore.encryptApiKey("secret"),
      /RSA_API_ENCRYPTION_PUBLIC_KEY/
    );
    assert.throws(
      () => privateAccessModule.PsPrivateAccessStore.decryptApiKey("00:00:00", "AA=="),
      /RSA_API_ENCRYPTION_PRIVATE_KEY/
    );
  });

  it("validates pre-encrypted key format and delegates valid inserts to Sequelize", async () => {
    const store = privateAccessModule.PsPrivateAccessStore;
    await assert.rejects(
      () =>
        store.addPreEncryptedKey(
          1,
          2,
          3,
          undefined,
          "not-encrypted",
          "not-base64",
          {
            maxBudget: { perDay: 1, petMonth: 2, total: 3 },
            emailNotificationBudgetThresholds: { daily: 0.8, monthly: 0.9 },
          }
        ),
      /Invalid encrypted key format/
    );

    const originalCreate = store.create;
    const createdPayloads: unknown[] = [];
    store.create = (async (payload: unknown) => {
      createdPayloads.push(payload);
      return payload;
    }) as typeof store.create;

    try {
      await store.addPreEncryptedKey(
        1,
        2,
        3,
        undefined,
        "aa:bb:cc",
        "AQIDBA==",
        {
          maxBudget: { perDay: 1, petMonth: 2, total: 3 },
          emailNotificationBudgetThresholds: { daily: 0.8, monthly: 0.9 },
        }
      );
    } finally {
      store.create = originalCreate;
    }

    assert.deepEqual(createdPayloads[0], {
      group_id: 1,
      user_id: 2,
      ai_model_id: 3,
      external_api_id: undefined,
      encrypted_api_key: "aa:bb:cc",
      encrypted_aes_key: "AQIDBA==",
      configuration: {
        maxBudget: { perDay: 1, petMonth: 2, total: 3 },
        emailNotificationBudgetThresholds: { daily: 0.8, monthly: 0.9 },
      },
      usage: {
        dailyUse: 0,
        monthlyUse: 0,
        totalUse: 0,
      },
      is_active: true,
    });
  });

  it("builds read filters and usage mutations when called with trusted receivers", async () => {
    const store = privateAccessModule.PsPrivateAccessStore;
    const getApiKeys = store.getApiKeys;
    const findAllCalls: unknown[] = [];
    const trustedReader = {
      findAll: async (options: unknown) => {
        findAllCalls.push(options);
        return ["key-row"];
      },
    };

    assert.deepEqual(
      await getApiKeys.call(trustedReader, 12, {
        aiModelId: 3,
        externalApiId: 4,
        isActive: true,
      }),
      ["key-row"]
    );
    assert.deepEqual(findAllCalls[0], {
      where: {
        group_id: 12,
        ai_model_id: 3,
        external_api_id: 4,
        is_active: true,
      },
      order: [
        ["is_active", "DESC"],
        ["id", "ASC"],
      ],
    });

    const originalTransaction = sequelizeModule.sequelize.transaction;
    const transactionContext = { LOCK: { UPDATE: "UPDATE" } };
    sequelizeModule.sequelize.transaction = (async (
      callback: (transaction: typeof transactionContext) => Promise<unknown>
    ) => callback(transactionContext)) as typeof sequelizeModule.sequelize.transaction;
    const updates: unknown[] = [];
    const trustedUsageStore = {
      findAll: async (options: unknown) => {
        findAllCalls.push(options);
        return [
          {
            usage: {
              dailyUse: 1,
              monthlyUse: 2,
              totalUse: 3,
            },
            encrypted_api_key: "encrypted",
            encrypted_aes_key: "aes",
            update: async (payload: unknown, options: unknown) => {
              updates.push({ payload, options });
            },
          },
        ];
      },
      decryptApiKey: (encryptedApiKey: string, encryptedAesKey: string) =>
        `${encryptedApiKey}:${encryptedAesKey}:decrypted`,
    };
    const incrementUsageAndGetApiKey = store.incrementUsageAndGetApiKey;

    try {
      assert.equal(
        await incrementUsageAndGetApiKey.call(trustedUsageStore, 12, {
          aiModelId: 3,
          externalApiId: 4,
          incrementAmount: 5,
        }),
        "encrypted:aes:decrypted"
      );
    } finally {
      sequelizeModule.sequelize.transaction = originalTransaction;
    }

    assert.deepEqual(updates[0], {
      payload: {
        usage: {
          dailyUse: 6,
          monthlyUse: 7,
          totalUse: 8,
        },
        last_used_at: (updates[0] as { payload: { last_used_at: Date } }).payload
          .last_used_at,
      },
      options: {
        transaction: transactionContext,
      },
    });
    assert.ok((updates[0] as { payload: { last_used_at: Date } }).payload.last_used_at instanceof Date);

    const setKeyStatus = store.setKeyStatus;
    assert.equal(
      await setKeyStatus.call(
        {
          update: async () => [1],
        },
        99,
        false
      ),
      true
    );
    assert.equal(
      await setKeyStatus.call(
        {
          update: async () => [0],
        },
        99,
        true
      ),
      false
    );

    const getUsage = store.getUsage;
    assert.deepEqual(
      await getUsage.call(
        {
          findOne: async () => ({ usage: { dailyUse: 1, monthlyUse: 2, totalUse: 3 } }),
        },
        99
      ),
      { dailyUse: 1, monthlyUse: 2, totalUse: 3 }
    );
    assert.equal(
      await getUsage.call(
        {
          findOne: async () => null,
        },
        99
      ),
      null
    );
  });

  it("blocks direct sensitive reads through the proxy", async () => {
    await assert.rejects(
      () => privateAccessModule.PsPrivateAccessStore.findAll(),
      /Use of findAll is not allowed/
    );
    await assert.rejects(
      () => privateAccessModule.PsPrivateAccessStore.findOne(),
      /Use of findOne is not allowed/
    );
    await assert.rejects(
      () => privateAccessModule.PsPrivateAccessStore.findByPk(1),
      /Use of findByPk is not allowed/
    );
  });
});
