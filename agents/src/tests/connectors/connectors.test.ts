import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { after, describe, it } from "node:test";
import type { PsConnectorClassTypes as PsConnectorClassType } from "../../connectorTypes.js";

process.env.NODE_ENV = "test";
process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";
process.env.DISABLE_AGENT_STATUS ??= "true";

const [
  { sequelize },
  { PsAgent },
  { PsBaseConnector },
  { PsConnectorFactory },
  { PsBaseIdeasCollaborationConnector },
  { PsSubAgentsConnector },
  { PsGoogleDocsConnector },
  { PsGoogleSheetsConnector },
  { PsYourPrioritiesConnector },
  { PsAllOurIdeasConnector },
  { PsBaseDiscordConnector },
  { PsGoogleDriveConnector },
  { PsConnectorClassTypes },
  { default: axios },
  { ChannelType },
] = await Promise.all([
  import("../../dbModels/sequelize.js"),
  import("../../dbModels/agent.js"),
  import("../../connectors/base/baseConnector.js"),
  import("../../connectors/base/connectorFactory.js"),
  import("../../connectors/base/baseIdeasCollaborationConnector.js"),
  import("../../connectors/agents/subAgentsConnector.js"),
  import("../../connectors/documents/googleDocsConnector.js"),
  import("../../connectors/sheets/googleSheetsConnector.js"),
  import("../../connectors/collaboration/yourPrioritiesConnector.js"),
  import("../../connectors/collaboration/allOurIdeasConnector.js"),
  import("../../connectors/notifications/discordConnector.js"),
  import("../../connectors/drive/googleDrive.js"),
  import("../../connectorTypes.js"),
  import("axios"),
  import("discord.js"),
]);

type PsAgentInstance = InstanceType<typeof PsAgent>;
type GoogleDocsConnectorInstance = InstanceType<typeof PsGoogleDocsConnector>;
type GoogleSheetsConnectorInstance = InstanceType<typeof PsGoogleSheetsConnector>;
type GoogleDriveConnectorInstance = InstanceType<typeof PsGoogleDriveConnector>;
type YourPrioritiesConnectorInstance = InstanceType<
  typeof PsYourPrioritiesConnector
>;
type AllOurIdeasConnectorInstance = InstanceType<typeof PsAllOurIdeasConnector>;
type DiscordConnectorInstance = InstanceType<typeof PsBaseDiscordConnector>;

type AxiosResponseLike = {
  data?: unknown;
  headers?: Record<string, string | string[] | undefined>;
};

type AxiosClientStub = {
  post: (
    url: string,
    data?: unknown,
    config?: unknown
  ) => Promise<AxiosResponseLike>;
  get: (url: string, config?: unknown) => Promise<AxiosResponseLike>;
  isAxiosError: (payload: unknown) => boolean;
};

const axiosClient = axios as unknown as AxiosClientStub;

const fixedDate = new Date("2025-01-01T00:00:00.000Z");

const { privateKey } = generateKeyPairSync("rsa", {
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

const googleCredentials = {
  client_email: "service-account@example.com",
  private_key: privateKey,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasKey = <K extends string>(
  value: unknown,
  key: K
): value is Record<K, unknown> => isRecord(value) && key in value;

const asRecord = (value: unknown): Record<string, unknown> => {
  if (!isRecord(value)) {
    throw new Error("Expected a record");
  }
  return value;
};

const restoreEnv = (key: string, value: string | undefined) => {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
};

const withAxiosStub = async <T>(
  stubs: Partial<AxiosClientStub>,
  callback: () => Promise<T>
): Promise<T> => {
  const originalPost = axiosClient.post;
  const originalGet = axiosClient.get;
  const originalIsAxiosError = axiosClient.isAxiosError;
  if (stubs.post) axiosClient.post = stubs.post;
  if (stubs.get) axiosClient.get = stubs.get;
  if (stubs.isAxiosError) axiosClient.isAxiosError = stubs.isAxiosError;
  try {
    return await callback();
  } finally {
    axiosClient.post = originalPost;
    axiosClient.get = originalGet;
    axiosClient.isAxiosError = originalIsAxiosError;
  }
};

const withImmediateTimers = async <T>(
  callback: () => Promise<T>
): Promise<T> => {
  const timerGlobal = globalThis as unknown as {
    setTimeout: typeof setTimeout;
  };
  const originalSetTimeout = timerGlobal.setTimeout;
  timerGlobal.setTimeout = ((
    handler: (...args: unknown[]) => void,
    _timeout?: number,
    ...args: unknown[]
  ) => {
    handler(...args);
    return {
      ref: () => undefined,
      unref: () => undefined,
    } as unknown as NodeJS.Timeout;
  }) as typeof setTimeout;
  try {
    return await callback();
  } finally {
    timerGlobal.setTimeout = originalSetTimeout;
  }
};

const createMemory = (): PsAgentMemoryData => ({} as PsAgentMemoryData);

const createAgent = (
  overrides: Partial<PsAgentAttributes> = {}
): PsAgentInstance => {
  const agent = PsAgent.build({
    id: 100,
    uuid: "00000000-0000-4000-8000-000000000100",
    user_id: 1,
    class_id: 2,
    group_id: 3,
    configuration: { name: "Test agent" } as PsBaseNodeConfiguration,
  });
  Object.assign(agent, overrides);
  return agent;
};

const createConnectorClass = (
  classType: PsConnectorClassType | string,
  name: string,
  id = 200
): PsAgentConnectorClassAttributes => ({
  id,
  uuid: `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`,
  user_id: 1,
  created_at: fixedDate,
  updated_at: fixedDate,
  name,
  class_base_id: `class-base-${id}`,
  version: 1,
  available: true,
  configuration: {
    name,
    classType: classType as PsConnectorClassType,
    description: `${name} description`,
    imageUrl: "",
    iconName: "connector",
    questions: [],
    hasPublicAccess: true,
  },
});

const createConnector = (
  configuration: Record<string, unknown> = {},
  connectorClass?: PsAgentConnectorClassAttributes,
  id = 300
): PsAgentConnectorAttributes => ({
  id,
  uuid: `00000000-0000-4000-8000-${String(id).padStart(12, "0")}`,
  user_id: 1,
  created_at: fixedDate,
  updated_at: fixedDate,
  class_id: connectorClass?.id ?? 200,
  group_id: 3,
  Class: connectorClass,
  configuration: {
    name: "Test connector",
    permissionNeeded: "readWrite",
    ...configuration,
  } as PsAgentConnectorsBaseConfiguration,
});

class TestBaseConnector extends PsBaseConnector {
  retryForTest<T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    delay?: number
  ): Promise<T> {
    return this.retryOperation(operation, maxRetries, delay);
  }
}

class ConnectorWithExtraQuestions extends TestBaseConnector {
  static override getExtraConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      {
        uniqueId: "extra",
        text: "Extra",
        type: "textField",
        required: true,
      },
    ];
  }
}

class TestIdeasConnector extends PsBaseIdeasCollaborationConnector {
  async login(): Promise<void> {}

  async post(
    _groupId: number,
    _name: string,
    _structuredAnswersData: YpStructuredAnswer[],
    _imagePrompt: string,
    _imageLocalPath: string | undefined
  ): Promise<YpPostData> {
    return { id: 1 } as YpPostData;
  }

  async vote(_itemId: number, _value: number): Promise<void> {}

  async postPoint(
    _groupId: number,
    _postId: number,
    _userId: number,
    _value: number,
    _content: string
  ): Promise<YpPointData> {
    return { id: 1 } as YpPointData;
  }

  async getGroupPosts(_groupId: number): Promise<YpPostData[]> {
    return [];
  }
}

type DocsBatchUpdateParams = {
  documentId?: string;
  requestBody?: {
    requests?: unknown[];
  };
};

type MockGoogleDocumentsApi = {
  get: (params: { documentId?: string }) => Promise<{ data: unknown }>;
  batchUpdate: (params: DocsBatchUpdateParams) => Promise<unknown>;
};

const setMockDocs = (
  connector: GoogleDocsConnectorInstance,
  documents: MockGoogleDocumentsApi
) => {
  (connector as unknown as { docs: { documents: MockGoogleDocumentsApi } }).docs =
    {
      documents,
    };
};

const createGoogleDocsConnector = (
  configuration: Record<string, unknown> = {}
): GoogleDocsConnectorInstance => {
  const connectorClass = createConnectorClass(
    PsConnectorClassTypes.Document,
    "Google Docs",
    401
  );
  return new PsGoogleDocsConnector(
    createConnector(
      {
        googleDocsId: "doc-1",
        credentialsJson: googleCredentials,
        ...configuration,
      },
      connectorClass,
      501
    ),
    connectorClass,
    createAgent(),
    createMemory()
  );
};

type SheetsApiParams = Record<string, unknown>;

type MockGoogleSheetsApi = {
  spreadsheets: {
    get: (params: SheetsApiParams) => Promise<{ data: unknown }>;
    batchUpdate: (params: SheetsApiParams) => Promise<unknown>;
    values: {
      get: (params: SheetsApiParams) => Promise<{ data: { values?: string[][] } }>;
      update: (params: SheetsApiParams) => Promise<unknown>;
      clear: (params: SheetsApiParams) => Promise<unknown>;
    };
  };
};

const setMockSheets = (
  connector: GoogleSheetsConnectorInstance,
  sheets: MockGoogleSheetsApi
) => {
  (connector as unknown as { sheets: MockGoogleSheetsApi }).sheets = sheets;
};

type MockGoogleDriveApi = {
  files: {
    list: (params: Record<string, unknown>) => Promise<{ data: unknown }>;
    get: (params: Record<string, unknown>) => Promise<{ data: unknown }>;
    create: (params: Record<string, unknown>) => Promise<{ data: unknown }>;
    update: (params: Record<string, unknown>) => Promise<{ data: unknown }>;
    delete: (params: Record<string, unknown>) => Promise<unknown>;
  };
};

const setMockDrive = (
  connector: GoogleDriveConnectorInstance,
  drive: MockGoogleDriveApi
) => {
  (connector as unknown as { drive: MockGoogleDriveApi }).drive = drive;
};

const createGoogleSheetsConnector = (
  configuration: Record<string, unknown> = {}
): GoogleSheetsConnectorInstance => {
  const connectorClass = createConnectorClass(
    PsConnectorClassTypes.Spreadsheet,
    "Google Sheets",
    402
  );
  return new PsGoogleSheetsConnector(
    createConnector(
      {
        googleSheetsId: "sheet-1",
        credentialsJson: googleCredentials,
        ...configuration,
      },
      connectorClass,
      502
    ),
    connectorClass,
    createAgent(),
    createMemory()
  );
};

const createGoogleDriveConnector = (
  configuration: Record<string, unknown> = {}
): GoogleDriveConnectorInstance => {
  const connectorClass = createConnectorClass(
    PsConnectorClassTypes.Drive,
    "Google Drive",
    403
  );
  return new PsGoogleDriveConnector(
    createConnector(
      {
        credentialsJson: googleCredentials,
        ...configuration,
      },
      connectorClass,
      503
    ),
    connectorClass,
    createAgent(),
    createMemory()
  );
};

const createYourPrioritiesConnector = (
  configuration: Record<string, unknown> = {},
  agent: PsAgentInstance = createAgent()
): YourPrioritiesConnectorInstance => {
  const connectorClass = createConnectorClass(
    PsConnectorClassTypes.IdeasCollaboration,
    "Your Priorities",
    404
  );
  return new PsYourPrioritiesConnector(
    createConnector(
      {
        groupId: 12,
        userEmail: "agent@example.com",
        password: "secret",
        serverBaseUrl: "https://yp.example/api",
        ...configuration,
      },
      connectorClass,
      504
    ),
    connectorClass,
    agent,
    createMemory()
  );
};

const createAllOurIdeasConnector = (
  configuration: Record<string, unknown> = {}
): AllOurIdeasConnectorInstance => {
  const connectorClass = createConnectorClass(
    PsConnectorClassTypes.VotingCollaboration,
    "All Our Ideas",
    405
  );
  return new PsAllOurIdeasConnector(
    createConnector(
      {
        userEmail: "agent@example.com",
        password: "secret",
        serverBaseUrl: "https://aoi.example/api",
        ...configuration,
      },
      connectorClass,
      505
    ),
    connectorClass,
    createAgent(),
    createMemory()
  );
};

const createDiscordConnector = (
  configuration: Record<string, unknown> = {},
  memory: PsAgentMemoryData = createMemory(),
  actions: Record<string, () => Promise<void>> = {}
): DiscordConnectorInstance => {
  const connectorClass = createConnectorClass(
    PsConnectorClassTypes.NotificationsAndChat,
    "Discord",
    406
  );
  return new PsBaseDiscordConnector(
    createConnector(
      {
        discordBotToken: "discord-token",
        channelName: "research",
        ...configuration,
      },
      connectorClass,
      506
    ),
    connectorClass,
    createAgent(),
    memory,
    "System prompt",
    actions
  );
};

const getTextStyle = (request: unknown): Record<string, unknown> | undefined => {
  if (!hasKey(request, "updateTextStyle")) return undefined;
  const updateTextStyle = request.updateTextStyle;
  if (!hasKey(updateTextStyle, "textStyle")) return undefined;
  return asRecord(updateTextStyle.textStyle);
};

after(async () => {
  await sequelize.close();
});

describe("PsBaseConnector", () => {
  it("parses connector configuration values and preserves defaults", () => {
    const connectorClass = createConnectorClass(
      PsConnectorClassTypes.SubAgents,
      "Sub Agents Connector"
    );
    const connector = new TestBaseConnector(
      createConnector(
        {
          name: "Configured name",
          description: "",
          enabled: "TRUE",
          disabled: "false",
          count: "42",
          json: '{"items":["a","b"]}',
          object: { nested: true },
          blank: "   ",
          nullish: null,
          invalidJson: "{not-json}",
        },
        connectorClass
      ),
      connectorClass,
      createAgent(),
      createMemory()
    );

    assert.equal(connector.name, "Configured name");
    assert.equal(connector.description, "");
    assert.equal(connector.getConfig("enabled", false), true);
    assert.equal(connector.getConfig("disabled", true), false);
    assert.equal(connector.getConfig("count", 0), 42);
    assert.deepEqual(connector.getConfig("json", { items: [] }), {
      items: ["a", "b"],
    });
    assert.deepEqual(connector.getConfig("object", {}), { nested: true });
    assert.equal(connector.getConfig("blank", "fallback"), "fallback");
    assert.equal(connector.getConfig("nullish", "fallback"), "fallback");
    assert.equal(connector.getConfig("missing", "fallback"), "fallback");
    assert.equal(connector.getConfig("invalidJson", ""), "{not-json}");
  });

  it("merges standard and connector-specific configuration questions", () => {
    assert.deepEqual(PsBaseConnector.getExtraConfigurationQuestions(), []);
    assert.deepEqual(
      ConnectorWithExtraQuestions.getConfigurationQuestions().map(
        (question) => question.uniqueId
      ),
      ["name", "description", "extra"]
    );
  });

  it("retries operations until success and rethrows the last failure", async () => {
    const connectorClass = createConnectorClass(
      PsConnectorClassTypes.SubAgents,
      "Sub Agents Connector"
    );
    const connector = new TestBaseConnector(
      createConnector({}, connectorClass),
      connectorClass,
      createAgent(),
      createMemory()
    );

    let attempts = 0;
    const result = await connector.retryForTest(
      async () => {
        attempts += 1;
        if (attempts < 3) {
          throw new Error(`attempt ${attempts}`);
        }
        return "ok";
      },
      3,
      0
    );

    assert.equal(result, "ok");
    assert.equal(attempts, 3);

    let failedAttempts = 0;
    await assert.rejects(
      () =>
        connector.retryForTest(
          async () => {
            failedAttempts += 1;
            throw new Error("final failure");
          },
          2,
          0
        ),
      /final failure/
    );
    assert.equal(failedAttempts, 2);
  });
});

describe("PsBaseIdeasCollaborationConnector", () => {
  it("uses the shared unsupported image-generation default", async () => {
    const connectorClass = createConnectorClass(
      PsConnectorClassTypes.IdeasCollaboration,
      "Ideas Collaboration"
    );
    const connector = new TestIdeasConnector(
      createConnector({}, connectorClass),
      connectorClass,
      createAgent(),
      createMemory()
    );

    await assert.rejects(
      () => connector.generateImage!(1, "illustrate this"),
      /Image generation not supported/
    );
  });
});

describe("PsConnectorFactory", () => {
  it("creates sub-agent connectors and filters unsupported routes", () => {
    const memory = createMemory();
    const agent = createAgent();
    const subAgentsClass = createConnectorClass(
      PsConnectorClassTypes.SubAgents,
      "Sub Agents Connector",
      210
    );
    const subAgentsConnector = createConnector({}, subAgentsClass, 310);

    assert.ok(
      PsConnectorFactory.createConnector(
        subAgentsConnector,
        subAgentsClass,
        agent,
        memory
      ) instanceof PsSubAgentsConnector
    );

    const googleDocsClass = createConnectorClass(
      PsConnectorClassTypes.Document,
      "Google Docs",
      212
    );
    assert.ok(
      PsConnectorFactory.createConnector(
        createConnector(
          {
            googleDocsId: "doc-1",
            credentialsJson: googleCredentials,
          },
          googleDocsClass,
          312
        ),
        googleDocsClass,
        agent,
        memory
      ) instanceof PsGoogleDocsConnector
    );

    const googleSheetsClass = createConnectorClass(
      PsConnectorClassTypes.Spreadsheet,
      "Google Sheets",
      213
    );
    assert.ok(
      PsConnectorFactory.createConnector(
        createConnector(
          {
            googleSheetsId: "sheet-1",
            credentialsJson: googleCredentials,
          },
          googleSheetsClass,
          313
        ),
        googleSheetsClass,
        agent,
        memory
      ) instanceof PsGoogleSheetsConnector
    );

    const discordClass = createConnectorClass(
      PsConnectorClassTypes.NotificationsAndChat,
      "Discord",
      214
    );
    assert.ok(
      PsConnectorFactory.createConnector(
        createConnector({ discordBotToken: "token" }, discordClass, 314),
        discordClass,
        agent,
        memory
      ) instanceof PsBaseDiscordConnector
    );

    const yourPrioritiesClass = createConnectorClass(
      PsConnectorClassTypes.IdeasCollaboration,
      "Your Priorities",
      215
    );
    assert.ok(
      PsConnectorFactory.createConnector(
        createConnector(
          {
            groupId: 12,
            userEmail: "agent@example.com",
            password: "secret",
            serverBaseUrl: "https://yp.example/api",
          },
          yourPrioritiesClass,
          315
        ),
        yourPrioritiesClass,
        agent,
        memory
      ) instanceof PsYourPrioritiesConnector
    );

    const allOurIdeasClass = createConnectorClass(
      PsConnectorClassTypes.VotingCollaboration,
      "All Our Ideas",
      216
    );
    assert.ok(
      PsConnectorFactory.createConnector(
        createConnector(
          {
            userEmail: "agent@example.com",
            password: "secret",
            serverBaseUrl: "https://aoi.example/api",
          },
          allOurIdeasClass,
          316
        ),
        allOurIdeasClass,
        agent,
        memory
      ) instanceof PsAllOurIdeasConnector
    );

    const unsupportedTypeClass = createConnectorClass(
      "unknown-type",
      "Unknown Connector",
      211
    );
    assert.equal(
      PsConnectorFactory.createConnector(
        createConnector({}, unsupportedTypeClass, 311),
        unsupportedTypeClass,
        agent,
        memory
      ),
      null
    );
    const unsupportedDriveClass = createConnectorClass(
      PsConnectorClassTypes.Drive,
      "Google Drive",
      217
    );
    assert.equal(
      PsConnectorFactory.createConnector(
        createConnector({ credentialsJson: googleCredentials }, unsupportedDriveClass, 317),
        unsupportedDriveClass,
        agent,
        memory
      ),
      null
    );

    assert.equal(
      PsConnectorFactory.createDocumentConnector(
        createConnector(),
        createConnectorClass(PsConnectorClassTypes.Document, "Microsoft Word"),
        agent,
        memory
      ),
      null
    );
    assert.equal(
      PsConnectorFactory.createSheetConnector(
        createConnector(),
        createConnectorClass(PsConnectorClassTypes.Spreadsheet, "Microsoft Excel"),
        agent,
        memory
      ),
      null
    );
    assert.equal(
      PsConnectorFactory.createNotificationsConnector(
        createConnector(),
        createConnectorClass(PsConnectorClassTypes.NotificationsAndChat, "Slack"),
        agent,
        memory
      ),
      null
    );
    assert.equal(
      PsConnectorFactory.createIdeasCollaborationConnector(
        createConnector(),
        createConnectorClass(PsConnectorClassTypes.IdeasCollaboration, "GitHub"),
        agent,
        memory
      ),
      null
    );
    assert.equal(
      PsConnectorFactory.createVotingCollaborationConnector(
        createConnector(),
        createConnectorClass(PsConnectorClassTypes.VotingCollaboration, "GitHub"),
        agent,
        memory
      ),
      null
    );
  });

  it("selects input and output connectors by class type", () => {
    const memory = createMemory();
    const subAgentsClass = createConnectorClass(
      PsConnectorClassTypes.SubAgents,
      "Sub Agents Connector",
      220
    );
    const votingClass = createConnectorClass(
      PsConnectorClassTypes.VotingCollaboration,
      "GitHub",
      221
    );
    const agent = createAgent({
      InputConnectors: [
        createConnector({}, subAgentsClass, 320),
        createConnector({}, undefined, 321),
        createConnector({}, votingClass, 322),
      ],
      OutputConnectors: [createConnector({}, subAgentsClass, 323)],
    });

    assert.ok(
      PsConnectorFactory.getConnector(
        agent,
        memory,
        PsConnectorClassTypes.SubAgents
      ) instanceof PsSubAgentsConnector
    );
    assert.ok(
      PsConnectorFactory.getConnector(
        agent,
        memory,
        PsConnectorClassTypes.SubAgents,
        false
      ) instanceof PsSubAgentsConnector
    );
    assert.equal(
      PsConnectorFactory.getConnector(
        agent,
        memory,
        PsConnectorClassTypes.Document
      ),
      null
    );
    assert.equal(
      PsConnectorFactory.getAllConnectors(
        agent,
        memory,
        PsConnectorClassTypes.SubAgents
      ).length,
      1
    );
    assert.deepEqual(
      PsConnectorFactory.getAllConnectors(
        createAgent(),
        memory,
        PsConnectorClassTypes.SubAgents
      ),
      []
    );
    assert.deepEqual(
      PsConnectorFactory.getAllConnectors(
        agent,
        memory,
        PsConnectorClassTypes.VotingCollaboration
      ),
      []
    );
  });
});

describe("PsSubAgentsConnector", () => {
  it("returns empty lists for unsaved connectors", async () => {
    const connectorClass = createConnectorClass(
      PsConnectorClassTypes.SubAgents,
      "Sub Agents Connector"
    );
    const connector = new PsSubAgentsConnector(
      createConnector({}, connectorClass, 0),
      connectorClass,
      createAgent(),
      createMemory()
    );

    assert.deepEqual(await connector.listConnectedInputAgents(), []);
    assert.deepEqual(await connector.listConnectedOutputAgents(), []);
  });

  it("queries connected agents through the right connector associations", async () => {
    const connectorClass = createConnectorClass(
      PsConnectorClassTypes.SubAgents,
      "Sub Agents Connector"
    );
    const connectorRecord = createConnector({}, connectorClass, 330);
    const connector = new PsSubAgentsConnector(
      connectorRecord,
      connectorClass,
      createAgent(),
      createMemory()
    );
    const inputAgent = createAgent({ id: 601 });
    const outputAgent = createAgent({ id: 602 });
    const calls: Record<string, unknown>[] = [];
    const agentModel = PsAgent as unknown as {
      findAll: (options: Record<string, unknown>) => Promise<PsAgentInstance[]>;
    };
    const originalFindAll = agentModel.findAll;
    let callCount = 0;
    agentModel.findAll = async (options) => {
      calls.push(options);
      callCount += 1;
      return callCount === 1 ? [inputAgent] : [outputAgent];
    };

    try {
      assert.deepEqual(await connector.listConnectedInputAgents(), [inputAgent]);
      assert.deepEqual(await connector.listConnectedOutputAgents(), [outputAgent]);
    } finally {
      agentModel.findAll = originalFindAll;
    }

    const inputInclude = asRecord((calls[0].include as unknown[])[0]);
    const outputInclude = asRecord((calls[1].include as unknown[])[0]);
    assert.equal(inputInclude.as, "InputConnectors");
    assert.deepEqual(inputInclude.where, { id: 330 });
    assert.equal(outputInclude.as, "OutputConnectors");
    assert.deepEqual(outputInclude.where, { id: 330 });
  });
});

describe("PsGoogleDocsConnector", () => {
  it("validates service-account credentials before creating an API client", () => {
    const connectorClass = createConnectorClass(
      PsConnectorClassTypes.Document,
      "Google Docs"
    );

    assert.throws(
      () =>
        new PsGoogleDocsConnector(
          createConnector({}, connectorClass),
          connectorClass,
          createAgent(),
          createMemory()
        ),
      /Google Service Account credentials are not set/
    );
    assert.throws(
      () =>
        new PsGoogleDocsConnector(
          createConnector({ credentialsJson: "{bad" }, connectorClass),
          connectorClass,
          createAgent(),
          createMemory()
        ),
      /Invalid JSON string/
    );
    assert.throws(
      () =>
        new PsGoogleDocsConnector(
          createConnector({ credentialsJson: 12 }, connectorClass),
          connectorClass,
          createAgent(),
          createMemory()
        ),
      /Invalid type/
    );
    assert.throws(
      () =>
        new PsGoogleDocsConnector(
          createConnector(
            { credentialsJson: { client_email: "missing-key@example.com" } },
            connectorClass
          ),
          connectorClass,
          createAgent(),
          createMemory()
        ),
      /Missing client_email or private_key/
    );
  });

  it("extracts, updates, and converts documents through the mocked API", async () => {
    const connector = createGoogleDocsConnector();
    const content = [
      {
        paragraph: {
          elements: [{ textRun: { content: "Hello " } }],
        },
      },
      {
        table: {
          tableRows: [
            {
              tableCells: [
                {
                  content: [
                    {
                      paragraph: {
                        elements: [{ textRun: { content: "table" } }],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      { sectionBreak: {} },
    ] as Parameters<GoogleDocsConnectorInstance["extractText"]>[0];
    const batchCalls: DocsBatchUpdateParams[] = [];
    const getCalls: string[] = [];

    setMockDocs(connector, {
      get: async ({ documentId }) => {
        getCalls.push(documentId ?? "");
        return { data: { body: { content } } };
      },
      batchUpdate: async (params) => {
        batchCalls.push(params);
        return {};
      },
    });

    assert.equal(await connector.getDocument(), "Hello table\n");
    assert.deepEqual(getCalls, ["doc-1"]);

    await connector.updateDocument("replacement text");
    assert.equal(batchCalls[0].documentId, "doc-1");
    assert.deepEqual(batchCalls[0].requestBody?.requests?.[0], {
      insertText: {
        location: { index: 1 },
        text: "replacement text",
      },
    });

    const markdown = [
      "# Title",
      "Body with **bold** and *italic* and [link](https://example.com).",
      "![alt](https://example.com/image.png)",
      "```",
      "const answer = 42;",
      "```",
    ].join("\n");
    const { requests } = connector.markdownToGoogleDocs(markdown);
    const styles = requests
      .map(getTextStyle)
      .filter((style): style is Record<string, unknown> => style !== undefined);

    assert.ok(requests.some((request) => hasKey(request, "insertInlineImage")));
    assert.ok(styles.some((style) => style.bold === true));
    assert.ok(styles.some((style) => style.italic === true));
    assert.ok(styles.some((style) => hasKey(style, "link")));
    assert.ok(styles.some((style) => hasKey(style, "backgroundColor")));

    await connector.updateDocumentFromMarkdown("## Heading\nBody");
    assert.ok((batchCalls[1].requestBody?.requests?.length ?? 0) > 0);
  });

  it("maps document update API failures to connector errors", async () => {
    const connector = createGoogleDocsConnector();

    setMockDocs(connector, {
      get: async () => ({ data: { body: { content: [] } } }),
      batchUpdate: async () => {
        throw { code: 429 };
      },
    });
    await assert.rejects(
      () => connector.updateDocument("text"),
      /Rate limit exceeded/
    );

    setMockDocs(connector, {
      get: async () => ({ data: { body: { content: [] } } }),
      batchUpdate: async () => {
        throw { code: 503 };
      },
    });
    await assert.rejects(
      () => connector.updateDocumentFromMarkdown("text"),
      /Google Docs server error/
    );

    await assert.rejects(
      () => createGoogleDocsConnector({ googleDocsId: "" }).getDocument(),
      /Google Docs ID is not set/
    );
  });

  it("covers alternate markdown, missing id, and passthrough error paths", async () => {
    const stringCredentialsConnector = createGoogleDocsConnector({
      credentialsJson: JSON.stringify(googleCredentials),
    });
    assert.ok(stringCredentialsConnector.client);
    assert.deepEqual(
      PsGoogleDocsConnector.getExtraConfigurationQuestions().map(
        (question) => question.uniqueId
      ),
      ["googleDocsId", "credentialsJson"]
    );

    const { requests } = stringCredentialsConnector.markdownToGoogleDocs(
      [
        "### Third",
        "#### Fourth",
        "prefix ![alt](https://example.com/image.png) suffix",
        "**bold only**",
      ].join("\n")
    );
    const styles = requests
      .map(getTextStyle)
      .filter((style): style is Record<string, unknown> => style !== undefined);
    assert.ok(styles.some((style) => style.bold === true));
    assert.ok(
      requests.some(
        (request) =>
          hasKey(request, "insertText") &&
          String(asRecord(request.insertText).text).includes("prefix")
      )
    );

    const missingIdConnector = createGoogleDocsConnector({ googleDocsId: "" });
    await assert.rejects(
      () => missingIdConnector.updateDocument("text"),
      /Google Docs ID is not set/
    );
    await assert.rejects(
      () => missingIdConnector.updateDocumentFromMarkdown("text"),
      /Google Docs ID is not set/
    );

    const failingConnector = createGoogleDocsConnector();
    setMockDocs(failingConnector, {
      get: async () => {
        throw new Error("docs get failed");
      },
      batchUpdate: async () => ({}),
    });
    await assert.rejects(
      () => failingConnector.getData("doc-1"),
      /docs get failed/
    );

    setMockDocs(failingConnector, {
      get: async () => ({ data: { body: { content: [] } } }),
      batchUpdate: async () => {
        throw new Error("docs update failed");
      },
    });
    await assert.rejects(
      () => failingConnector.updateDocument("text"),
      /docs update failed/
    );

    setMockDocs(failingConnector, {
      get: async () => ({ data: { body: { content: [] } } }),
      batchUpdate: async () => {
        throw { code: 429 };
      },
    });
    await assert.rejects(
      () => failingConnector.updateDocumentFromMarkdown("text"),
      /Rate limit exceeded/
    );

    setMockDocs(failingConnector, {
      get: async () => ({ data: { body: { content: [] } } }),
      batchUpdate: async () => {
        throw new Error("markdown update failed");
      },
    });
    await assert.rejects(
      () => failingConnector.updateDocumentFromMarkdown("text"),
      /markdown update failed/
    );

    setMockDocs(failingConnector, {
      get: async () => {
        throw new Error("document fetch failed");
      },
      batchUpdate: async () => ({}),
    });
    await assert.rejects(
      () => failingConnector.getDocument(),
      /document fetch failed/
    );

    assert.equal(
      failingConnector.extractText([
        { paragraph: { elements: [{}] } },
        { table: { tableRows: [{ tableCells: [{ content: [] }] }] } },
      ] as Parameters<GoogleDocsConnectorInstance["extractText"]>[0]),
      ""
    );
  });
});

describe("PsGoogleSheetsConnector", () => {
  it("validates service-account credentials before creating an API client", () => {
    const connectorClass = createConnectorClass(
      PsConnectorClassTypes.Spreadsheet,
      "Google Sheets"
    );

    assert.throws(
      () =>
        new PsGoogleSheetsConnector(
          createConnector({}, connectorClass),
          connectorClass,
          createAgent(),
          createMemory()
        ),
      /Google Service Account credentials are not set/
    );
    assert.throws(
      () =>
        new PsGoogleSheetsConnector(
          createConnector({ credentialsJson: "{bad" }, connectorClass),
          connectorClass,
          createAgent(),
          createMemory()
        ),
      /Invalid JSON string/
    );
    assert.throws(
      () =>
        new PsGoogleSheetsConnector(
          createConnector(
            { credentialsJson: { client_email: "missing-key@example.com" } },
            connectorClass
          ),
          connectorClass,
          createAgent(),
          createMemory()
        ),
      /Missing client_email or private_key/
    );
  });

  it("reads and writes spreadsheet data through the mocked API", async () => {
    const connector = createGoogleSheetsConnector();
    const valueGets: SheetsApiParams[] = [];
    const valueUpdates: SheetsApiParams[] = [];
    const clears: SheetsApiParams[] = [];
    const batchUpdates: SheetsApiParams[] = [];
    const metadataGets: SheetsApiParams[] = [];
    const valuesQueue: Array<string[][] | undefined> = [[["A", "B"]], undefined];

    setMockSheets(connector, {
      spreadsheets: {
        get: async (params) => {
          metadataGets.push(params);
          return {
            data: {
              sheets: [{ properties: { title: "Existing" } }],
            },
          };
        },
        batchUpdate: async (params) => {
          batchUpdates.push(params);
          return {};
        },
        values: {
          get: async (params) => {
            valueGets.push(params);
            return { data: { values: valuesQueue.shift() } };
          },
          update: async (params) => {
            valueUpdates.push(params);
            return {};
          },
          clear: async (params) => {
            clears.push(params);
            return {};
          },
        },
      },
    });

    assert.deepEqual(await connector.getSheet(), [["A", "B"]]);
    assert.deepEqual(await connector.getRange("A2:B3"), []);
    await connector.addSheetIfNotExists("Existing");
    await connector.addSheetIfNotExists("New");
    await connector.createNewSheet("Created");
    await connector.formatCells(
      "A1:E1",
      { textFormat: { bold: true } } as Parameters<
        GoogleSheetsConnectorInstance["formatCells"]
      >[1]
    );
    await connector.updateSheet([["1"]]);
    await connector.updateRange("C1:D2", [["2"]]);
    await connector.clearRange("C1");

    assert.deepEqual(valueGets.map((params) => params.range), ["A1:ZZ", "A2:B3"]);
    assert.equal(metadataGets.length, 2);
    assert.equal(batchUpdates.length, 3);
    assert.deepEqual(valueUpdates.map((params) => params.range), ["A1", "C1:D2"]);
    assert.deepEqual(clears.map((params) => params.range), ["C1"]);
  });

  it("requires a configured spreadsheet id before making API calls", async () => {
    const connector = createGoogleSheetsConnector({ googleSheetsId: "" });

    await assert.rejects(() => connector.getSheet(), /Google Sheets ID is not set/);
    await assert.rejects(
      () => connector.addSheetIfNotExists("Missing"),
      /Google Sheets ID is not set/
    );
    await assert.rejects(
      () => connector.createNewSheet("Missing"),
      /Google Sheets ID is not set/
    );
    await assert.rejects(
      () =>
        connector.formatCells(
          "A1:E1",
          {} as Parameters<GoogleSheetsConnectorInstance["formatCells"]>[1]
        ),
      /Google Sheets ID is not set/
    );
    await assert.rejects(
      () => connector.updateSheet([["1"]]),
      /Google Sheets ID is not set/
    );
    await assert.rejects(
      () => connector.getRange("A1"),
      /Google Sheets ID is not set/
    );
    await assert.rejects(
      () => connector.updateRange("A1", [["1"]]),
      /Google Sheets ID is not set/
    );
    await assert.rejects(
      () => connector.clearRange("A1"),
      /Google Sheets ID is not set/
    );
  });

  it("covers string credentials, extra questions, and API failure paths", async () => {
    const stringCredentialsConnector = createGoogleSheetsConnector({
      credentialsJson: JSON.stringify(googleCredentials),
    });
    assert.ok(stringCredentialsConnector.client);
    assert.deepEqual(
      PsGoogleSheetsConnector.getExtraConfigurationQuestions().map(
        (question) => question.uniqueId
      ),
      ["googleSheetsId", "credentialsJson"]
    );

    const connector = createGoogleSheetsConnector();
    const sheetsError = new Error("sheets failed");
    setMockSheets(connector, {
      spreadsheets: {
        get: async () => {
          throw sheetsError;
        },
        batchUpdate: async () => {
          throw sheetsError;
        },
        values: {
          get: async () => {
            throw sheetsError;
          },
          update: async () => {
            throw sheetsError;
          },
          clear: async () => {
            throw sheetsError;
          },
        },
      },
    });

    await assert.rejects(() => connector.getSheet(), /sheets failed/);
    await assert.rejects(
      () => connector.addSheetIfNotExists("New"),
      /sheets failed/
    );
    await assert.rejects(() => connector.createNewSheet("New"), /sheets failed/);
    await assert.rejects(
      () =>
        connector.formatCells(
          "A1:E1",
          {} as Parameters<GoogleSheetsConnectorInstance["formatCells"]>[1]
        ),
      /sheets failed/
    );
    await assert.rejects(() => connector.updateSheet([["1"]]), /sheets failed/);
    await assert.rejects(() => connector.getRange("A1"), /sheets failed/);
    await assert.rejects(
      () => connector.updateRange("A1", [["1"]]),
      /sheets failed/
    );
    await assert.rejects(() => connector.clearRange("A1"), /sheets failed/);
  });
});

describe("PsGoogleDriveConnector", () => {
  it("validates service-account credentials before creating an API client", () => {
    const connectorClass = createConnectorClass(
      PsConnectorClassTypes.Drive,
      "Google Drive"
    );

    assert.throws(
      () =>
        new PsGoogleDriveConnector(
          createConnector({}, connectorClass),
          connectorClass,
          createAgent(),
          createMemory()
        ),
      /Google Service Account credentials are not set/
    );
    assert.throws(
      () =>
        new PsGoogleDriveConnector(
          createConnector({ credentialsJson: "{bad" }, connectorClass),
          connectorClass,
          createAgent(),
          createMemory()
        ),
      /Invalid JSON string/
    );
    assert.throws(
      () =>
        new PsGoogleDriveConnector(
          createConnector({ credentialsJson: 42 }, connectorClass),
          connectorClass,
          createAgent(),
          createMemory()
        ),
      /Invalid type/
    );
    assert.throws(
      () =>
        new PsGoogleDriveConnector(
          createConnector(
            { credentialsJson: { client_email: "missing-key@example.com" } },
            connectorClass
          ),
          connectorClass,
          createAgent(),
          createMemory()
        ),
      /Missing client_email or private_key/
    );
  });

  it("passes list, get, create, update, and delete calls to Drive", async () => {
    const connector = createGoogleDriveConnector();
    const calls: Array<{ method: string; params: Record<string, unknown> }> = [];

    setMockDrive(connector, {
      files: {
        list: async (params) => {
          calls.push({ method: "list", params });
          return { data: { files: [{ id: "file-1", name: "One" }] } };
        },
        get: async (params) => {
          calls.push({ method: "get", params });
          return { data: { id: params.fileId, name: "One" } };
        },
        create: async (params) => {
          calls.push({ method: "create", params });
          return { data: { id: "created", name: "Created" } };
        },
        update: async (params) => {
          calls.push({ method: "update", params });
          return { data: { id: params.fileId, name: "Updated" } };
        },
        delete: async (params) => {
          calls.push({ method: "delete", params });
          return {};
        },
      },
    });

    assert.deepEqual(await connector.list(), [{ id: "file-1", name: "One" }]);
    assert.deepEqual(await connector.get("file-1"), {
      id: "file-1",
      name: "One",
    });
    assert.deepEqual(await connector.post({ name: "Created" }), {
      id: "created",
      name: "Created",
    });
    assert.deepEqual(await connector.post({}), {
      id: "created",
      name: "Created",
    });
    assert.deepEqual(await connector.put("file-1", { name: "Updated" }), {
      id: "file-1",
      name: "Updated",
    });
    assert.deepEqual(await connector.put("file-2", {}), {
      id: "file-2",
      name: "Updated",
    });
    await connector.delete("file-1");

    assert.deepEqual(calls.map((call) => call.method), [
      "list",
      "get",
      "create",
      "create",
      "update",
      "update",
      "delete",
    ]);
    assert.deepEqual(calls[0].params, {
      pageSize: 10,
      fields: "files(id, name, mimeType)",
    });
    assert.deepEqual(calls[1].params, {
      fileId: "file-1",
      fields: "id, name, mimeType, size",
    });
    assert.deepEqual(calls[2].params, {
      requestBody: { name: "Created" },
    });
    assert.deepEqual(calls[3].params, {
      requestBody: { name: "UntitledFile" },
    });
    assert.deepEqual(calls[5].params, {
      fileId: "file-2",
      requestBody: { name: "UpdatedFile" },
    });

    await assert.rejects(() => connector.get(""), /File ID is not provided/);
    await assert.rejects(
      () => connector.put("", {}),
      /File ID is not provided for update/
    );
    await assert.rejects(
      () => connector.delete(""),
      /File ID is not provided for deletion/
    );
  });

  it("covers string credentials, extra questions, and Drive API failures", async () => {
    const stringCredentialsConnector = createGoogleDriveConnector({
      credentialsJson: JSON.stringify(googleCredentials),
    });
    assert.ok(stringCredentialsConnector.client);
    assert.deepEqual(
      PsGoogleDriveConnector.getExtraConfigurationQuestions().map(
        (question) => question.uniqueId
      ),
      ["credentialsJson"]
    );

    const connector = createGoogleDriveConnector();
    const driveError = new Error("drive failed");
    setMockDrive(connector, {
      files: {
        list: async () => {
          throw driveError;
        },
        get: async () => {
          throw driveError;
        },
        create: async () => {
          throw driveError;
        },
        update: async () => {
          throw driveError;
        },
        delete: async () => {
          throw driveError;
        },
      },
    });

    await assert.rejects(() => connector.list(), /drive failed/);
    await assert.rejects(() => connector.get("file-1"), /drive failed/);
    await assert.rejects(() => connector.post({}), /drive failed/);
    await assert.rejects(() => connector.put("file-1", {}), /drive failed/);
    await assert.rejects(() => connector.delete("file-1"), /drive failed/);
  });
});

describe("PsYourPrioritiesConnector", () => {
  it("validates required configuration and fabric API-key mode", () => {
    assert.throws(
      () =>
        createYourPrioritiesConnector({
          userEmail: "",
          password: "",
          serverBaseUrl: "",
        }),
      /Required configuration values are not set/
    );
    assert.deepEqual(
      PsYourPrioritiesConnector.getExtraConfigurationQuestions().map(
        (question) => question.uniqueId
      ),
      ["serverBaseUrl", "userEmail", "password"]
    );

    const originalApiKey = process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY;
    const originalServerPath =
      process.env.PS_TEMP_AGENTS_FABRIC_GROUP_SERVER_PATH;
    process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY = "fabric-key";
    process.env.PS_TEMP_AGENTS_FABRIC_GROUP_SERVER_PATH = "https://fabric.example";

    try {
      const connector = createYourPrioritiesConnector(
        {
          userEmail: "",
          password: "",
          serverBaseUrl: "",
        },
        createAgent({ user_id: 77 })
      );
      assert.equal(connector.serverBaseUrl, "https://fabric.example/api");
      assert.equal(connector.agentFabricUserId, 77);
      assert.deepEqual(connector.getHeaders(), { "x-api-key": "fabric-key" });
      assert.deepEqual(PsYourPrioritiesConnector.getExtraConfigurationQuestions(), []);
    } finally {
      restoreEnv("PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY", originalApiKey);
      restoreEnv(
        "PS_TEMP_AGENTS_FABRIC_GROUP_SERVER_PATH",
        originalServerPath
      );
    }
  });

  it("retries retryable request failures without waiting in tests", async () => {
    const connector = createYourPrioritiesConnector();
    const connectionError = Object.assign(new Error("connection reset"), {
      code: "ECONNRESET",
    });
    const serverError = Object.assign(new Error("server error"), {
      response: { status: 502 },
    });
    const clientError = Object.assign(new Error("client error"), {
      response: { status: 400 },
    });

    await withAxiosStub(
      {
        isAxiosError: (error) =>
          error === connectionError || error === serverError || error === clientError,
      },
      async () => {
        await withImmediateTimers(async () => {
          let connectionAttempts = 0;
          assert.equal(
            await connector.requestWithRetry(async () => {
              connectionAttempts += 1;
              if (connectionAttempts < 3) throw connectionError;
              return "connected";
            }),
            "connected"
          );
          assert.equal(connectionAttempts, 3);

          let serverAttempts = 0;
          assert.equal(
            await connector.requestWithRetry(async () => {
              serverAttempts += 1;
              if (serverAttempts < 2) throw serverError;
              return "server recovered";
            }),
            "server recovered"
          );
          assert.equal(serverAttempts, 2);
        });

        const plainError = new Error("plain failure");
        await assert.rejects(
          () =>
            connector.requestWithRetry(async () => {
              throw plainError;
            }),
          /plain failure/
        );
        await assert.rejects(
          () =>
            connector.requestWithRetry(async () => {
              throw clientError;
            }),
          /client error/
        );
      }
    );
  });

  it("stops retrying after retry budgets are exhausted", async () => {
    const connector = createYourPrioritiesConnector();
    const connectionError = Object.assign(new Error("connection exhausted"), {
      code: "ETIMEDOUT",
    });
    const serverError = Object.assign(new Error("server exhausted"), {
      response: { status: 503 },
    });

    await withAxiosStub(
      {
        isAxiosError: (error) => error === connectionError || error === serverError,
      },
      async () => {
        await withImmediateTimers(async () => {
          let connectionAttempts = 0;
          await assert.rejects(
            () =>
              connector.requestWithRetry(async () => {
                connectionAttempts += 1;
                throw connectionError;
              }),
            /connection exhausted/
          );
          assert.equal(connectionAttempts, 3);

          let serverAttempts = 0;
          await assert.rejects(
            () =>
              connector.requestWithRetry(async () => {
                serverAttempts += 1;
                throw serverError;
              }),
            /server exhausted/
          );
          assert.equal(serverAttempts, 3);
        });
      }
    );
  });

  it("logs in, fetches posts, votes, posts points, and creates posts", async () => {
    const connector = createYourPrioritiesConnector();
    const postCalls: Array<{
      url: string;
      data?: unknown;
      config?: unknown;
    }> = [];
    const getCalls: Array<{ url: string; config?: unknown }> = [];
    const firstPage = Array.from({ length: 20 }, (_value, index) => ({
      id: index + 1,
    })) as YpPostData[];
    const secondPage = [{ id: 21 }] as YpPostData[];
    let postsPage = 0;

    await withAxiosStub(
      {
        post: async (url, data, config) => {
          postCalls.push({ url, data, config });
          if (url.endsWith("/users/login")) {
            return {
              data: { id: 9, name: "Agent" },
              headers: { "set-cookie": ["yp-session=abc", "yp-user=9"] },
            };
          }
          if (url.includes("/points/")) {
            return { data: { id: 44, content: "point" }, headers: {} };
          }
          if (url.includes("/endorse")) {
            return { data: { ok: true }, headers: {} };
          }
          if (url.includes("/start_generating/ai_image")) {
            return { data: { jobId: "job-1" }, headers: {} };
          }
          if (url.includes("/posts/12")) {
            return { data: { id: 88, name: "Posted" }, headers: {} };
          }
          throw new Error(`Unexpected POST ${url}`);
        },
        get: async (url, config) => {
          getCalls.push({ url, config });
          if (url.includes("/posts/top/")) {
            postsPage += 1;
            return {
              data: { posts: postsPage === 1 ? firstPage : secondPage },
              headers: {},
            };
          }
          if (url.includes("/poll_for_generating_ai_image")) {
            return { data: { data: { imageId: 55 } }, headers: {} };
          }
          throw new Error(`Unexpected GET ${url}`);
        },
      },
      async () => {
        await connector.login();
        assert.equal(connector.sessionCookie, "yp-session=abc; yp-user=9");
        assert.deepEqual(connector.getHeaders(), {
          Cookie: "yp-session=abc; yp-user=9",
        });

        const posts = await connector.getGroupPosts(12);
        assert.equal(posts.length, 21);
        assert.ok(getCalls[0].url.includes("offset=0"));
        assert.ok(getCalls[1].url.includes("offset=20"));

        assert.deepEqual(await connector.postPoint(12, 3, 4, 1, "point"), {
          id: 44,
          content: "point",
        });
        await connector.vote(3, 1);
        assert.equal(await connector.generateImageWithAi(12, "image prompt"), 55);
        assert.deepEqual(
          await connector.post(
            12,
            "Posted",
            [{ uniqueId: "q1", value: "answer" }] as YpStructuredAnswer[],
            "image prompt"
          ),
          { id: 88, name: "Posted" }
        );
      }
    );

    const postedForm = String(
      postCalls.find((call) => call.url.endsWith("/posts/12"))?.data
    );
    assert.ok(postedForm.includes("uploadedHeaderImageId=55"));
  });

  it("uses local image uploads, agent-fabric URLs, and no-image fallbacks", async () => {
    const connector = createYourPrioritiesConnector();
    connector.user = { id: 9 } as YpUserData;
    connector.sessionCookie = "yp-session=abc";
    const uploadedCalls: string[] = [];

    await withAxiosStub(
      {
        post: async (url) => {
          uploadedCalls.push(url);
          if (url.endsWith("/images")) {
            return { data: { id: 77 }, headers: {} };
          }
          if (url.endsWith("/posts/12")) {
            return { data: { id: 89 }, headers: {} };
          }
          throw new Error(`Unexpected POST ${url}`);
        },
      },
      async () => {
        assert.deepEqual(
          await connector.post(
            12,
            "With image",
            [] as YpStructuredAnswer[],
            "image prompt",
            `${process.cwd()}/package.json`
          ),
          { id: 89 }
        );
      }
    );
    assert.deepEqual(uploadedCalls, [
      "https://yp.example/api/images",
      "https://yp.example/api/posts/12",
    ]);

    const noImageConnector = createYourPrioritiesConnector();
    noImageConnector.user = { id: 10 } as YpUserData;
    noImageConnector.sessionCookie = "yp-session=def";
    (noImageConnector as unknown as {
      generateImageWithAi: (groupId: number, prompt: string) => Promise<number>;
    }).generateImageWithAi = async () => 0;
    await withAxiosStub(
      {
        post: async (url, data) => {
          assert.equal(url, "https://yp.example/api/posts/12");
          assert.equal(String(data).includes("uploadedHeaderImageId"), false);
          return { data: { id: 90 }, headers: {} };
        },
      },
      async () => {
        assert.deepEqual(
          await noImageConnector.post(
            12,
            "No image",
            [] as YpStructuredAnswer[],
            "image prompt"
          ),
          { id: 90 }
        );
      }
    );

    const originalApiKey = process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY;
    const originalServerPath =
      process.env.PS_TEMP_AGENTS_FABRIC_GROUP_SERVER_PATH;
    process.env.PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY = "fabric-key";
    process.env.PS_TEMP_AGENTS_FABRIC_GROUP_SERVER_PATH = "https://fabric.example";

    try {
      const fabricConnector = createYourPrioritiesConnector({}, createAgent({ user_id: 42 }));
      const fabricUrls: string[] = [];
      await withAxiosStub(
        {
          get: async (url) => {
            fabricUrls.push(url);
            return { data: { posts: [] }, headers: {} };
          },
          post: async (url) => {
            fabricUrls.push(url);
            return { data: { id: 1 }, headers: {} };
          },
        },
        async () => {
          await fabricConnector.login();
          await fabricConnector.getGroupPosts(12);
          await fabricConnector.postPoint(12, 1, 2, 1, "content");
          await fabricConnector.vote(1, 1);
        }
      );
      assert.ok(fabricUrls.every((url) => url.includes("agentFabricUserId=42")));
    } finally {
      restoreEnv("PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY", originalApiKey);
      restoreEnv(
        "PS_TEMP_AGENTS_FABRIC_GROUP_SERVER_PATH",
        originalServerPath
      );
    }
  });

  it("falls back from local image upload failure and times out image generation", async () => {
    const connector = createYourPrioritiesConnector();
    connector.user = { id: 9 } as YpUserData;
    connector.sessionCookie = "yp-session=abc";
    (connector as unknown as {
      generateImageWithAi: (groupId: number, prompt: string) => Promise<number>;
    }).generateImageWithAi = async () => 66;
    const postUrls: string[] = [];

    await withAxiosStub(
      {
        post: async (url) => {
          postUrls.push(url);
          if (url.endsWith("/images")) {
            throw new Error("upload failed");
          }
          if (url.endsWith("/posts/12")) {
            return { data: { id: 91 }, headers: {} };
          }
          throw new Error(`Unexpected POST ${url}`);
        },
      },
      async () => {
        assert.deepEqual(
          await connector.post(
            12,
            "Fallback image",
            [] as YpStructuredAnswer[],
            "image prompt",
            `${process.cwd()}/package.json`
          ),
          { id: 91 }
        );
      }
    );
    assert.deepEqual(postUrls, [
      "https://yp.example/api/images",
      "https://yp.example/api/posts/12",
    ]);

    const timeoutConnector = createYourPrioritiesConnector();
    timeoutConnector.user = { id: 10 } as YpUserData;
    timeoutConnector.sessionCookie = "yp-session=def";
    const originalNow = Date.now;
    let nowCalls = 0;
    Date.now = () => {
      nowCalls += 1;
      return nowCalls === 1 ? 0 : 121_000;
    };
    try {
      await withImmediateTimers(async () =>
        withAxiosStub(
          {
            post: async (url) => {
              assert.ok(url.includes("/start_generating/ai_image"));
              return { data: { jobId: "job-timeout" }, headers: {} };
            },
            get: async (url) => {
              assert.ok(url.includes("/poll_for_generating_ai_image"));
              return { data: { data: {} }, headers: {} };
            },
          },
          async () => {
            assert.equal(
              await timeoutConnector.generateImageWithAi(12, "image prompt"),
              0
            );
          }
        )
      );
    } finally {
      Date.now = originalNow;
    }
  });

  it("normalizes API failures from Your Priorities methods", async () => {
    await withAxiosStub(
      {
        post: async () => ({ data: { id: 9 }, headers: {} }),
      },
      async () => {
        await assert.rejects(
          () => createYourPrioritiesConnector().login(),
          /Login failed/
        );
      }
    );

    const connector = createYourPrioritiesConnector();
    connector.user = { id: 9 } as YpUserData;
    connector.sessionCookie = "yp-session=abc";
    await withAxiosStub(
      {
        get: async () => {
          throw new Error("remote failed");
        },
        post: async () => {
          throw new Error("remote failed");
        },
      },
      async () => {
        await assert.rejects(
          () => connector.getGroupPosts(12),
          /Failed to fetch group posts/
        );
        await assert.rejects(
          () => connector.postPoint(12, 1, 2, 1, "content"),
          /Failed to post point/
        );
        await assert.rejects(() => connector.vote(1, 1), /Voting failed/);
        await assert.rejects(
          () =>
            connector.post(
              12,
              "Name",
              [] as YpStructuredAnswer[],
              "image prompt"
            ),
          /Failed to generate AI image/
        );
      }
    );

    await withAxiosStub(
      {
        post: async () => ({ data: { jobId: "job-error" }, headers: {} }),
        get: async () => ({
          data: { error: true, data: { error: "generation failed" } },
          headers: {},
        }),
      },
      async () => {
        await assert.rejects(
          () => connector.generateImageWithAi(12, "image prompt"),
          /Failed to generate AI image/
        );
      }
    );
  });
});

describe("PsAllOurIdeasConnector", () => {
  it("validates login configuration and handles login/vote/postItems", async () => {
    assert.throws(
      () =>
        createAllOurIdeasConnector({
          userEmail: "",
          password: "",
          serverBaseUrl: "",
        }),
      /Required configuration values are not set/
    );

    const connector = createAllOurIdeasConnector();
    const calls: Array<{ url: string; data?: unknown; config?: unknown }> = [];

    await withAxiosStub(
      {
        post: async (url, data, config) => {
          calls.push({ url, data, config });
          if (url.endsWith("/users/login")) {
            return {
              data: { id: 5 },
              headers: { "set-cookie": ["aoi-session=1"] },
            };
          }
          if (url.endsWith("/posts/99/endorse")) {
            return { data: { ok: true }, headers: {} };
          }
          throw new Error(`Unexpected POST ${url}`);
        },
      },
      async () => {
        await connector.login();
        await connector.login();
        assert.equal(connector.sessionCookie, "aoi-session=1");
        await connector.vote(99, 1);
        assert.equal(await connector.postItems(1, []), false);
      }
    );

    assert.equal(calls.filter((call) => call.url.endsWith("/users/login")).length, 1);
    assert.deepEqual(asRecord(calls[1].config).headers, {
      Cookie: "aoi-session=1",
    });
  });

  it("normalizes All Our Ideas login and vote failures", async () => {
    await withAxiosStub(
      {
        post: async () => ({ data: { id: 5 }, headers: {} }),
      },
      async () => {
        await assert.rejects(
          () => createAllOurIdeasConnector().login(),
          /Login failed/
        );
      }
    );

    await withAxiosStub(
      {
        post: async () => undefined as unknown as AxiosResponseLike,
      },
      async () => {
        await assert.rejects(
          () => createAllOurIdeasConnector().login(),
          /Login failed/
        );
      }
    );

    await withAxiosStub(
      {
        post: async () => {
          throw new Error("remote failed");
        },
      },
      async () => {
        const connector = createAllOurIdeasConnector();
        connector.user = { id: 5 } as YpUserData;
        connector.sessionCookie = "aoi-session=1";
        await assert.rejects(() => connector.vote(99, 1), /Voting failed/);
      }
    );

    await withAxiosStub(
      {
        post: async () => undefined as unknown as AxiosResponseLike,
      },
      async () => {
        const connector = createAllOurIdeasConnector();
        connector.user = { id: 5 } as YpUserData;
        connector.sessionCookie = "aoi-session=1";
        await assert.rejects(() => connector.vote(99, 1), /Voting failed/);
      }
    );
  });
});

describe("PsBaseDiscordConnector", () => {
  it("initializes memory, registers listeners, and filters incoming messages", async () => {
    await assert.rejects(
      () => createDiscordConnector({ discordBotToken: "" }).login(),
      /Discord bot token is not set/
    );
    const partialMemory = {
      connectors: {
        discord: {},
      },
    } as PsAgentMemoryData;
    const memoryConnector = createDiscordConnector({}, partialMemory);
    assert.deepEqual(
      memoryConnector.memory.connectors?.discord
        ?.liveDiscordChannelConversations,
      {}
    );
    assert.deepEqual(
      memoryConnector.memory.connectors?.discord
        ?.archivedDiscordChannelConversations,
      {}
    );

    const connector = createDiscordConnector();
    const handledMessages: unknown[] = [];
    const callbacks: Record<string, (message: Record<string, unknown>) => void> =
      {};
    const mockClient = {
      user: { id: "bot-id", tag: "Bot#0001" },
      login: async (token: string) => {
        assert.equal(token, "discord-token");
      },
      once: (event: string, callback: () => void) => {
        callbacks[event] = callback;
      },
      on: (event: string, callback: (message: Record<string, unknown>) => void) => {
        callbacks[event] = callback;
      },
      channels: {
        fetch: async () => undefined,
      },
    };
    (connector as unknown as { client: typeof mockClient }).client = mockClient;
    (connector as unknown as {
      handleMessage: (message: unknown) => Promise<void>;
    }).handleMessage = async (message) => {
      handledMessages.push(message);
    };

    await connector.login();
    callbacks.ready({});
    callbacks.messageCreate({
      channel: { type: ChannelType.DM },
      mentions: { has: () => false },
      content: "dm",
      author: { tag: "User#0001" },
    });
    callbacks.messageCreate({
      channel: { type: ChannelType.GuildText },
      mentions: { has: (id: string) => id === "bot-id" },
      content: "mention",
      author: { tag: "User#0001" },
    });
    callbacks.messageCreate({
      channel: { type: ChannelType.GuildText },
      mentions: { has: () => false },
      content: "ignored",
      author: { tag: "User#0001" },
    });

    assert.equal(handledMessages.length, 2);
    assert.ok(connector.memory.connectors?.discord);

    const failingLoginConnector = createDiscordConnector();
    (failingLoginConnector as unknown as {
      client: { login: () => Promise<void> };
    }).client = {
      login: async () => {
        throw new Error("login failed");
      },
    };
    await assert.rejects(() => failingLoginConnector.login(), /login failed/);
  });

  it("runs response actions and sends model responses", async () => {
    let actionCalls = 0;
    const connector = createDiscordConnector(
      {},
      createMemory(),
      {
        "[[publish]]": async () => {
          actionCalls += 1;
        },
      }
    );
    const sent: Array<{ channelId: string; message: string }> = [];
    (connector as unknown as {
      client: { user: { tag: string } };
      callModel: () => Promise<string>;
      sendMessage: (channelId: string, message: string) => Promise<void>;
    }).client = { user: { tag: "Bot#0001" } };
    (connector as unknown as { callModel: () => Promise<string> }).callModel =
      async () => "Ready [[publish]]";
    (connector as unknown as {
      sendMessage: (channelId: string, message: string) => Promise<void>;
    }).sendMessage = async (channelId, message) => {
      sent.push({ channelId, message });
    };

    assert.deepEqual(await connector.replaceInResponseArray("No action"), {
      modifiedResponse: "No action",
      actionsTriggered: [],
    });

    await connector.respondToUser("channel-1", {
      id: "channel-1",
      timeStartedAt: fixedDate,
      private: false,
      messages: [{ id: "m1", content: "Hello", author: "User#0001", timestamp: fixedDate }],
    });

    assert.equal(actionCalls, 1);
    assert.deepEqual(sent, [{ channelId: "channel-1", message: "Ready " }]);
  });

  it("handles, trims, archives, reads, and sends Discord channel messages", async () => {
    const connector = createDiscordConnector();
    const saveCalls: string[] = [];
    const respondCalls: string[] = [];
    const timeoutCalls: string[] = [];
    const sentMessages: string[] = [];
    const fetchedMessages = [{ content: "first" }, { content: "second" }];
    const mockClient = {
      user: { tag: "Bot#0001" },
      channels: {
        fetch: async () => ({
          send: async (message: string) => {
            sentMessages.push(message);
          },
          messages: {
            fetch: async () => fetchedMessages,
          },
        }),
      },
    };
    (connector as unknown as { client: typeof mockClient }).client = mockClient;
    (connector as unknown as { saveMemory: () => Promise<void> }).saveMemory =
      async () => {
        saveCalls.push("save");
      };
    (connector as unknown as {
      respondToUser: (
        channelId: string,
        conversation: DiscordConversation
      ) => Promise<void>;
    }).respondToUser = async (channelId) => {
      respondCalls.push(channelId);
    };
    (connector as unknown as { setChannelTimeout: (channelId: string) => void })
      .setChannelTimeout = (channelId) => {
      timeoutCalls.push(channelId);
    };

    await connector.handleMessage({
      id: "m1",
      content: "Hello",
      createdAt: fixedDate,
      author: { tag: "User#0001", bot: false },
      channel: { id: "channel-1", type: ChannelType.GuildText },
    } as Parameters<DiscordConnectorInstance["handleMessage"]>[0]);

    assert.deepEqual(timeoutCalls, ["channel-1"]);
    assert.deepEqual(respondCalls, ["channel-1"]);
    assert.equal(saveCalls.length, 2);

    const liveConversation =
      connector.memory.connectors!.discord!.liveDiscordChannelConversations[
        "channel-1"
      ];
    assert.equal(liveConversation.messages.length, 1);

    liveConversation.messages = Array.from({ length: connector.maxMessages }, (
      _value,
      index
    ) => ({
      id: `old-${index}`,
      content: `old ${index}`,
      author: "User#0001",
      timestamp: fixedDate,
    }));

    await connector.handleMessage({
      id: "bot-message",
      content: "Bot note",
      createdAt: fixedDate,
      author: { tag: "Bot#0001", bot: true },
      channel: { id: "channel-1", type: ChannelType.GuildText },
    } as Parameters<DiscordConnectorInstance["handleMessage"]>[0]);
    assert.equal(liveConversation.messages.length, connector.maxMessages);
    assert.equal(liveConversation.messages.at(-1)?.id, "bot-message");
    assert.equal(respondCalls.length, 1);

    connector.archiveConversation("channel-1");
    assert.equal(
      connector.memory.connectors!.discord!.liveDiscordChannelConversations[
        "channel-1"
      ],
      undefined
    );
    assert.equal(
      connector.memory.connectors!.discord!.archivedDiscordChannelConversations[
        "channel-1"
      ].messages.length,
      connector.maxMessages
    );

    await connector.sendMessage("channel-1", "send");
    await connector.sendNotification("channel-1", "notify");
    assert.deepEqual(await connector.getMessages("channel-1"), [
      "first",
      "second",
    ]);
    assert.deepEqual(sentMessages, ["send", "notify"]);
  });

  it("resets channel archive timers", () => {
    const connector = createDiscordConnector({
      discordBotToken: "discord-token",
    });
    const timerGlobal = globalThis as unknown as {
      setTimeout: typeof setTimeout;
      clearTimeout: typeof clearTimeout;
    };
    const originalSetTimeout = timerGlobal.setTimeout;
    const originalClearTimeout = timerGlobal.clearTimeout;
    const timeoutCallbacks: Array<() => void> = [];
    let clearCount = 0;
    (connector as unknown as { archiveConversation: (channelId: string) => void })
      .archiveConversation = (channelId) => {
      assert.equal(channelId, "channel-1");
      clearCount += 10;
    };
    timerGlobal.setTimeout = ((handler: () => void) => {
      timeoutCallbacks.push(handler);
      return {} as NodeJS.Timeout;
    }) as typeof setTimeout;
    timerGlobal.clearTimeout = (() => {
      clearCount += 1;
    }) as typeof clearTimeout;

    try {
      connector.setChannelTimeout("channel-1");
      connector.setChannelTimeout("channel-1");
      assert.equal(clearCount, 1);
      timeoutCallbacks[1]();
      assert.equal(clearCount, 11);
    } finally {
      timerGlobal.setTimeout = originalSetTimeout;
      timerGlobal.clearTimeout = originalClearTimeout;
    }
  });

  it("rethrows Discord client send and fetch failures", async () => {
    const connector = createDiscordConnector();
    const fetchError = new Error("discord fetch failed");
    (connector as unknown as {
      client: { channels: { fetch: () => Promise<unknown> } };
    }).client = {
      channels: {
        fetch: async () => {
          throw fetchError;
        },
      },
    };

    await assert.rejects(
      () => connector.sendMessage("channel-1", "message"),
      /discord fetch failed/
    );
    await assert.rejects(
      () => connector.getMessages("channel-1"),
      /discord fetch failed/
    );
    await assert.rejects(
      () => connector.sendNotification("channel-1", "message"),
      /discord fetch failed/
    );
  });
});
