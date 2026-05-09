import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { Job, QueueEvents, Worker } from "bullmq";

import type { PsAgentStartJobData } from "../../base/agentQueue.js";
import type { PsAgent } from "../../dbModels/agent.js";

process.env.DISABLE_DB_INIT = "true";
process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";
process.env.DB_PORT ??= "5432";

const { PolicySynthAgent } = await import("../../base/agent.js");
const { PolicySynthAgentQueue } = await import("../../base/agentQueue.js");
const { PsBaseAgentRunner } = await import("../../base/agentRunner.js");
const { PsAgent: PsAgentModel } = await import("../../dbModels/agent.js");
const { PsAgentClass } = await import("../../dbModels/agentClass.js");
const { PsAgentConnectorClass } = await import(
  "../../dbModels/agentConnectorClass.js"
);
const { PsAgentRegistry } = await import("../../dbModels/agentRegistry.js");

const originalRedisUrl = process.env.REDIS_URL;
const originalAgentConcurrency = process.env.PS_AGENTS_CONCURRENCY;
const originalUserId = process.env.YP_USER_ID_FOR_AGENT_CREATION;

afterEach(() => {
  restoreEnv("REDIS_URL", originalRedisUrl);
  restoreEnv("PS_AGENTS_CONCURRENCY", originalAgentConcurrency);
  restoreEnv("YP_USER_ID_FOR_AGENT_CREATION", originalUserId);
});

const restoreEnv = (key: string, value: string | undefined) => {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
};

class FakeRedis {
  public readonly values = new Map<string, string>();
  public readonly handlers = new Map<string, (...args: unknown[]) => void>();
  public readonly options = {
    host: "127.0.0.1",
    port: 6379,
  };

  async get(key: string) {
    return this.values.get(key) ?? null;
  }

  async set(key: string, value: string) {
    this.values.set(key, value);
    return "OK";
  }

  on(event: string, handler: (...args: unknown[]) => void) {
    this.handlers.set(event, handler);
    return this;
  }

  emit(event: string, ...args: unknown[]) {
    this.handlers.get(event)?.(...args);
  }

  disconnect() {
    return;
  }
}

class FakeWorker {
  public readonly handlers = new Map<string, (...args: unknown[]) => void>();
  public pausedWith: boolean | undefined;

  constructor(private readonly processor: (job: Job) => Promise<void>) {}

  on(event: string, handler: (...args: unknown[]) => void) {
    this.handlers.set(event, handler);
    return this;
  }

  async pause(force: boolean) {
    this.pausedWith = force;
  }

  async run(data: PsAgentStartJobData, id = "job-1") {
    await this.processor({ id, data } as unknown as Job);
  }

  emit(event: string, ...args: unknown[]) {
    this.handlers.get(event)?.(...args);
  }
}

class FakeQueueEvents {
  public readonly handlers = new Map<string, (...args: unknown[]) => void>();

  on(event: string, handler: (...args: unknown[]) => void) {
    this.handlers.set(event, handler);
    return this;
  }

  emit(event: string, payload: unknown = {}) {
    this.handlers.get(event)?.(payload);
  }
}

const createAgentRecord = (overrides: Partial<PsAgent> = {}) =>
  ({
    id: 7,
    user_id: 11,
    redisStatusKey: "status:7",
    redisMemoryKey: "memory:7",
    configuration: { answers: [] },
    AiModels: [],
    Group: { private_access_configuration: [] },
    Class: { name: "Queue Agent" },
    ...overrides,
  }) as unknown as PsAgent;

class QueueProcessor extends PolicySynthAgent {
  static processed: Array<{
    agentId: number;
    startProgress: number;
    endProgress: number;
    memory: PsAgentMemoryData;
  }> = [];

  private readonly processorStartProgress: number;
  private readonly processorEndProgress: number;

  constructor(
    agent: PsAgent,
    memory: PsAgentMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.processorStartProgress = startProgress;
    this.processorEndProgress = endProgress;
  }

  override async process() {
    QueueProcessor.processed.push({
      agentId: this.agent.id,
      startProgress: this.processorStartProgress,
      endProgress: this.processorEndProgress,
      memory: this.memory,
    });
  }
}

class RealInitQueue extends PolicySynthAgentQueue {
  get processors() {
    return [{ processor: QueueProcessor, weight: 100 }];
  }

  get agentQueueName() {
    return "real-init-queue";
  }

  async setupMemoryIfNeeded() {
    return;
  }
}

class TestAgentQueue extends PolicySynthAgentQueue {
  public createdWorkers: FakeWorker[] = [];
  public createdQueueEvents: FakeQueueEvents[] = [];
  public setupMemoryCalls: number[] = [];

  override initializeRedis() {
    this.redisClient = new FakeRedis() as unknown as TestAgentQueue["redisClient"];
  }

  get processors() {
    return [
      { processor: QueueProcessor, weight: 40 },
      { processor: QueueProcessor, weight: 60 },
    ];
  }

  get agentQueueName() {
    return "test-agent-queue";
  }

  get redisForTest() {
    return this.redisClient as unknown as FakeRedis;
  }

  public setAgentForTest(agent: PsAgent) {
    Reflect.get(this, "agentsMap").set(agent.id, agent);
  }

  public getMemoryForTest(agentId: number) {
    return Reflect.get(this, "agentMemoryMap").get(
      agentId
    ) as PsAgentMemoryData | undefined;
  }

  public getStatusForTest(agentId: number) {
    return Reflect.get(this, "agentStatusMap").get(
      agentId
    ) as PsAgentStatus | undefined;
  }

  async setupMemoryIfNeeded(agentId: number) {
    this.setupMemoryCalls.push(agentId);
  }

  protected override createWorker(
    _queueName: string,
    processor: (job: Job) => Promise<void>,
    _options: ConstructorParameters<typeof Worker>[2]
  ): Worker {
    const worker = new FakeWorker(processor);
    this.createdWorkers.push(worker);
    return worker as unknown as Worker;
  }

  protected override createQueueEvents(
    _queueName: string,
    _options: ConstructorParameters<typeof QueueEvents>[1]
  ): QueueEvents {
    const queueEvents = new FakeQueueEvents();
    this.createdQueueEvents.push(queueEvents);
    return queueEvents as unknown as QueueEvents;
  }
}

class NamelessQueue extends TestAgentQueue {
  override get agentQueueName() {
    return "";
  }
}

const agentClassInfo = {
  class_base_id: "agent-class-base",
  version: 1,
  name: "Runner Agent",
  configuration: { queueName: "runner-queue" },
} as unknown as PsAgentClassCreationAttributes;

const connectorClassInfo = {
  class_base_id: "connector-class-base",
  version: 1,
  name: "Runner Connector",
  configuration: {},
} as unknown as PsAgentConnectorClassCreationAttributes;

type RegistryFake = {
  addedAgents: unknown[];
  addedConnectors: unknown[];
  removedAgents: unknown[];
  removedConnectors: unknown[];
  addAgent: (agent: unknown) => Promise<void>;
  addConnector: (connector: unknown) => Promise<void>;
  removeAgent: (agent: unknown) => Promise<void>;
  removeConnector: (connector: unknown) => Promise<void>;
};

const createRegistry = (): RegistryFake => ({
  addedAgents: [],
  addedConnectors: [],
  removedAgents: [],
  removedConnectors: [],
  async addAgent(agent) {
    this.addedAgents.push(agent);
  },
  async addConnector(connector) {
    this.addedConnectors.push(connector);
  },
  async removeAgent(agent) {
    this.removedAgents.push(agent);
  },
  async removeConnector(connector) {
    this.removedConnectors.push(connector);
  },
});

class RunnerQueue {
  public setupCount = 0;
  public pauseCount = 0;

  constructor(public readonly agentQueueName = "runner-queue") {}

  async setupAgentQueue() {
    this.setupCount += 1;
  }

  async pauseAllWorkersGracefully() {
    this.pauseCount += 1;
  }
}

class TestRunner extends PsBaseAgentRunner {
  protected agentClasses = [agentClassInfo];
  protected connectorClasses = [connectorClassInfo];
  public setupAgentsCount = 0;
  public connectCount = 0;
  public initializeCount = 0;
  public readonly runnerQueue = new RunnerQueue();

  protected override async connectToDatabase() {
    this.connectCount += 1;
  }

  protected override async initializeModels() {
    this.initializeCount += 1;
  }

  async setupAgents() {
    this.setupAgentsCount += 1;
    (Reflect.get(this, "agentsToRun") as unknown[]).push(this.runnerQueue);
  }

  public setRegistryForTest(registry: RegistryFake | null) {
    Reflect.set(this, "agentRegistry", registry);
  }

  public addRegisteredForTest(agentClass: unknown, connectorClass: unknown) {
    (Reflect.get(this, "registeredAgentClasses") as unknown[]).push(agentClass);
    (Reflect.get(this, "registeredConnectorClasses") as unknown[]).push(
      connectorClass
    );
  }

  public async createAgentClassesForTest() {
    await this.createAgentClassesIfNeeded();
  }

  public async createConnectorClassesForTest() {
    await this.createConnectorClassesIfNeeded();
  }
}

describe("PolicySynthAgentQueue", () => {
  it("initializes Redis options without connecting eagerly", () => {
    process.env.REDIS_URL = "rediss://h:secret@localhost:6380";
    const queue = new RealInitQueue();
    assert.equal(queue.redisClient.options.lazyConnect, true);
    assert.equal(queue.redisClient.options.tls?.rejectUnauthorized, false);
    queue.redisClient.emit("error", new Error("redis test error"));
    queue.redisClient.emit("connect");
    queue.redisClient.emit("reconnecting");
    queue.redisClient.emit("ready");
    queue.redisClient.disconnect();

    process.env.REDIS_URL = "redis://h:secret@localhost:6379";
    const hAliasQueue = new RealInitQueue();
    assert.equal(hAliasQueue.redisClient.options.tls, undefined);
    hAliasQueue.redisClient.disconnect();

    delete process.env.REDIS_URL;
    const fallbackQueue = new RealInitQueue();
    assert.equal(fallbackQueue.redisClient.options.tls, undefined);
    fallbackQueue.redisClient.disconnect();
  });

  it("loads agents, memory, statuses, and processor instances", async () => {
    const queue = new TestAgentQueue();
    const agent = createAgentRecord();
    queue.redisForTest.values.set("memory:7", JSON.stringify({ agentId: 7 }));
    queue.redisForTest.values.set(
      "status:7",
      JSON.stringify({
        state: "running",
        progress: 5,
        messages: ["loaded"],
        lastUpdated: 1,
      } satisfies PsAgentStatus)
    );

    const originalFindByPk = PsAgentModel.findByPk;
    try {
      Reflect.set(PsAgentModel, "findByPk", async () => null);
      await assert.rejects(
        () => queue.getOrCreatePsAgent(7),
        /Agent not found/
      );
      Reflect.set(PsAgentModel, "findByPk", async (agentId: number) =>
        agentId === 7 ? agent : null
      );
      assert.equal(await queue.getOrCreatePsAgent(7), agent);
      assert.equal(await queue.getOrCreatePsAgent(7), agent);
    } finally {
      Reflect.set(PsAgentModel, "findByPk", originalFindByPk);
    }

    const instance = queue.getOrCreateAgentInstance(7);
    assert.ok(instance instanceof QueueProcessor);
    assert.equal(queue.getOrCreateAgentInstance(7), instance);

    const memory = await queue.loadAgentMemoryIfNeeded(7);
    assert.equal(memory.agentId, 7);
    assert.equal(queue.getMemoryForTest(7), memory);
    assert.equal((await queue.loadAgentStatusFromRedis(7))?.state, "running");

    await queue.saveAgentStatusToRedis(7);
    await queue.setupStatusIfNeeded(7);
    await queue.updateAgentStatus(7, "paused", "custom pause");
    assert.equal(queue.getStatusForTest(7)?.state, "paused");
    assert.equal(queue.getStatusForTest(7)?.messages.at(-1), "custom pause");

    assert.equal(await queue.loadAgentStatusFromRedis(999), undefined);
    await queue.saveAgentStatusToRedis(999);
    await assert.rejects(
      () => queue.loadAgentMemoryIfNeeded(999),
      /No PsAgent found/
    );
    assert.throws(() => queue.getOrCreateAgentInstance(999), /not found/);

    const emptyStatusQueue = new TestAgentQueue();
    emptyStatusQueue.setAgentForTest(agent);
    await emptyStatusQueue.setupStatusIfNeeded(7);
    assert.equal(emptyStatusQueue.getStatusForTest(7)?.state, "running");
    await emptyStatusQueue.updateAgentStatus(123, "running");
    await emptyStatusQueue.saveAgentStatusToRedis(123);

    const throwingStatusQueue = new TestAgentQueue();
    throwingStatusQueue.setAgentForTest(agent);
    Reflect.set(throwingStatusQueue.redisForTest, "get", async () => {
      throw new Error("redis down");
    });
    assert.equal(await throwingStatusQueue.loadAgentStatusFromRedis(7), undefined);
  });

  it("sets up workers, dispatches actions, handles queue events, and pauses", async () => {
    process.env.PS_AGENTS_CONCURRENCY = "3";
    QueueProcessor.processed = [];
    const queue = new TestAgentQueue();
    const agent = createAgentRecord();
    queue.setAgentForTest(agent);
    queue.redisForTest.values.set("memory:7", JSON.stringify({ agentId: 7 }));

    await queue.setupAgentQueue();
    assert.equal(queue.createdWorkers.length, 1);
    assert.equal(queue.createdQueueEvents.length, 1);

    const worker = queue.createdWorkers[0];
    worker.emit("completed", { id: "complete" });
    worker.emit("failed", undefined, new Error("failed"));
    worker.emit("error", new Error("worker error"));
    worker.emit("active", { id: "active" });
    worker.emit("stalled", "stalled-id");

    const queueEvents = queue.createdQueueEvents[0];
    queueEvents.emit("waiting", { jobId: "waiting" });
    queueEvents.emit("progress", { jobId: "progress", data: 50 });
    queueEvents.emit("drained");
    queueEvents.emit("removed", { jobId: "removed" });

    await worker.run({
      agentId: 7,
      action: "start",
      structuredAnswersOverrides: [{ uniqueId: "u", value: "v" }],
    });
    assert.equal(queue.setupMemoryCalls.includes(7), true);
    assert.equal(QueueProcessor.processed.length, 2);
    assert.equal(QueueProcessor.processed[0].startProgress, 0);
    assert.equal(QueueProcessor.processed[1].endProgress, 100);
    assert.equal(
      queue.getMemoryForTest(7)?.structuredAnswersOverrides?.[0].uniqueId,
      "u"
    );

    await worker.run({ agentId: 7, action: "pause" }, "pause-job");
    assert.equal(queue.getStatusForTest(7)?.state, "paused");
    await assert.rejects(
      () => worker.run({ agentId: 7, action: "stop" }, "stop-job"),
      /StoppedByUser/
    );
    await assert.rejects(
      () =>
        worker.run(
          { agentId: 7, action: "unknown" } as unknown as PsAgentStartJobData,
          "unknown-job"
        ),
      /Unknown action/
    );

    await queue.pauseAllWorkersGracefully();
    assert.equal(worker.pausedWith, true);

    const namelessQueue = new NamelessQueue();
    await namelessQueue.setupAgentQueue();
    assert.equal(namelessQueue.createdWorkers.length, 0);
  });

  it("rethrows processor setup failures", async () => {
    const queue = new TestAgentQueue();
    await assert.rejects(() => queue.processAllAgents(7), /not loaded/);
  });
});

describe("PsBaseAgentRunner", () => {
  it("requires an agent creation user id", () => {
    delete process.env.YP_USER_ID_FOR_AGENT_CREATION;
    assert.throws(() => new TestRunner(), /YP_USER_ID_FOR_AGENT_CREATION/);
  });

  it("registers classes, agents, connectors, and setup flow", async () => {
    process.env.YP_USER_ID_FOR_AGENT_CREATION = "42";
    const runner = new TestRunner();
    const registry = createRegistry();
    const dbAgentClass = { name: "DB Agent", class_base_id: "agent-class-base" };
    const dbConnectorClass = {
      name: "DB Connector",
      class_base_id: "connector-class-base",
    };

    const originalRegistryFindOrCreate = PsAgentRegistry.findOrCreate;
    const originalAgentClassFindOne = PsAgentClass.findOne;
    const originalAgentClassFindOrCreate = PsAgentClass.findOrCreate;
    const originalConnectorFindOne = PsAgentConnectorClass.findOne;
    const originalConnectorFindOrCreate = PsAgentConnectorClass.findOrCreate;
    try {
      Reflect.set(PsAgentRegistry, "findOrCreate", async () => [registry, true]);
      Reflect.set(PsAgentClass, "findOne", async () => dbAgentClass);
      Reflect.set(PsAgentClass, "findOrCreate", async () => [dbAgentClass, true]);
      Reflect.set(PsAgentConnectorClass, "findOne", async () => dbConnectorClass);
      Reflect.set(PsAgentConnectorClass, "findOrCreate", async () => [
        dbConnectorClass,
        true,
      ]);

      assert.equal(await runner.getOrCreateAgentRegistry(), registry);
      runner.setRegistryForTest(registry);
      await runner.createAgentClassesForTest();
      await runner.createConnectorClassesForTest();
      await runner.registerAgent(
        runner.runnerQueue as unknown as InstanceType<typeof PolicySynthAgentQueue>
      );
      await runner.registerConnectors();
      assert.equal(registry.addedAgents.length, 1);
      assert.equal(registry.addedConnectors.length, 1);

      runner.inspectDynamicMethods(
        Object.assign(Object.create({ protoMethod() {} }), {
          dynamicMethod() {},
          value: 1,
        }),
        "Dynamic"
      );

      const setupRunner = new TestRunner();
      await setupRunner.setupAndRunAgents();
      assert.equal(setupRunner.connectCount, 1);
      assert.equal(setupRunner.initializeCount, 1);
      assert.equal(setupRunner.setupAgentsCount, 1);
      assert.equal(setupRunner.runnerQueue.setupCount, 1);
    } finally {
      Reflect.set(PsAgentRegistry, "findOrCreate", originalRegistryFindOrCreate);
      Reflect.set(PsAgentClass, "findOne", originalAgentClassFindOne);
      Reflect.set(PsAgentClass, "findOrCreate", originalAgentClassFindOrCreate);
      Reflect.set(PsAgentConnectorClass, "findOne", originalConnectorFindOne);
      Reflect.set(
        PsAgentConnectorClass,
        "findOrCreate",
        originalConnectorFindOrCreate
      );
    }
  });

  it("handles runner registration failures and run errors", async () => {
    process.env.YP_USER_ID_FOR_AGENT_CREATION = "42";
    const runner = new TestRunner();
    await assert.rejects(
      () =>
        runner.registerAgent(
          runner.runnerQueue as unknown as InstanceType<
            typeof PolicySynthAgentQueue
          >
        ),
      /Agent registry not initialized/
    );
    await assert.rejects(() => runner.registerConnectors(), /not initialized/);

    const registry = createRegistry();
    runner.setRegistryForTest(registry);
    const unknownQueue = new RunnerQueue("unknown");
    await assert.rejects(
      () =>
        runner.registerAgent(
          unknownQueue as unknown as InstanceType<typeof PolicySynthAgentQueue>
        ),
      /Agent class information not found/
    );

    const originalAgentClassFindOne = PsAgentClass.findOne;
    const originalConnectorFindOne = PsAgentConnectorClass.findOne;
    try {
      Reflect.set(PsAgentClass, "findOne", async () => null);
      await assert.rejects(
        () =>
          runner.registerAgent(
            runner.runnerQueue as unknown as InstanceType<
              typeof PolicySynthAgentQueue
            >
          ),
        /Agent class not found/
      );

      Reflect.set(PsAgentConnectorClass, "findOne", async () => null);
      await assert.rejects(
        () => runner.registerConnectors(),
        /Connector class not found/
      );
    } finally {
      Reflect.set(PsAgentClass, "findOne", originalAgentClassFindOne);
      Reflect.set(PsAgentConnectorClass, "findOne", originalConnectorFindOne);
    }

    class FailingRunner extends TestRunner {
      override async setupAndRunAgents() {
        throw new Error("setup failed");
      }
    }
    await new FailingRunner().run();
  });

  it("installs graceful shutdown handlers and runs them without exiting tests", async () => {
    process.env.YP_USER_ID_FOR_AGENT_CREATION = "42";
    const runner = new TestRunner();
    const registry = createRegistry();
    const agentClass = { name: "Registered Agent" };
    const connectorClass = { name: "Registered Connector" };
    runner.setRegistryForTest(registry);
    runner.addRegisteredForTest(agentClass, connectorClass);
    Reflect.get(runner, "agentsToRun").push(runner.runnerQueue);

    const originalExit = process.exit;
    const exitCodes: Array<string | number | null | undefined> = [];
    Reflect.set(process, "exit", ((code?: string | number | null) => {
      exitCodes.push(code);
      throw new Error("process exit");
    }) as typeof process.exit);

    runner.setupGracefulShutdown();
    const sigterm = process.listeners("SIGTERM").at(-1);
    const sigint = process.listeners("SIGINT").at(-1);
    assert.equal(typeof sigterm, "function");
    assert.equal(typeof sigint, "function");

    try {
      await assert.rejects(
        () => (sigterm as () => Promise<void>)(),
        /process exit/
      );
      await assert.rejects(
        () => (sigint as () => Promise<void>)(),
        /process exit/
      );
    } finally {
      if (typeof sigterm === "function") {
        process.removeListener("SIGTERM", sigterm);
      }
      if (typeof sigint === "function") {
        process.removeListener("SIGINT", sigint);
      }
      Reflect.set(process, "exit", originalExit);
    }

    assert.deepEqual(exitCodes, [0, 0]);
    assert.equal(runner.runnerQueue.pauseCount, 1);
    assert.equal(registry.removedAgents.length, 1);
    assert.equal(registry.removedConnectors.length, 1);
  });
});
