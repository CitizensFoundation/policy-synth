import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import { PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";

process.env.NODE_ENV = "test";
process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";

type AddAiModelDependencies =
  import("../../tools/addNewAiModel.js").AddAiModelDependencies;
type AddUserToAgentClassDependencies =
  import("../../tools/addUserToAgentClass.js").AddUserToAgentClassDependencies;
type AddUserToAllAgentClassesDependencies =
  import("../../tools/addUserToAllAgentClasses.js").AddUserToAllAgentClassesDependencies;
type DocumentationRuntime =
  import("../../tools/generateDocumentation.js").DocumentationRuntime;
type SeedAiModelsDependencies =
  import("../../tools/seedAiModels.js").SeedAiModelsDependencies;

const [
  addNewAiModelModule,
  addUserToAgentClassModule,
  addUserToAllAgentClassesModule,
  cliUtilsModule,
  generateDocumentationModule,
  seedAiModelsModule,
  aiModelModule,
  agentClassModule,
  userModule,
  groupModule,
  sequelizeModule,
] = await Promise.all([
  import("../../tools/addNewAiModel.js"),
  import("../../tools/addUserToAgentClass.js"),
  import("../../tools/addUserToAllAgentClasses.js"),
  import("../../tools/cliUtils.js"),
  import("../../tools/generateDocumentation.js"),
  import("../../tools/seedAiModels.js"),
  import("../../dbModels/aiModel.js"),
  import("../../dbModels/agentClass.js"),
  import("../../dbModels/ypUser.js"),
  import("../../dbModels/ypGroup.js"),
  import("../../dbModels/sequelize.js"),
]);

const {
  addAiModel,
  defaultAddAiModelDependencies,
  deactivateExistingModels,
  parseAddAiModelArgs,
  runAddAiModelCli,
} = addNewAiModelModule;
const {
  addUserToAgentClasses,
  defaultAddUserToAgentClassDependencies,
  parseAddUserToAgentClassesArgs,
  runAddUserToAgentClassesCli,
} =
  addUserToAgentClassModule;
const {
  addUserToAllAgentClasses,
  defaultAddUserToAllAgentClassesDependencies,
  parseAddUserToAllAgentClassesArgs,
  runAddUserToAllAgentClassesCli,
} =
  addUserToAllAgentClassesModule;
const { isCliEntrypoint } = cliUtilsModule;
const {
  buildDirectoryTree,
  createDocumentationRuntime,
  findTSFiles,
  generateChecksum,
  generateDocsReadme,
  generateDocumentation,
  generateMarkdownFromTree,
  getAllTypeDefContents,
  main: generateDocumentationMain,
  renderSystemPrompt,
  runGenerateDocumentationCli,
} = generateDocumentationModule;
const {
  buildSeedAiModelConfigurations,
  buildTopLevelAgentClassConfig,
  defaultSeedAiModelsDependencies,
  seedAiModels: runSeedAiModels,
} = seedAiModelsModule;
const { PsAiModel } = aiModelModule;
const { PsAgentClass } = agentClassModule;
const { User } = userModule;
const { Group } = groupModule;
const { sequelize } = sequelizeModule;

type TestLogger = {
  infos: unknown[];
  errors: unknown[];
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
};

const tempDirs: string[] = [];

const createTempDir = () => {
  const dir = mkdtempSync(path.join(tmpdir(), "ps-tools-"));
  tempDirs.push(dir);
  return dir;
};

const createLogger = (): TestLogger => {
  const logger: TestLogger = {
    infos: [],
    errors: [],
    info: (...args) => logger.infos.push(args),
    error: (...args) => logger.errors.push(args),
  };
  return logger;
};

const withPatched = async <T>(
  target: object,
  key: string,
  value: unknown,
  callback: () => Promise<T> | T
): Promise<T> => {
  const record = target as Record<string, unknown>;
  const original = record[key];
  record[key] = value;
  try {
    return await callback();
  } finally {
    record[key] = original;
  }
};

const withPatchedValues = async <T>(
  patches: Array<{ target: object; key: string; value: unknown }>,
  callback: () => Promise<T> | T
): Promise<T> => {
  const originals = patches.map(({ target, key }) => ({
    target,
    key,
    value: (target as Record<string, unknown>)[key],
  }));
  for (const patch of patches) {
    (patch.target as Record<string, unknown>)[patch.key] = patch.value;
  }
  try {
    return await callback();
  } finally {
    for (const original of originals.reverse()) {
      (original.target as Record<string, unknown>)[original.key] =
        original.value;
    }
  }
};

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("tool CLI helpers", () => {
  it("detects ESM CLI entrypoints", () => {
    const modulePath = path.join(process.cwd(), "src/tools/example.ts");
    assert.equal(
      isCliEntrypoint(`file://${modulePath}`, ["node", modulePath]),
      true
    );
    assert.equal(
      isCliEntrypoint(`file://${modulePath}`, ["node", "other.ts"]),
      false
    );
    assert.equal(isCliEntrypoint(`file://${modulePath}`, ["node"]), false);
  });
});

describe("tool default dependency adapters", () => {
  it("delegates default tool adapters to DB model APIs", async () => {
    const aiFindOptions: unknown[] = [];
    const aiCreateValues: unknown[] = [];
    const classFindOptions: unknown[] = [];
    const classCreateValues: unknown[] = [];
    const userFindIds: unknown[] = [];
    const userFindOneOptions: unknown[] = [];
    const userCreateValues: unknown[] = [];
    const groupCreateValues: unknown[] = [];
    let closeCalls = 0;

    await withPatchedValues(
      [
        {
          target: PsAiModel,
          key: "findAll",
          value: async (options: unknown) => {
            aiFindOptions.push(options);
            return [{ id: 10 }];
          },
        },
        {
          target: PsAiModel,
          key: "create",
          value: async (values: unknown) => {
            aiCreateValues.push(values);
            return { id: 20 };
          },
        },
        {
          target: PsAgentClass,
          key: "findAll",
          value: async (options?: unknown) => {
            classFindOptions.push(options);
            return [{ id: 30 }];
          },
        },
        {
          target: PsAgentClass,
          key: "create",
          value: async (values: unknown) => {
            classCreateValues.push(values);
            return { id: 40 };
          },
        },
        {
          target: User,
          key: "findByPk",
          value: async (userId: unknown) => {
            userFindIds.push(userId);
            return { id: userId };
          },
        },
        {
          target: User,
          key: "findOne",
          value: async (options: unknown) => {
            userFindOneOptions.push(options);
            return { email: "user@example.com" };
          },
        },
        {
          target: User,
          key: "create",
          value: async (values: unknown) => {
            userCreateValues.push(values);
            return { id: 50 };
          },
        },
        {
          target: Group,
          key: "create",
          value: async (values: unknown) => {
            groupCreateValues.push(values);
            return { id: 60 };
          },
        },
        {
          target: sequelize,
          key: "close",
          value: async () => {
            closeCalls += 1;
          },
        },
      ],
      async () => {
        assert.deepEqual(
          await defaultAddAiModelDependencies.findModelsByName("GPT Adapter"),
          [{ id: 10 }]
        );
        assert.deepEqual(
          await defaultAddAiModelDependencies.createModel({
            name: "GPT Adapter",
            organization_id: 1,
            user_id: 2,
            configuration: { active: true } as PsAiModelConfiguration,
          }),
          { id: 20 }
        );

        assert.deepEqual(
          await defaultAddUserToAgentClassDependencies.findAgentClasses(
            "class-base"
          ),
          [{ id: 30 }]
        );
        assert.deepEqual(
          await defaultAddUserToAgentClassDependencies.findUserById(7),
          { id: 7 }
        );
        await defaultAddUserToAgentClassDependencies.closeDatabase();

        assert.deepEqual(
          await defaultAddUserToAllAgentClassesDependencies.findAllAgentClasses(),
          [{ id: 30 }]
        );
        assert.deepEqual(
          await defaultAddUserToAllAgentClassesDependencies.findUserByEmail(
            "user@example.com"
          ),
          { email: "user@example.com" }
        );
        await defaultAddUserToAllAgentClassesDependencies.closeDatabase();

        assert.deepEqual(
          await defaultSeedAiModelsDependencies.createUser({
            email: "seed@example.com",
            name: "Seed User",
          }),
          { id: 50 }
        );
        assert.deepEqual(
          await defaultSeedAiModelsDependencies.createAiModel({
            name: "Seed Model",
            organization_id: 1,
            user_id: 50,
            configuration: { active: true } as PsAiModelConfiguration,
          }),
          { id: 20 }
        );
        assert.deepEqual(
          await defaultSeedAiModelsDependencies.createGroup({
            name: "Seed Group",
            user_id: 50,
            configuration: {},
            private_access_configuration: [],
          }),
          { id: 60 }
        );
        assert.deepEqual(
          await defaultSeedAiModelsDependencies.createAgentClass({
            class_base_id: "seed-class",
            name: "Seed Class",
            version: 1,
            available: true,
            configuration: buildTopLevelAgentClassConfig(),
            user_id: 50,
          }),
          { id: 40 }
        );
      }
    );

    assert.deepEqual(aiFindOptions, [{ where: { name: "GPT Adapter" } }]);
    assert.deepEqual(classFindOptions, [
      { where: { class_base_id: "class-base" } },
      undefined,
    ]);
    assert.deepEqual(userFindIds, [7]);
    assert.deepEqual(userFindOneOptions, [
      { where: { email: "user@example.com" } },
    ]);
    assert.equal(aiCreateValues.length, 2);
    assert.equal(userCreateValues.length, 1);
    assert.equal(groupCreateValues.length, 1);
    assert.equal(classCreateValues.length, 1);
    assert.equal(closeCalls, 2);
  });
});

describe("addNewAiModel tool", () => {
  it("parses and validates add-model arguments", () => {
    const parsed = parseAddAiModelArgs([
      "GPT Test",
      "1",
      "2",
      PsAiModelType.Text,
      PsAiModelSize.Medium,
      "openai",
      "3",
      "4",
      "1.5",
      "USD",
      "8192",
      "0.2",
      "gpt-test",
      "true",
      "2",
      "1.25",
    ]);

    assert.deepEqual(parsed, {
      name: "GPT Test",
      organizationId: 1,
      userId: 2,
      type: PsAiModelType.Text,
      modelSize: PsAiModelSize.Medium,
      provider: "openai",
      accountingVersion: 2,
      cacheWriteInputCostMultiplier: 1.25,
      costInTokensPerMillion: 3,
      costOutTokensPerMillion: 4,
      costInCachedContextTokensPerMillion: 1.5,
      currency: "USD",
      maxTokensOut: 8192,
      defaultTemperature: 0.2,
      model: "gpt-test",
      active: true,
    });
    assert.equal(
      parseAddAiModelArgs([
        "GPT Test",
        "1",
        "2",
        PsAiModelType.Text,
        PsAiModelSize.Medium,
        "openai",
        "3",
        "4",
        "1.5",
        "USD",
        "8192",
        "0.2",
        "gpt-test",
        "false",
      ]).active,
      false
    );
    assert.throws(() => parseAddAiModelArgs([]), /Usage:/);
    assert.throws(
      () =>
        parseAddAiModelArgs([
          "GPT Test",
          "1",
          "2",
          "bad",
          PsAiModelSize.Medium,
          "openai",
          "3",
          "4",
          "1.5",
          "USD",
          "8192",
          "0.2",
          "gpt-test",
          "true",
        ]),
      /Invalid AI model type/
    );
    assert.throws(
      () =>
        parseAddAiModelArgs([
          "GPT Test",
          "1",
          "2",
          PsAiModelType.Text,
          "bad",
          "openai",
          "3",
          "4",
          "1.5",
          "USD",
          "8192",
          "0.2",
          "gpt-test",
          "true",
        ]),
      /Invalid AI model size/
    );
    assert.throws(
      () =>
        parseAddAiModelArgs([
          "GPT Test",
          "1",
          "2",
          PsAiModelType.Text,
          PsAiModelSize.Medium,
          "openai",
          "3",
          "4",
          "1.5",
          "USD",
          "8192",
          "0.2",
          "gpt-test",
          "true",
          "3",
        ]),
      /Invalid accounting version/
    );
    assert.throws(
      () =>
        parseAddAiModelArgs([
          "GPT Test",
          "1",
          "2",
          PsAiModelType.Text,
          PsAiModelSize.Medium,
          "openai",
          "3",
          "4",
          "1.5",
          "USD",
          "8192",
          "0.2",
          "gpt-test",
          "true",
          "2",
          "invalid",
        ]),
      /Invalid cache-write input cost multiplier/
    );
  });

  it("deactivates old models and creates the requested model", async () => {
    const logger = createLogger();
    const changedCalls: string[] = [];
    let saved = 0;
    const createdModels: unknown[] = [];
    const dependencies: AddAiModelDependencies = {
      connectToDatabase: async () => undefined,
      initializeModels: async () => undefined,
      findModelsByName: async () => [
        {
          id: 1,
          configuration: { active: true } as PsAiModelConfiguration,
          changed: (key, value) => changedCalls.push(`${key}:${value}`),
          save: async () => {
            saved += 1;
          },
        },
      ],
      createModel: async (values) => {
        createdModels.push(values);
        return { id: 2 };
      },
      logger,
    };

    await deactivateExistingModels("GPT Test", dependencies);
    assert.deepEqual(changedCalls, ["configuration:true"]);
    assert.equal(saved, 1);
    await deactivateExistingModels("No Existing", {
      ...dependencies,
      findModelsByName: async () => [],
    });

    const model = await addAiModel(
      {
        name: "GPT Test",
        organizationId: 1,
        userId: 2,
        type: PsAiModelType.Text,
        modelSize: PsAiModelSize.Small,
        provider: "openai",
        accountingVersion: 2,
        cacheWriteInputCostMultiplier: 1.25,
        costInTokensPerMillion: 1,
        costOutTokensPerMillion: 2,
        costInCachedContextTokensPerMillion: 0.5,
        currency: "USD",
        maxTokensOut: 4096,
        defaultTemperature: 0.1,
        model: "gpt-test",
        active: true,
      },
      dependencies
    );

    assert.deepEqual(model, { id: 2 });
    assert.equal(createdModels.length, 1);
    assert.equal(
      (
        createdModels[0] as {
          configuration: PsAiModelConfiguration;
        }
      ).configuration.prices.costInCachedContextTokensPerMillion,
      0.5
    );
    assert.equal(
      (
        createdModels[0] as {
          configuration: PsAiModelConfiguration;
        }
      ).configuration.accountingVersion,
      2
    );
    assert.equal(
      (
        createdModels[0] as {
          configuration: PsAiModelConfiguration;
        }
      ).configuration.prices.cacheWriteInputCostMultiplier,
      1.25
    );
  });

  it("logs add-model failures without throwing from the tool function", async () => {
    const logger = createLogger();
    const result = await addAiModel(
      {
        name: "Bad",
        organizationId: 1,
        userId: 2,
        type: PsAiModelType.Text,
        modelSize: PsAiModelSize.Small,
        provider: "openai",
        costInTokensPerMillion: 1,
        costOutTokensPerMillion: 2,
        costInCachedContextTokensPerMillion: 0.5,
        currency: "USD",
        maxTokensOut: 4096,
        defaultTemperature: 0.1,
        model: "bad",
        active: false,
      },
      {
        connectToDatabase: async () => {
          throw new Error("db unavailable");
        },
        initializeModels: async () => undefined,
        findModelsByName: async () => [],
        createModel: async () => ({ id: 1 }),
        logger,
      }
    );

    assert.equal(result, undefined);
    assert.match(String((logger.errors[0] as unknown[])[0]), /Error adding AI model/);
  });

  it("runs the add-model CLI wrapper on valid args", async () => {
    const logger = createLogger();
    const createdModels: unknown[] = [];
    const dependencies: AddAiModelDependencies = {
      connectToDatabase: async () => undefined,
      initializeModels: async () => undefined,
      findModelsByName: async () => [],
      createModel: async (values) => {
        createdModels.push(values);
        return { id: 10 };
      },
      logger,
    };

    await runAddAiModelCli(
      [
        "GPT CLI",
        "1",
        "2",
        PsAiModelType.Text,
        PsAiModelSize.Small,
        "openai",
        "1",
        "2",
        "0.5",
        "USD",
        "1000",
        "0",
        "gpt-cli",
        "false",
      ],
      dependencies
    );

    assert.equal(createdModels.length, 1);
  });

  it("exits the add-model CLI wrapper on invalid args", async () => {
    const logger = createLogger();
    const dependencies: AddAiModelDependencies = {
      connectToDatabase: async () => undefined,
      initializeModels: async () => undefined,
      findModelsByName: async () => [],
      createModel: async () => ({ id: 1 }),
      logger,
    };

    await withPatched(
      process,
      "exit",
      (code?: number | string | null) => {
        throw new Error(`exit ${code}`);
      },
      async () => {
        await assert.rejects(
          () => runAddAiModelCli([], dependencies),
          /exit 1/
        );
      }
    );
    assert.match(String((logger.errors[0] as unknown[])[0]), /Usage:/);
  });

  it("logs non-Error add-model CLI failures before exiting", async () => {
    const logger = createLogger();
    const dependencies: AddAiModelDependencies = {
      connectToDatabase: async () => undefined,
      initializeModels: async () => undefined,
      findModelsByName: async () => [],
      createModel: async () => ({ id: 1 }),
      logger,
    };
    const rawFailureArgs = {
      length: 14,
      [Symbol.iterator]: () => ({
        next: () => {
          throw "raw cli failure";
        },
      }),
    } as unknown as string[];

    await withPatched(
      process,
      "exit",
      (code?: number | string | null) => {
        throw new Error(`exit ${code}`);
      },
      async () => {
        await assert.rejects(
          () => runAddAiModelCli(rawFailureArgs, dependencies),
          /exit 1/
        );
      }
    );
    assert.equal((logger.errors[0] as unknown[])[0], "raw cli failure");
  });
});

describe("add user tools", () => {
  it("parses add-user argument variants", () => {
    assert.deepEqual(parseAddUserToAgentClassesArgs(["base", "7", "admin"]), {
      agentClassBaseId: "base",
      userId: 7,
      role: "admin",
    });
    assert.throws(() => parseAddUserToAgentClassesArgs([]), /Usage:/);
    assert.throws(
      () => parseAddUserToAgentClassesArgs(["base", "7", "owner"]),
      /Role must/
    );

    assert.deepEqual(parseAddUserToAllAgentClassesArgs(["user@example.com"]), {
      userEmail: "user@example.com",
    });
    assert.throws(() => parseAddUserToAllAgentClassesArgs([]), /Usage:/);
  });

  it("adds a user or admin to selected agent classes", async () => {
    const logger = createLogger();
    const calls: string[] = [];
    let closeCalls = 0;
    const dependencies: AddUserToAgentClassDependencies = {
      initializeModels: async () => undefined,
      findAgentClasses: async () => [
        {
          id: 1,
          hasUser: async () => false,
          hasAdmin: async () => false,
          addUser: async () => calls.push("addUser:1"),
          addAdmin: async () => calls.push("addAdmin:1"),
        },
        {
          id: 2,
          hasUser: async () => true,
          hasAdmin: async () => true,
          addUser: async () => calls.push("addUser:2"),
          addAdmin: async () => calls.push("addAdmin:2"),
        },
      ],
      findUserById: async () => ({ id: 7 }),
      closeDatabase: async () => {
        closeCalls += 1;
      },
      logger,
    };

    await addUserToAgentClasses("base", 7, "user", dependencies);
    await addUserToAgentClasses("base", 7, "admin", dependencies);

    assert.deepEqual(calls, ["addUser:1", "addAdmin:1"]);
    assert.equal(closeCalls, 2);
    assert.ok(
      logger.infos.some((entry) =>
        String((entry as unknown[])[0]).includes("already has admin access")
      )
    );
  });

  it("handles missing selected classes/users and caught errors", async () => {
    const logger = createLogger();
    let closeCalls = 0;
    const baseDependencies: AddUserToAgentClassDependencies = {
      initializeModels: async () => undefined,
      findAgentClasses: async () => [],
      findUserById: async () => ({ id: 7 }),
      closeDatabase: async () => {
        closeCalls += 1;
      },
      logger,
    };

    await addUserToAgentClasses("missing", 7, "user", baseDependencies);
    assert.match(String((logger.errors[0] as unknown[])[0]), /No agent classes/);

    await addUserToAgentClasses("base", 7, "user", {
      ...baseDependencies,
      findAgentClasses: async () => [
        {
          id: 1,
          hasUser: async () => false,
          hasAdmin: async () => false,
          addUser: async () => undefined,
          addAdmin: async () => undefined,
        },
      ],
      findUserById: async () => null,
    });
    assert.match(String((logger.errors[1] as unknown[])[0]), /User not found/);

    await addUserToAgentClasses("base", 7, "user", {
      ...baseDependencies,
      initializeModels: async () => {
        throw new Error("init failed");
      },
    });
    assert.match(
      String((logger.errors.at(-1) as unknown[])[0]),
      /Error adding user/
    );
    assert.equal(closeCalls, 3);
  });

  it("runs selected-user CLI wrapper on valid args", async () => {
    let addCalls = 0;
    await runAddUserToAgentClassesCli(["base", "7", "user"], {
      initializeModels: async () => undefined,
      findAgentClasses: async () => [
        {
          id: 1,
          hasUser: async () => false,
          hasAdmin: async () => false,
          addUser: async () => {
            addCalls += 1;
          },
          addAdmin: async () => undefined,
        },
      ],
      findUserById: async () => ({ id: 7 }),
      closeDatabase: async () => undefined,
      logger: createLogger(),
    });
    assert.equal(addCalls, 1);
  });

  it("exits selected-user CLI wrapper on invalid args", async () => {
    const logger = createLogger();
    const dependencies: AddUserToAgentClassDependencies = {
      initializeModels: async () => undefined,
      findAgentClasses: async () => [],
      findUserById: async () => null,
      closeDatabase: async () => undefined,
      logger,
    };

    await withPatched(
      process,
      "exit",
      (code?: number | string | null) => {
        throw new Error(`exit ${code}`);
      },
      async () => {
        await assert.rejects(
          () => runAddUserToAgentClassesCli([], dependencies),
          /exit 1/
        );
      }
    );
    assert.match(String((logger.errors[0] as unknown[])[0]), /Usage:/);
  });

  it("logs non-Error selected-user CLI failures before exiting", async () => {
    const logger = createLogger();
    const dependencies: AddUserToAgentClassDependencies = {
      initializeModels: async () => undefined,
      findAgentClasses: async () => [],
      findUserById: async () => null,
      closeDatabase: async () => undefined,
      logger,
    };
    const rawFailureArgs = {
      length: 3,
      [Symbol.iterator]: () => ({
        next: () => {
          throw "raw selected-user failure";
        },
      }),
    } as unknown as string[];

    await withPatched(
      process,
      "exit",
      (code?: number | string | null) => {
        throw new Error(`exit ${code}`);
      },
      async () => {
        await assert.rejects(
          () => runAddUserToAgentClassesCli(rawFailureArgs, dependencies),
          /exit 1/
        );
      }
    );
    assert.equal(
      (logger.errors[0] as unknown[])[0],
      "raw selected-user failure"
    );
  });

  it("adds a user and admin to all agent classes", async () => {
    const logger = createLogger();
    const calls: string[] = [];
    let closeCalls = 0;
    const dependencies: AddUserToAllAgentClassesDependencies = {
      initializeModels: async () => undefined,
      findAllAgentClasses: async () => [
        {
          id: 1,
          hasUser: async () => false,
          hasAdmin: async () => false,
          addUser: async () => calls.push("addUser"),
          addAdmin: async () => calls.push("addAdmin"),
        },
        {
          id: 2,
          hasUser: async () => true,
          hasAdmin: async () => true,
          addUser: async () => calls.push("skipUser"),
          addAdmin: async () => calls.push("skipAdmin"),
        },
      ],
      findUserByEmail: async (email) => ({ email }),
      closeDatabase: async () => {
        closeCalls += 1;
      },
      logger,
    };

    await addUserToAllAgentClasses("user@example.com", dependencies);

    assert.deepEqual(calls, ["addUser", "addAdmin"]);
    assert.equal(closeCalls, 1);
    assert.ok(
      logger.infos.some((entry) =>
        String((entry as unknown[])[0]).includes("already has admin access")
      )
    );
  });

  it("handles missing all-class data and caught errors", async () => {
    const logger = createLogger();
    let closeCalls = 0;
    const baseDependencies: AddUserToAllAgentClassesDependencies = {
      initializeModels: async () => undefined,
      findAllAgentClasses: async () => [],
      findUserByEmail: async (email) => ({ email }),
      closeDatabase: async () => {
        closeCalls += 1;
      },
      logger,
    };

    await addUserToAllAgentClasses("user@example.com", baseDependencies);
    assert.match(String((logger.errors[0] as unknown[])[0]), /No agent classes/);

    await addUserToAllAgentClasses("user@example.com", {
      ...baseDependencies,
      findAllAgentClasses: async () => [
        {
          id: 1,
          hasUser: async () => false,
          hasAdmin: async () => false,
          addUser: async () => undefined,
          addAdmin: async () => undefined,
        },
      ],
      findUserByEmail: async () => null,
    });
    assert.match(String((logger.errors[1] as unknown[])[0]), /User not found/);

    await addUserToAllAgentClasses("user@example.com", {
      ...baseDependencies,
      initializeModels: async () => {
        throw new Error("init failed");
      },
    });
    assert.match(
      String((logger.errors.at(-1) as unknown[])[0]),
      /Error adding user/
    );
    assert.equal(closeCalls, 3);
  });

  it("runs all-classes CLI wrapper on valid args", async () => {
    let addCalls = 0;
    await runAddUserToAllAgentClassesCli(["user@example.com"], {
      initializeModels: async () => undefined,
      findAllAgentClasses: async () => [
        {
          id: 1,
          hasUser: async () => false,
          hasAdmin: async () => true,
          addUser: async () => {
            addCalls += 1;
          },
          addAdmin: async () => undefined,
        },
      ],
      findUserByEmail: async (email) => ({ email }),
      closeDatabase: async () => undefined,
      logger: createLogger(),
    });
    assert.equal(addCalls, 1);
  });

  it("exits all-classes CLI wrapper on invalid args", async () => {
    const logger = createLogger();
    const dependencies: AddUserToAllAgentClassesDependencies = {
      initializeModels: async () => undefined,
      findAllAgentClasses: async () => [],
      findUserByEmail: async () => null,
      closeDatabase: async () => undefined,
      logger,
    };

    await withPatched(
      process,
      "exit",
      (code?: number | string | null) => {
        throw new Error(`exit ${code}`);
      },
      async () => {
        await assert.rejects(
          () => runAddUserToAllAgentClassesCli([], dependencies),
          /exit 1/
        );
      }
    );
    assert.match(String((logger.errors[0] as unknown[])[0]), /Usage:/);
  });

  it("logs non-Error all-classes CLI failures before exiting", async () => {
    const logger = createLogger();
    const dependencies: AddUserToAllAgentClassesDependencies = {
      initializeModels: async () => undefined,
      findAllAgentClasses: async () => [],
      findUserByEmail: async () => null,
      closeDatabase: async () => undefined,
      logger,
    };
    const rawFailureArgs = {
      length: 1,
      get 0() {
        throw "raw all-classes failure";
      },
    } as unknown as string[];

    await withPatched(
      process,
      "exit",
      (code?: number | string | null) => {
        throw new Error(`exit ${code}`);
      },
      async () => {
        await assert.rejects(
          () => runAddUserToAllAgentClassesCli(rawFailureArgs, dependencies),
          /exit 1/
        );
      }
    );
    assert.equal((logger.errors[0] as unknown[])[0], "raw all-classes failure");
  });
});

describe("generateDocumentation tool", () => {
  const createRuntime = (rootDir: string, logger = createLogger()) => {
    const runtime = createDocumentationRuntime(rootDir, {
      chat: {
        completions: {
          create: async () => ({
            choices: [{ message: { content: "```markdown\n# Generated\n" } }],
          }),
        },
      },
    });
    return { ...runtime, logger } satisfies DocumentationRuntime;
  };

  it("builds trees, markdown, checksums, and prompts", () => {
    const rootDir = createTempDir();
    const docsDir = path.join(rootDir, "docs");
    mkdirSync(path.join(docsDir, "src", "base"), { recursive: true });
    writeFileSync(path.join(docsDir, "src", "base", "Agent.md"), "# Agent");
    writeFileSync(path.join(docsDir, "README.md"), "old");
    writeFileSync(path.join(docsDir, "skip.d.ts"), "skip");

    const tree = buildDirectoryTree(docsDir);
    assert.deepEqual(tree, [
      {
        type: "directory",
        name: "base",
        path: "base",
        children: [{ type: "file", name: "Agent.md", path: "Agent.md" }],
      },
    ]);
    assert.equal(
      generateMarkdownFromTree(tree),
      "- base\n  - [Agent](src/base/Agent.md)\n"
    );
    assert.equal(generateChecksum("abc").length, 64);
    assert.match(
      renderSystemPrompt("/root/src/base/Agent.ts", "type A = string"),
      /AllTypeDefsUsedInProject/
    );
  });

  it("finds source files and generates docs only when checksums change", async () => {
    const rootDir = createTempDir();
    mkdirSync(path.join(rootDir, "src", "nested"), { recursive: true });
    mkdirSync(path.join(rootDir, "src", "node_modules"), { recursive: true });
    writeFileSync(path.join(rootDir, "src", "agent.ts"), "export const a = 1;");
    writeFileSync(path.join(rootDir, "src", "index.ts"), "export {};");
    writeFileSync(path.join(rootDir, "src", "types.d.ts"), "type T = string;");
    writeFileSync(path.join(rootDir, "src", "nested", "worker.ts"), "export {};");
    writeFileSync(
      path.join(rootDir, "src", "node_modules", "ignored.ts"),
      "export {};"
    );
    const logger = createLogger();
    const runtime = createRuntime(rootDir, logger);

    assert.deepEqual(
      findTSFiles(path.join(rootDir, "src")).map((file) =>
        path.relative(rootDir, file)
      ),
      ["src/agent.ts", "src/nested/worker.ts"]
    );
    assert.equal(getAllTypeDefContents(runtime), "type T = string;");

    await generateDocumentation([path.join(rootDir, "src", "agent.ts")], runtime);
    const docPath = path.join(rootDir, "docs", "src", "agent.md");
    assert.equal(readFileSync(docPath, "utf8"), "# Generated\n");
    const generatedCount = logger.infos.length;

    await generateDocumentation([path.join(rootDir, "src", "agent.ts")], runtime);
    assert.ok(logger.infos.length > generatedCount);
    assert.ok(
      logger.infos.some((entry) =>
        String((entry as unknown[])[0]).includes("Skipping documentation")
      )
    );

    generateDocsReadme(runtime);
    assert.match(
      readFileSync(path.join(rootDir, "docs", "README.md"), "utf8"),
      /Policy Agents API Documentation/
    );

    await generateDocumentationMain(runtime);
    assert.match(
      readFileSync(path.join(rootDir, "docs", "README.md"), "utf8"),
      /Policy Agents API Documentation/
    );

    await runGenerateDocumentationCli(runtime);
    assert.ok(
      logger.infos.some((entry) =>
        String((entry as unknown[])[0]).includes(
          "Documentation generation complete"
        )
      )
    );
  });

  it("does not write docs or checksums when generation returns no content", async () => {
    const rootDir = createTempDir();
    mkdirSync(path.join(rootDir, "src"), { recursive: true });
    writeFileSync(path.join(rootDir, "src", "empty.ts"), "export const empty = true;");
    const logger = createLogger();
    const runtime = {
      ...createDocumentationRuntime(rootDir, {
        chat: {
          completions: {
            create: async () => ({
              choices: [{ message: { content: null } }],
            }),
          },
        },
      }),
      logger,
    } satisfies DocumentationRuntime;

    const originalExit = process.exit;
    try {
      (process as unknown as { exit: (code?: number | string | null) => never })
        .exit = (code?: number | string | null) => {
        throw new Error(`exit ${code}`);
      };

      await assert.rejects(
        () => generateDocumentation([path.join(rootDir, "src", "empty.ts")], runtime),
        /exit 1/
      );
    } finally {
      (process as unknown as { exit: typeof originalExit }).exit = originalExit;
    }

    assert.equal(
      runtime.fs.existsSync(path.join(rootDir, "docs", "src", "empty.md")),
      false
    );
    assert.equal(
      runtime.fs.existsSync(path.join(rootDir, "docs", "checksums", "empty.ts.cks")),
      false
    );
    assert.match(
      String((logger.errors[0] as unknown[])[1]),
      /returned no content/
    );
  });
});

describe("seedAiModels tool", () => {
  it("builds seed configurations and creates seed records through dependencies", async () => {
    const configs = buildSeedAiModelConfigurations();
    assert.equal(configs.openAiGpt54Config.model, "gpt-5.4");
    assert.equal(buildTopLevelAgentClassConfig().queueName, "noqueue");

    const createdAiModels: Array<{ name: string; id: number }> = [];
    let nextId = 10;
    let groupPrivateAccessCount = 0;
    const dependencies: SeedAiModelsDependencies = {
      connectToDatabase: async () => undefined,
      initializeModels: async () => undefined,
      createUser: async () => ({ id: 1 }),
      createAiModel: async (values) => {
        const record = { name: values.name, id: nextId };
        nextId += 1;
        createdAiModels.push(record);
        return record;
      },
      createGroup: async (values) => {
        groupPrivateAccessCount = values.private_access_configuration.length;
        return { id: 99 };
      },
      createAgentClass: async (values) => {
        assert.equal(values.name, "Operations");
        assert.equal(values.configuration.category, "policySynthTopLevel");
        return { id: 100 };
      },
      env: {
        OPENAI_API_KEY: "openai-key",
        ANTHROPIC_CLAUDE_API_KEY: "anthropic-key",
      },
    };

    const result = await runSeedAiModels(dependencies);

    assert.deepEqual(
      createdAiModels.map((model) => model.name),
      [
        "Anthropic Sonnet 3.5",
        "GPT-4o",
        "GPT-4o Mini",
        "GPT-5.4",
        "GPT-5.4 Pro",
      ]
    );
    assert.equal(groupPrivateAccessCount, 5);
    assert.equal(result.aiModels.length, 5);
  });

  it("seeds empty private access keys when API key env values are absent", async () => {
    const privateAccessKeys: string[] = [];
    const dependencies: SeedAiModelsDependencies = {
      connectToDatabase: async () => undefined,
      initializeModels: async () => undefined,
      createUser: async () => ({ id: 1 }),
      createAiModel: async () => ({ id: privateAccessKeys.length + 10 }),
      createGroup: async (values) => {
        privateAccessKeys.push(
          ...values.private_access_configuration.map((entry) => entry.apiKey)
        );
        return { id: 99 };
      },
      createAgentClass: async () => ({ id: 100 }),
      env: {},
    };

    await runSeedAiModels(dependencies);

    assert.deepEqual(privateAccessKeys, ["", "", "", "", ""]);
  });
});
