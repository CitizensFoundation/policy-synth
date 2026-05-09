import assert from "node:assert/strict";
import { after, describe, it } from "node:test";

import { PsAiModelSize, PsAiModelType } from "../../aiModelTypes.js";
import { PsYourPrioritiesConnector } from "../../connectors/collaboration/yourPrioritiesConnector.js";

type AgentQueueManagerRuntime =
  import("../../operations/agentQueueManager.js").AgentQueueManagerRuntime;
type AgentQueueManagerRuntimeConstructors =
  import("../../operations/agentQueueManager.js").AgentQueueManagerRuntimeConstructors;

process.env.NODE_ENV = "test";
process.env.PSQL_DB_NAME ??= "policy_synth_test";
process.env.PSQL_DB_USER ??= "policy_synth_test";
process.env.PSQL_DB_PASS ??= "policy_synth_test";
process.env.SYNC_DB_FOR_APP = "false";

const [
  dbModels,
  { AgentConnectorManager },
  { AgentCostItemManager },
  { AgentCostManager },
  { AgentManager },
  { AgentQueueManager, buildAgentQueueManagerRuntime },
  { AgentRegistryManager },
] = await Promise.all([
  import("../../dbModels/index.js"),
  import("../../operations/agentConnectorManager.js"),
  import("../../operations/agentCostItemManager.js"),
  import("../../operations/agentCostsManager.js"),
  import("../../operations/agentManager.js"),
  import("../../operations/agentQueueManager.js"),
  import("../../operations/agentRegistryManager.js"),
]);

const {
  Group,
  PsAgent,
  PsAgentClass,
  PsAgentConnector,
  PsAgentConnectorClass,
  PsAiModel,
  sequelize,
} = dbModels;

type PatchTarget = Record<string, unknown>;

const withPatched = async <T>(
  target: object,
  key: string,
  value: unknown,
  callback: () => Promise<T> | T
): Promise<T> => {
  const record = target as PatchTarget;
  const original = record[key];
  record[key] = value;
  try {
    return await callback();
  } finally {
    record[key] = original;
  }
};

const withEnv = async <T>(
  key: string,
  value: string | undefined,
  callback: () => Promise<T> | T
): Promise<T> => {
  const original = process.env[key];
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
  try {
    return await callback();
  } finally {
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
};

const createTransaction = () => {
  const calls: string[] = [];
  return {
    calls,
    transaction: {
      commit: async () => calls.push("commit"),
      rollback: async () => calls.push("rollback"),
    },
  };
};

const prices: PsBaseModelPriceConfiguration = {
  costInTokensPerMillion: 1_000_000,
  costOutTokensPerMillion: 2_000_000,
  costInCachedContextTokensPerMillion: 500_000,
  longContextTokenThreshold: 100,
  longContextCostInTokensPerMillion: 3_000_000,
  longContextCostInCachedContextTokensPerMillion: 1_000_000,
  longContextCostOutTokensPerMillion: 4_000_000,
  currency: "USD",
};

const usageItemData = (
  overrides: Partial<PsModelUsageItemData> = {}
): PsModelUsageItemData => ({
  version: 1,
  provider: "openai",
  apiFamily: "chat",
  timestamp: "2025-01-01T00:00:00.000Z",
  model: {
    name: "GPT",
    type: PsAiModelType.Text,
    size: PsAiModelSize.Medium,
  },
  actor: {
    userId: 1,
    agentId: 10,
  },
  request: {},
  pricing: {
    configuredPrices: prices,
  },
  usageNormalized: {
    tokensIn: 200,
    cachedInTokens: 50,
    tokensOut: 40,
    reasoningTokens: 10,
    audioTokens: 5,
    imageTokens: 5,
  },
  ...overrides,
});

after(async () => {
  await sequelize.close();
});

describe("AgentRegistryManager", () => {
  it("returns only latest active agent and connector class versions", async () => {
    const manager = new AgentRegistryManager();
    const oldAgent = { class_base_id: "agent-a", version: 1 };
    const newAgent = { class_base_id: "agent-a", version: 2 };
    const otherAgent = { class_base_id: "agent-b", version: 1 };
    const oldConnector = { class_base_id: "connector-a", version: 1 };
    const newConnector = { class_base_id: "connector-a", version: 3 };
    const staleConnector = { class_base_id: "connector-a", version: 2 };
    const otherConnector = { class_base_id: "connector-b", version: 1 };

    await withPatched(PsAgentClass, "findAll", async () => [
      oldAgent,
      newAgent,
      otherAgent,
    ], async () => {
      assert.deepEqual(await manager.getActiveAgentClasses(7), [
        newAgent,
        otherAgent,
      ]);
    });

    await withPatched(PsAgentConnectorClass, "findAll", async () => [
      oldConnector,
      newConnector,
      staleConnector,
      otherConnector,
    ], async () => {
      assert.deepEqual(await manager.getActiveConnectorClasses(7), [
        newConnector,
        otherConnector,
      ]);
    });
  });
});

describe("AgentCostItemManager", () => {
  it("calculates detailed, aggregate, and single-agent costs from usage items", async () => {
    const manager = new AgentCostItemManager();
    const rows = [
      {
        created_at: new Date("2025-01-01T00:00:00.000Z"),
        agent_id: 10,
        agent_name: null,
        ai_model_name: null,
        data: JSON.stringify(usageItemData()),
        price_cfg: prices,
      },
      {
        created_at: new Date("2025-01-02T00:00:00.000Z"),
        agent_id: 11,
        agent_name: "Agent 11",
        ai_model_name: "Explicit model",
        data: usageItemData({
          provider: "anthropic",
          providerMetadata: { appliedSpeed: "fast" },
          usage: {
            token_in_count: 10,
            token_out_count: 20,
          },
        }),
        price_cfg: prices,
      },
      {
        created_at: new Date("2025-01-03T00:00:00.000Z"),
        agent_id: 12,
        data: "{bad json",
        price_cfg: prices,
      },
    ];

    await withPatched(
      sequelize,
      "query",
      async (sql: string) => {
        if (sql.includes("WITH RECURSIVE")) {
          return [
            { id: 10, level: 0 },
            { id: 11, level: 1 },
          ];
        }
        return rows;
      },
      async () => {
        const detailed = await manager.getDetailedAgentCosts([10, 11]);
        assert.equal(detailed.length, 2);
        assert.equal(detailed[0].agentName, "Agent 10");
        assert.equal(detailed[0].aiModelName, "GPT");
        assert.equal(detailed[0].tokenInCount, 200);
        assert.equal(detailed[0].tokenOutCount, 40);
        assert.equal(detailed[0].totalCost, 660);
        assert.equal(detailed[1].totalCost, 50);

        assert.deepEqual(await manager.getAgentCosts(10, [10, 11]), {
          agentCosts: [
            { agentId: 10, level: 0, cost: 660 },
            { agentId: 11, level: 1, cost: 50 },
          ],
          totalCost: "710.00",
        });
        assert.equal(await manager.getSingleAgentCosts(10), "710.00");
      }
    );
  });

  it("handles inference metadata, legacy usage shapes, and zero-priced rows", async () => {
    const manager = new AgentCostItemManager();
    const noLongPrices: PsBaseModelPriceConfiguration = {
      ...prices,
      longContextTokenThreshold: 1_000,
    };
    const effectivePrices: PsBaseModelPriceConfiguration = {
      ...noLongPrices,
      costInTokensPerMillion: 5_000_000,
      costOutTokensPerMillion: 7_000_000,
    };
    const createRow = (
      agentId: number,
      data: PsModelUsageItemData,
      priceConfig: PsBaseModelPriceConfiguration | null = noLongPrices
    ) => ({
      created_at: new Date(`2025-02-${String(agentId - 19).padStart(2, "0")}T00:00:00.000Z`),
      agent_id: agentId,
      data,
      price_cfg: priceConfig,
    });
    const rows = [
      createRow(
        20,
        usageItemData({
          provider: "openai",
          providerMetadata: { appliedServiceTier: "standard" },
          pricing: { configuredPrices: noLongPrices },
          usage: { token_in_count: 1, token_out_count: 2 },
          usageNormalized: undefined,
        })
      ),
      createRow(
        21,
        usageItemData({
          provider: "anthropic",
          providerMetadata: { appliedSpeed: "slow" },
          pricing: { configuredPrices: noLongPrices },
          usage: { token_in_count: 1, token_out_count: 1 },
          usageNormalized: undefined,
        })
      ),
      createRow(
        22,
        usageItemData({
          provider: "anthropic",
          providerMetadata: { appliedServiceTier: "priority" },
          pricing: { configuredPrices: noLongPrices },
          usage: { token_in_count: 1, token_out_count: 1 },
          usageNormalized: undefined,
        })
      ),
      createRow(
        23,
        usageItemData({
          pricing: {
            configuredPrices: noLongPrices,
            effectivePrices,
          },
          usage: {
            tokenInCount: 2,
            tokenOutCount: 3,
          } as unknown as PsModelUsageTokenCounts,
          usageNormalized: undefined,
        })
      ),
      createRow(
        24,
        usageItemData({
          provider: "azure",
          pricing: {
            configuredPrices: noLongPrices,
            effectivePrices,
            inferenceType: "flex",
          },
          usage: { token_in_count: 1, token_out_count: 1 },
          usageNormalized: undefined,
        })
      ),
      createRow(
        25,
        usageItemData({
          pricing: { configuredPrices: noLongPrices },
          accountingSnapshot: {
            tokenInCount: 3,
            tokenOutCount: 4,
            tokenInCachedContextCount: 1,
            longContextTokenInCount: 5,
            longContextTokenInCachedContextCount: 2,
            longContextTokenOutCount: 6,
            longContextApplied: true,
          },
          usageNormalized: undefined,
        })
      ),
      createRow(
        26,
        usageItemData({
          pricing: { configuredPrices: noLongPrices },
          providerData: {
            apiFamily: "chat",
            usageNormalized: {
              tokensIn: 5,
              tokensOut: 4,
              cachedInTokens: 2,
            },
          },
          usageNormalized: undefined,
        })
      ),
      createRow(
        27,
        {
          ...usageItemData({
            usage: { token_in_count: 1, token_out_count: 1 },
            usageNormalized: undefined,
          }),
          pricing: {
            configuredPrices:
              undefined as unknown as PsBaseModelPriceConfiguration,
          },
        },
        null
      ),
    ];

    await withPatched(
      sequelize,
      "query",
      async (sql: string) => {
        if (sql.includes("WITH RECURSIVE")) {
          return [{ id: 20, level: 0 }];
        }
        return rows;
      },
      async () => {
        const detailed = await manager.getDetailedAgentCosts(
          rows.map((row) => row.agent_id)
        );
        const byAgentId = new Map(detailed.map((row) => [row.agentId, row]));

        assert.equal(detailed.length, rows.length);
        assert.equal(byAgentId.get(23)?.totalCost, 31);
        assert.equal(byAgentId.get(24)?.totalCost, 3);
        assert.equal(byAgentId.get(26)?.totalCost, 12);
        assert.equal(byAgentId.get(27)?.totalCost, 0);

        const aggregate = await manager.getAgentCosts(
          20,
          rows.map((row) => row.agent_id)
        );
        const aggregateRows = aggregate?.agentCosts as
          | Array<{ agentId: number; level: number }>
          | undefined;
        assert.equal(
          aggregateRows?.find((row) => row.agentId === 21)?.level,
          -1
        );
      }
    );
  });

  it("covers empty ids, legacy snapshots, and rows without usable usage counts", async () => {
    const manager = new AgentCostItemManager();
    let queryCalls = 0;
    await withPatched(
      sequelize,
      "query",
      async () => {
        queryCalls += 1;
        return [];
      },
      async () => {
        assert.deepEqual(await manager.getDetailedAgentCosts([]), []);
      }
    );
    assert.equal(queryCalls, 0);

    const rows = [
      {
        created_at: new Date("2025-04-01T00:00:00.000Z"),
        agent_id: 30,
        data: usageItemData({
          provider: "anthropic",
          providerMetadata: { appliedServiceTier: "standard" },
          usage: { token_in_count: 1, token_out_count: 1 },
          usageNormalized: undefined,
        }),
        price_cfg: prices,
      },
      {
        created_at: new Date("2025-04-02T00:00:00.000Z"),
        agent_id: 31,
        data: usageItemData({
          legacyAccountingSnapshot: {
            tokenInCount: 1,
            tokenOutCount: 2,
            tokenInCachedContextCount: 1,
            longContextTokenInCount: 0,
            longContextTokenInCachedContextCount: 0,
            longContextTokenOutCount: 0,
            longContextApplied: false,
          },
          usageNormalized: undefined,
        }),
        price_cfg: prices,
      },
      {
        created_at: new Date("2025-04-03T00:00:00.000Z"),
        agent_id: 32,
        data: usageItemData({
          usage: undefined,
          usageNormalized: undefined,
          providerData: undefined,
        }),
        price_cfg: prices,
      },
    ];

    await withPatched(
      sequelize,
      "query",
      async (sql: string) => {
        if (sql.includes("WITH RECURSIVE")) {
          return [
            { id: 30, level: 0 },
            { id: 31, level: 1 },
          ];
        }
        return rows;
      },
      async () => {
        const detailed = await manager.getDetailedAgentCosts([30, 31, 32]);
        assert.equal(detailed.length, 2);
        assert.equal(detailed[0].totalCost, 3);
        assert.equal(detailed[1].totalCost, 5.5);
        assert.equal(await manager.getSingleAgentCosts(30), "8.50");
      }
    );
  });

  it("covers price resolution variations for applied tiers and normalized usage", async () => {
    const manager = new AgentCostItemManager();
    const rows = [
      {
        created_at: new Date("2025-05-01T00:00:00.000Z"),
        agent_id: 40,
        data: usageItemData({
          provider: "openai",
          providerMetadata: { appliedServiceTier: "flex" },
          usage: { token_in_count: 1, token_out_count: 1 },
          usageNormalized: undefined,
        }),
        price_cfg: prices,
      },
      {
        created_at: new Date("2025-05-02T00:00:00.000Z"),
        agent_id: 41,
        data: usageItemData({
          provider: "openairesponses",
          pricing: {
            configuredPrices: prices,
            inferenceType: "priority",
            regionalProcessing: "eu",
          },
          usage: { token_in_count: 1, token_out_count: 1 },
          usageNormalized: undefined,
        }),
        price_cfg: prices,
      },
      {
        created_at: new Date("2025-05-03T00:00:00.000Z"),
        agent_id: 42,
        data: usageItemData({
          pricing: {
            configuredPrices:
              undefined as unknown as PsBaseModelPriceConfiguration,
            inferenceMode: "flex",
          } as unknown as PsModelUsageItemData["pricing"],
          usage: { token_in_count: 1, token_out_count: 1 },
          usageNormalized: undefined,
        }),
        price_cfg: prices,
      },
      {
        created_at: new Date("2025-05-04T00:00:00.000Z"),
        agent_id: 43,
        data: usageItemData({
          pricing: { configuredPrices: prices },
          usageNormalized: {
            tokensIn: 5,
            tokensOut: 2,
            reasoningTokens: 5,
          },
        }),
        price_cfg: prices,
      },
      {
        created_at: new Date("2025-05-05T00:00:00.000Z"),
        agent_id: 44,
        data: usageItemData({
          pricing: { configuredPrices: prices },
          usageNormalized: {
            tokensIn: 200,
            tokensOut: 2,
          },
        }),
        price_cfg: prices,
      },
    ];

    await withPatched(sequelize, "query", async () => rows, async () => {
      const detailed = await manager.getDetailedAgentCosts(
        rows.map((row) => row.agent_id)
      );
      assert.equal(detailed.length, rows.length);
      assert.equal(detailed.find((row) => row.agentId === 43)?.tokenOutCount, 5);
      assert.equal(
        detailed.find((row) => row.agentId === 44)?.longContextTokenInCount,
        200
      );
    });
  });

  it("returns empty cost results when no usage item rows exist", async () => {
    const manager = new AgentCostItemManager();
    await withPatched(sequelize, "query", async () => [], async () => {
      assert.deepEqual(await manager.getDetailedAgentCosts([1]), []);
      assert.equal(await manager.getAgentCosts(1, [1]), undefined);
      assert.equal(await manager.getSingleAgentCosts(1), undefined);
    });
  });
});

describe("AgentCostManager", () => {
  it("walks sub-agent ids and calculates legacy usage costs", async () => {
    const manager = new AgentCostManager();
    const usageRows = [
      {
        created_at: new Date("2025-01-01T00:00:00.000Z"),
        agent_id: 1,
        agent_name: "Root",
        ai_model_name: "Model",
        price_cfg: prices,
        token_in_count: "10",
        token_out_count: "20",
        token_in_cached_context_count: "5",
        long_context_token_in_count: "7",
        long_context_token_in_cached_context_count: "3",
        token_out_reasoning_count: "2",
        token_out_audio_count: "1",
        token_out_image_count: "1",
        long_context_token_out_count: "4",
        long_context_token_out_reasoning_count: "3",
        long_context_token_out_audio_count: "2",
        long_context_token_out_image_count: "1",
      },
    ];

    await withPatched(
      sequelize,
      "query",
      async (sql: string, options?: { replacements?: Record<string, unknown> }) => {
        if (sql.includes("parent_agent_id = :currentAgentId")) {
          const id = options?.replacements?.currentAgentId;
          if (id === 1) return [{ id: 2 }];
          return [];
        }
        if (sql.includes("WITH RECURSIVE")) {
          return [
            { id: 1, level: 0 },
            { id: 2, level: 1 },
          ];
        }
        return usageRows;
      },
      async () => {
        const detailed = await manager.getDetailedAgentCosts(1);
        assert.equal(detailed.length, 1);
        assert.equal(detailed[0].totalCost, 124.5);
        assert.equal(detailed[0].tokenInCount, 25);
        assert.equal(detailed[0].tokenOutCount, 34);

        assert.deepEqual(await manager.getAgentCosts(1), {
          agentCosts: [{ agentId: 1, level: 0, cost: 124.5 }],
          totalCost: "124.50",
        });
        assert.equal(await manager.getSingleAgentCosts(1), "124.50");
      }
    );
  });

  it("handles legacy cycles, price fallbacks, and empty single-agent rows", async () => {
    const manager = new AgentCostManager();
    const fallbackPrices = {
      costInTokensPerMillion: 1_000_000,
      costOutTokensPerMillion: 2_000_000,
      costInCachedContextTokensPerMillion: 500_000,
      currency: "USD",
    } as PsBaseModelPriceConfiguration;
    const zeroPrices = {
      costInTokensPerMillion: 0,
      costOutTokensPerMillion: 0,
      costInCachedContextTokensPerMillion: 0,
      currency: "USD",
    } as PsBaseModelPriceConfiguration;
    const usageRows = [
      {
        created_at: new Date("2025-03-01T00:00:00.000Z"),
        agent_id: 2,
        agent_name: "Child",
        ai_model_name: "Fallback model",
        price_cfg: fallbackPrices,
        long_context_token_in_count: "3",
        long_context_token_in_cached_context_count: "2",
        long_context_token_out_count: "4",
        long_context_token_out_reasoning_count: "1",
      },
      {
        created_at: new Date("2025-03-02T00:00:00.000Z"),
        agent_id: 3,
        agent_name: "Grandchild",
        ai_model_name: "Zero model",
        price_cfg: zeroPrices,
      },
    ];

    await withPatched(
      sequelize,
      "query",
      async (sql: string, options?: { replacements?: Record<string, unknown> }) => {
        if (sql.includes("parent_agent_id = :currentAgentId")) {
          const id = options?.replacements?.currentAgentId;
          if (id === 1) return [{ id: 2 }];
          if (id === 2) return [{ id: 1 }, { id: 3 }];
          return [];
        }
        if (sql.includes("WITH RECURSIVE")) {
          return [
            { id: 1, level: 0 },
            { id: 2, level: 1 },
          ];
        }
        if (sql.includes("WHERE mu.agent_id = :agentId")) {
          return [];
        }
        return usageRows;
      },
      async () => {
        const detailed = await manager.getDetailedAgentCosts(1);
        assert.equal(detailed.length, 2);
        assert.equal(detailed[0].totalCost, 11);
        assert.equal(detailed[0].costOutLong, 10);
        assert.equal(detailed[0].costInCachedLong, 1);
        assert.equal(detailed[1].totalCost, 0);

        const aggregate = await manager.getAgentCosts(1);
        const aggregateRows = aggregate.agentCosts as Array<{
          agentId: number;
          level: number;
          cost: number;
        }>;
        assert.deepEqual(aggregateRows, [
          { agentId: 3, level: -1, cost: 0 },
          { agentId: 2, level: 1, cost: 11 },
        ]);
        assert.equal(aggregate.totalCost, "11.00");
        assert.equal(await manager.getSingleAgentCosts(99), "0.00");
      }
    );
  });

  it("returns empty legacy aggregates when no agent ids are resolved", async () => {
    const manager = new AgentCostManager();
    (
      manager as unknown as {
        getSubAgentIds: (rootId: number) => Promise<number[]>;
      }
    ).getSubAgentIds = async () => [];

    assert.deepEqual(await manager.getDetailedAgentCosts(1), []);
    assert.deepEqual(await manager.getAgentCosts(1), {
      agentCosts: [],
      totalCost: "0.00",
    });
  });

  it("calculates zero and fallback legacy cost branches directly", () => {
    const manager = new AgentCostManager();
    type LegacyCostBreakdown = {
      costInNormal: number;
      costInCached: number;
      costInLong: number;
      costOutNormal: number;
      costInCachedLong: number;
      costOutLong: number;
      totalCost: number;
    };
    const calcCosts = (
      manager as unknown as {
        calcCosts: (
          usage: PsModelUsageAttributes,
          prices: PsBaseModelPriceConfiguration
        ) => LegacyCostBreakdown;
      }
    ).calcCosts.bind(manager);
    const baseUsage: PsModelUsageAttributes = {
      id: 0,
      user_id: 0,
      created_at: new Date("2025-04-01T00:00:00.000Z"),
      updated_at: new Date("2025-04-01T00:00:00.000Z"),
      model_id: 0,
      token_in_count: 0,
      token_out_count: 0,
    };
    const noPrices = { currency: "USD" } as PsBaseModelPriceConfiguration;

    assert.deepEqual(calcCosts(baseUsage, noPrices), {
      costInNormal: 0,
      costInCached: 0,
      costInLong: 0,
      costOutNormal: 0,
      costInCachedLong: 0,
      costOutLong: 0,
      totalCost: 0,
    });

    const fallbackPrices = {
      costOutTokensPerMillion: 2_000_000,
      costInCachedContextTokensPerMillion: 500_000,
      currency: "USD",
    } as PsBaseModelPriceConfiguration;
    const longOnlyUsage: PsModelUsageAttributes = {
      ...baseUsage,
      long_context_token_out_count: 1,
      long_context_token_in_cached_context_count: 1,
    };

    assert.deepEqual(calcCosts(longOnlyUsage, fallbackPrices), {
      costInNormal: 0,
      costInCached: 0,
      costInLong: 0,
      costOutNormal: 0,
      costInCachedLong: 0.5,
      costOutLong: 2,
      totalCost: 2.5,
    });
    assert.equal(calcCosts(longOnlyUsage, noPrices).totalCost, 0);
  });

  it("sorts legacy aggregate ties and totals single-agent rows with omitted counts", async () => {
    const manager = new AgentCostManager();
    (
      manager as unknown as {
        getSubAgentIds: (rootId: number) => Promise<number[]>;
      }
    ).getSubAgentIds = async () => [5, 4];
    const usageRows = [
      {
        agent_id: 5,
        price_cfg: prices,
        token_in_count: "1",
        token_out_count: "1",
      },
      {
        agent_id: 4,
        price_cfg: prices,
        token_in_count: "1",
        token_out_count: "1",
      },
    ];

    await withPatched(
      sequelize,
      "query",
      async (sql: string) => {
        if (sql.includes("WITH RECURSIVE")) {
          return [
            { id: 5, level: null },
            { id: 4, level: null },
          ];
        }
        if (sql.includes("WHERE mu.agent_id = :agentId")) {
          return [{ price_cfg: prices }];
        }
        return usageRows;
      },
      async () => {
        assert.deepEqual(await manager.getAgentCosts(5), {
          agentCosts: [
            { agentId: 4, level: null, cost: 3 },
            { agentId: 5, level: null, cost: 3 },
          ],
          totalCost: "6.00",
        });
        assert.equal(await manager.getSingleAgentCosts(5), "0.00");
      }
    );
  });

  it("normalizes legacy cost query failures", async () => {
    const manager = new AgentCostManager();
    await withPatched(
      sequelize,
      "query",
      async () => {
        throw new Error("query failed");
      },
      async () => {
        await assert.rejects(
          () => manager.getDetailedAgentCosts(1),
          /Error calculating detailed agent costs/
        );
        await assert.rejects(
          () => manager.getAgentCosts(1),
          /Error calculating agent costs/
        );
        await assert.rejects(
          () => manager.getSingleAgentCosts(1),
          /Error calculating single agent costs/
        );
      }
    );
  });
});

describe("AgentQueueManager", () => {
  it("builds queue runtime adapters from supplied constructors", () => {
    class RuntimeRedis {
      constructor(
        public readonly redisUrl: string,
        public readonly options: unknown
      ) {}

      on() {
        return this;
      }
    }

    class RuntimeQueue {
      constructor(
        public readonly queueName: string,
        public readonly options: { connection: unknown }
      ) {}
    }

    class RuntimeQueueEvents {
      constructor(
        public readonly queueName: string,
        public readonly options: { connection: unknown }
      ) {}
    }

    const runtime = buildAgentQueueManagerRuntime({
      Redis:
        RuntimeRedis as unknown as AgentQueueManagerRuntimeConstructors["Redis"],
      Queue:
        RuntimeQueue as unknown as AgentQueueManagerRuntimeConstructors["Queue"],
      QueueEvents:
        RuntimeQueueEvents as unknown as AgentQueueManagerRuntimeConstructors["QueueEvents"],
    });

    const redis = runtime.createRedis("redis://runtime", {
      maxRetriesPerRequest: null,
    });
    const queue = runtime.createQueue("runtime-queue", redis);
    const queueEvents = runtime.createQueueEvents("runtime-events", redis);

    assert.equal(
      (redis as unknown as RuntimeRedis).redisUrl,
      "redis://runtime"
    );
    assert.equal((queue as unknown as RuntimeQueue).queueName, "runtime-queue");
    assert.equal(
      (queue as unknown as RuntimeQueue).options.connection,
      redis
    );
    assert.equal(
      (queueEvents as unknown as RuntimeQueueEvents).queueName,
      "runtime-events"
    );
    assert.equal(
      (queueEvents as unknown as RuntimeQueueEvents).options.connection,
      redis
    );
  });

  const createQueueRuntime = () => {
    const store = new Map<string, string>();
    const jobs: Array<{ queueName: string; name: string; data: unknown }> = [];
    const redisConnections: Array<{
      redisUrl: string;
      options: Record<string, unknown>;
    }> = [];
    const redisEvents: Record<string, (...args: unknown[]) => void> = {};
    const queueEvents: Record<string, (...args: unknown[]) => void> = {};
    const queueEventEvents: Record<string, (...args: unknown[]) => void> = {};
    const runtime: AgentQueueManagerRuntime = {
      createRedis: (redisUrl, options) => {
        redisConnections.push({
          redisUrl,
          options: options as Record<string, unknown>,
        });
        return {
          on: (event: string, callback: (...args: unknown[]) => void) => {
            redisEvents[event] = callback;
          },
          get: async (key: string) => store.get(key) ?? null,
          set: async (key: string, value: string) => {
            store.set(key, value);
            return "OK";
          },
        } as unknown as ReturnType<AgentQueueManagerRuntime["createRedis"]>;
      },
      createQueue: (queueName) =>
        ({
          on: (event: string, callback: (...args: unknown[]) => void) => {
            queueEvents[event] = callback;
          },
          add: async (name: string, data: unknown) => {
            jobs.push({ queueName, name, data });
          },
        }) as unknown as ReturnType<AgentQueueManagerRuntime["createQueue"]>,
      createQueueEvents: () =>
        ({
          on: (event: string, callback: (...args: unknown[]) => void) => {
            queueEventEvents[event] = callback;
          },
        }) as unknown as ReturnType<
          AgentQueueManagerRuntime["createQueueEvents"]
        >,
    };

    return {
      runtime,
      store,
      jobs,
      redisConnections,
      redisEvents,
      queueEvents,
      queueEventEvents,
    };
  };

  const queueAgent = {
    id: 7,
    uuid: "agent-uuid",
    redisStatusKey: "ps:agent:status:7:agent-uuid",
    Class: { id: 1, configuration: { queueName: "agent-queue" } },
  };

  it("queues control and processing jobs and updates status", async () => {
    const queueRuntime = createQueueRuntime();
    const manager = new AgentQueueManager(queueRuntime.runtime);
    queueRuntime.store.set(
      queueAgent.redisStatusKey,
      JSON.stringify({
        state: "paused",
        progress: 1,
        messages: ["old"],
        lastUpdated: 1,
      } satisfies PsAgentStatus)
    );

    await withPatched(PsAgent, "findByPk", async () => queueAgent, async () => {
      assert.equal(
        await manager.controlAgent(7, "pause"),
        "Pause request for agent 7 queued in agent-queue"
      );
      assert.equal(await manager.startAgentProcessing(7), true);
      assert.equal(await manager.pauseAgentProcessing(7), true);
      assert.deepEqual((await manager.getAgentStatus(7))?.state, "paused");

      assert.equal(
        await manager.updateAgentStatus(7, "running", 50, "half", {
          step: "test",
        }),
        true
      );
      const status = JSON.parse(
        queueRuntime.store.get(queueAgent.redisStatusKey) ?? "{}"
      ) as PsAgentStatus;
      assert.equal(status.state, "running");
      assert.equal(status.progress, 50);
      assert.deepEqual(status.messages, ["old", "half"]);
      assert.deepEqual(status.details, { step: "test" });

      await manager.clearAgentStatusMessages(7);
      assert.deepEqual(
        JSON.parse(
          queueRuntime.store.get(queueAgent.redisStatusKey) ?? "{}"
        ).messages,
        []
      );
    });

    assert.deepEqual(
      queueRuntime.jobs.map((job) => job.name),
      ["pauseAgent", "control-message", "control-message"]
    );
  });

  it("handles missing agents, missing queue names, and absent statuses", async () => {
    const queueRuntime = createQueueRuntime();
    const manager = new AgentQueueManager(queueRuntime.runtime);
    await withPatched(PsAgent, "findByPk", async () => null, async () => {
      await assert.rejects(() => manager.controlAgent(1, "pause"), /not found/);
      assert.equal(await manager.startAgentProcessing(1), false);
      assert.equal(await manager.pauseAgentProcessing(1), false);
      assert.equal(await manager.getAgentStatus(1), null);
      assert.equal(await manager.updateAgentStatus(1, "running"), false);
      await manager.clearAgentStatusMessages(1);
    });

    await withPatched(
      PsAgent,
      "findByPk",
      async () => ({
        ...queueAgent,
        Class: { id: 1, configuration: {} },
      }),
      async () => {
        await assert.rejects(
          () => manager.controlAgent(1, "pause"),
          /Queue name not defined/
        );
      }
    );

    await withPatched(PsAgent, "findByPk", async () => queueAgent, async () => {
      assert.equal(await manager.getAgentStatus(7), null);
      assert.equal(await manager.updateAgentStatus(7, "running"), false);
    });
  });

  it("initializes Redis URLs, caches queues, and wires queue events", async () => {
    await withEnv("REDIS_AGENT_URL", "redis://h:secret@localhost:6379", async () => {
      const queueRuntime = createQueueRuntime();
      const manager = new AgentQueueManager(queueRuntime.runtime);
      const firstQueue = manager.getQueue("agent-queue");
      const secondQueue = manager.getQueue("agent-queue");

      assert.equal(firstQueue, secondQueue);
      assert.equal(
        queueRuntime.redisConnections[0].redisUrl,
        "redis://:secret@localhost:6379"
      );
      assert.deepEqual(
        Object.keys(queueRuntime.redisEvents).sort(),
        ["connect", "error", "ready", "reconnecting"]
      );
      assert.deepEqual(
        Object.keys(queueRuntime.queueEvents).sort(),
        ["error", "waiting"]
      );
      assert.deepEqual(
        Object.keys(queueRuntime.queueEventEvents).sort(),
        [
          "active",
          "completed",
          "drained",
          "error",
          "failed",
          "progress",
          "removed",
          "waiting",
        ]
      );

      queueRuntime.redisEvents.error(new Error("redis error"));
      queueRuntime.redisEvents.connect();
      queueRuntime.redisEvents.reconnecting();
      queueRuntime.redisEvents.ready();
      queueRuntime.queueEvents.error(new Error("queue error"));
      queueRuntime.queueEvents.waiting("job-1");
      queueRuntime.queueEventEvents.waiting({ jobId: "job-1" });
      queueRuntime.queueEventEvents.active({ jobId: "job-1", prev: "waiting" });
      queueRuntime.queueEventEvents.completed({
        jobId: "job-1",
        returnvalue: "ok",
      });
      queueRuntime.queueEventEvents.failed({
        jobId: "job-1",
        failedReason: "bad",
      });
      queueRuntime.queueEventEvents.progress({ jobId: "job-1", data: 50 });
      queueRuntime.queueEventEvents.removed({ jobId: "job-1" });
      queueRuntime.queueEventEvents.drained();
      queueRuntime.queueEventEvents.error(new Error("events error"));
    });

    await withEnv("REDIS_AGENT_URL", "rediss://localhost:6380", async () => {
      const queueRuntime = createQueueRuntime();
      new AgentQueueManager(queueRuntime.runtime);
      assert.deepEqual(queueRuntime.redisConnections[0].options.tls, {
        rejectUnauthorized: false,
      });
    });
  });
});

describe("AgentManager", () => {
  it("loads or creates the top-level agent for a group", async () => {
    const manager = new AgentManager();
    const fetched = { id: 99 };
    (manager as unknown as {
      createTopLevelAgent: (group: unknown) => Promise<{ id: number }>;
      fetchAgentWithSubAgents: (agentId: number) => Promise<unknown>;
    }).createTopLevelAgent = async () => ({ id: 20 });
    (manager as unknown as {
      fetchAgentWithSubAgents: (agentId: number) => Promise<unknown>;
    }).fetchAgentWithSubAgents = async (agentId) => ({ ...fetched, agentId });

    await withPatched(
      Group,
      "findByPk",
      async () => ({
        toJSON: () => ({
          configuration: { agents: { topLevelAgentId: 10 } },
        }),
      }),
      async () =>
        withPatched(PsAgent, "findByPk", async () => ({ id: 10 }), async () => {
          assert.deepEqual(await manager.getAgent("5"), { id: 99, agentId: 10 });
        })
    );

    await withPatched(
      Group,
      "findByPk",
      async () => ({
        toJSON: () => ({ configuration: {} }),
      }),
      async () =>
        withPatched(PsAgent, "findByPk", async () => null, async () => {
          assert.deepEqual(await manager.getAgent("5"), { id: 99, agentId: 20 });
        })
    );

    await assert.rejects(() => manager.getAgent(""), /Group ID is required/);
    await withPatched(Group, "findByPk", async () => null, async () => {
      await assert.rejects(() => manager.getAgent("5"), /Group not found/);
    });
  });

  it("creates agents with AI model associations transactionally", async () => {
    const manager = new AgentManager();
    const tx = createTransaction();
    const addCalls: unknown[] = [];
    const createdAgent = {
      id: 44,
      addAiModel: async (model: unknown, options: unknown) => {
        addCalls.push({ model, options });
      },
    };
    const finalAgent = { id: 44, hydrated: true };

    await withPatched(
      sequelize,
      "transaction",
      async () => tx.transaction,
      async () =>
        withPatched(PsAgentClass, "findByPk", async () => ({ id: 2 }), async () =>
          withPatched(
            PsAiModel,
            "findByPk",
            async (id: number | string) => ({ id }),
            async () =>
              withPatched(
                PsAgent,
                "create",
                async () => createdAgent,
                async () =>
                  withPatched(
                    PsAgent,
                    "findByPk",
                    async () => finalAgent,
                    async () => {
                      assert.equal(
                        await manager.createAgent(
                          "Agent",
                          2,
                          { small: 10, medium: "11" },
                          3,
                          4,
                          5
                        ),
                        finalAgent
                      );
                    }
                  )
              )
          )
        )
    );

    assert.deepEqual(tx.calls, ["commit"]);
    assert.equal(addCalls.length, 2);
  });

  it("rolls back agent creation on validation or lookup failures", async () => {
    const manager = new AgentManager();
    await assert.rejects(
      () => manager.createAgent("Agent", 0, {}, 1, 2),
      /Agent class ID/
    );

    const tx = createTransaction();
    await withPatched(
      sequelize,
      "transaction",
      async () => tx.transaction,
      async () =>
        withPatched(PsAgentClass, "findByPk", async () => null, async () => {
          await assert.rejects(
            () => manager.createAgent("Agent", 2, { small: 10 }, 3, 4),
            /Agent class not found/
          );
        })
    );
    assert.deepEqual(tx.calls, ["rollback"]);
  });

  it("rolls back agent creation when AI model resolution or final hydration fails", async () => {
    const manager = new AgentManager();

    const invalidIdTx = createTransaction();
    await withPatched(
      sequelize,
      "transaction",
      async () => invalidIdTx.transaction,
      async () =>
        withPatched(PsAgentClass, "findByPk", async () => ({ id: 2 }), async () => {
          await assert.rejects(
            () =>
              manager.createAgent(
                "Agent",
                2,
                { small: {} as unknown as number },
                3,
                4
              ),
            /Invalid AI model ID/
          );
        })
    );
    assert.deepEqual(invalidIdTx.calls, ["rollback"]);

    const missingModelTx = createTransaction();
    await withPatched(
      sequelize,
      "transaction",
      async () => missingModelTx.transaction,
      async () =>
        withPatched(PsAgentClass, "findByPk", async () => ({ id: 2 }), async () =>
          withPatched(PsAiModel, "findByPk", async () => null, async () => {
            await assert.rejects(
              () => manager.createAgent("Agent", 2, { small: 10 }, 3, 4),
              /AI model with id 10/
            );
          })
        )
    );
    assert.deepEqual(missingModelTx.calls, ["rollback"]);
  });

  it("updates agent configuration and AI model associations", async () => {
    const manager = new AgentManager();
    const savedConfigs: unknown[] = [];
    const agent = {
      configuration: { name: "Old" },
      save: async () => savedConfigs.push(agent.configuration),
      removeAiModel: async () => true,
      addAiModel: async (model: unknown, options: unknown) =>
        savedConfigs.push({ model, options }),
      AiModels: [{ id: 1 }],
    };

    await withPatched(PsAgent, "findByPk", async () => agent, async () =>
      withPatched(PsAiModel, "findByPk", async (id: number) => ({ id }), async () => {
        await manager.updateAgentConfiguration(1, {
          name: "New",
        } as Partial<YpPsAgentConfiguration>);
        await manager.removeAgentAiModel(1, 2);
        assert.deepEqual(await manager.getAgentAiModels(1), [{ id: 1 }]);
        await manager.addAgentAiModel(1, 2, "small");
      })
    );

    assert.deepEqual(savedConfigs[0], { name: "New" });

    await withPatched(PsAgent, "findByPk", async () => null, async () => {
      await assert.rejects(() => manager.updateAgentConfiguration(1, {}), /Agent not found/);
      await assert.rejects(() => manager.removeAgentAiModel(1, 2), /Agent not found/);
      await assert.rejects(() => manager.getAgentAiModels(1), /Agent not found/);
      await assert.rejects(() => manager.addAgentAiModel(1, 2, "small"), /Agent not found/);
    });

    await withPatched(PsAgent, "findByPk", async () => agent, async () =>
      withPatched(PsAiModel, "findByPk", async () => null, async () => {
        await assert.rejects(() => manager.removeAgentAiModel(1, 2), /AI model not found/);
        await assert.rejects(() => manager.addAgentAiModel(1, 2, "small"), /AI model not found/);
      })
    );

    await withPatched(
      PsAgent,
      "findByPk",
      async () => ({ ...agent, removeAiModel: async () => false }),
      async () =>
        withPatched(PsAiModel, "findByPk", async () => ({ id: 2 }), async () => {
          await assert.rejects(
            () => manager.removeAgentAiModel(1, 2),
            /AI model not found for this agent/
          );
        })
    );
  });

  it("creates and fetches top-level agents and sub-agent memory keys", async () => {
    const manager = new AgentManager();
    const tx = createTransaction();
    const groupSetCalls: Array<{ key: string; value: unknown }> = [];
    const group = {
      id: 5,
      user_id: 6,
      name: "Group",
      configuration: {},
      set: (key: string, value: unknown) => groupSetCalls.push({ key, value }),
      save: async () => undefined,
    };
    const topLevelAgent = { id: 10 };

    await withEnv("CLASS_ID_FOR_TOP_LEVEL_AGENT", "top-class", async () =>
      withPatched(
        sequelize,
        "transaction",
        async () => tx.transaction,
        async () =>
          withPatched(
            PsAgentClass,
            "findOne",
            async () => ({ id: 9 }),
            async () =>
              withPatched(
                PsAgent,
                "create",
                async () => topLevelAgent,
                async () => {
                  assert.equal(await manager.createTopLevelAgent(group as never), topLevelAgent);
                }
              )
          )
      )
    );
    assert.deepEqual(tx.calls, ["commit"]);
    assert.deepEqual(groupSetCalls, [
      { key: "configuration.agents", value: {} },
      { key: "configuration.agents.topLevelAgentId", value: 10 },
    ]);

    const tree = {
      id: 1,
      uuid: "root",
      SubAgents: [{ id: 2, uuid: "child", SubAgents: [] }],
    };
    (manager as unknown as { getAgent: (groupId: string) => Promise<unknown> })
      .getAgent = async () => tree;
    assert.equal(
      await manager.getSubAgentMemoryKey("group-1", 2),
      "ps:agent:memory:2:child"
    );
    await assert.rejects(
      () => manager.getSubAgentMemoryKey("group-1", 3),
      /Agent with id 3 not found/
    );
    (manager as unknown as { getAgent: (groupId: string) => Promise<unknown> })
      .getAgent = async () => null;
    await assert.rejects(
      () => manager.getSubAgentMemoryKey("group-1", 2),
      /Top-level agent not found/
    );

    await withPatched(
      PsAgent,
      "findByPk",
      async () => ({ toJSON: () => ({ id: 1 }) }),
      async () => assert.deepEqual(await manager.fetchAgentWithSubAgents(1), { id: 1 })
    );
    await withPatched(PsAgent, "findByPk", async () => null, async () => {
      await assert.rejects(() => manager.fetchAgentWithSubAgents(1), /Agent not found/);
    });
  });

  it("validates top-level agent configuration before creating defaults", async () => {
    const manager = new AgentManager();
    const group = {
      id: 5,
      user_id: 6,
      name: "Group",
      configuration: {},
      set: () => undefined,
      save: async () => undefined,
    };

    await withEnv("CLASS_ID_FOR_TOP_LEVEL_AGENT", undefined, async () => {
      await assert.rejects(
        () => manager.createTopLevelAgent(group as never),
        /Default agent class UUID is not configured/
      );
    });

    await withEnv("CLASS_ID_FOR_TOP_LEVEL_AGENT", "missing-class", async () =>
      withPatched(PsAgentClass, "findOne", async () => null, async () => {
        await assert.rejects(
          () => manager.createTopLevelAgent(group as never),
          /Default agent class not found/
        );
      })
    );
  });

  it("rolls back top-level agent creation failures", async () => {
    const manager = new AgentManager();
    const tx = createTransaction();
    const group = {
      id: 5,
      user_id: 6,
      name: "Group",
      configuration: {},
      set: () => undefined,
      save: async () => undefined,
    };

    await withEnv("CLASS_ID_FOR_TOP_LEVEL_AGENT", "top-class", async () =>
      withPatched(
        sequelize,
        "transaction",
        async () => tx.transaction,
        async () =>
          withPatched(
            PsAgentClass,
            "findOne",
            async () => ({ id: 9 }),
            async () =>
              withPatched(
                PsAgent,
                "create",
                async () => {
                  throw new Error("top-level create failed");
                },
                async () => {
                  await assert.rejects(
                    () => manager.createTopLevelAgent(group as never),
                    /top-level create failed/
                  );
                }
              )
          )
      )
    );

    assert.deepEqual(tx.calls, ["rollback"]);
  });
});

describe("AgentConnectorManager", () => {
  it("updates connector configuration and attaches existing connectors", async () => {
    const manager = new AgentConnectorManager();
    const savedConfigs: unknown[] = [];
    const connector = {
      id: 20,
      group_id: 5,
      configuration: { name: "Old" },
      save: async () => savedConfigs.push(connector.configuration),
    };
    const addCalls: string[] = [];
    const agent = {
      addInputConnector: async () => addCalls.push("input"),
      addOutputConnector: async () => addCalls.push("output"),
    };

    await withPatched(PsAgentConnector, "findByPk", async () => connector, async () => {
      await manager.updateConnectorConfiguration(20, { name: "New" });
    });
    assert.deepEqual(savedConfigs[0], { name: "New" });

    const tx = createTransaction();
    await withPatched(sequelize, "transaction", async () => tx.transaction, async () =>
      withPatched(PsAgent, "findByPk", async () => agent, async () =>
        withPatched(PsAgentConnector, "findByPk", async () => connector, async () => {
          await manager.addExistingConnector(5, 1, 20, "input");
          await manager.addExistingConnector(5, 1, 20, "output");
        })
      )
    );
    assert.deepEqual(addCalls, ["input", "output"]);
    assert.deepEqual(tx.calls, ["commit", "commit"]);

    await withPatched(PsAgentConnector, "findByPk", async () => null, async () => {
      await assert.rejects(
        () => manager.updateConnectorConfiguration(1, {}),
        /Connector not found/
      );
    });
  });

  it("rolls back existing connector attachment failures", async () => {
    const manager = new AgentConnectorManager();
    const tx = createTransaction();
    await withPatched(sequelize, "transaction", async () => tx.transaction, async () =>
      withPatched(PsAgent, "findByPk", async () => null, async () =>
        withPatched(PsAgentConnector, "findByPk", async () => null, async () => {
          await assert.rejects(
            () => manager.addExistingConnector(5, 1, 20, "input"),
            /Agent or connector not found/
          );
        })
      )
    );
    assert.deepEqual(tx.calls, ["rollback"]);

    const tx2 = createTransaction();
    await withPatched(sequelize, "transaction", async () => tx2.transaction, async () =>
      withPatched(PsAgent, "findByPk", async () => ({}), async () =>
        withPatched(
          PsAgentConnector,
          "findByPk",
          async () => ({ group_id: 6 }),
          async () => {
            await assert.rejects(
              () => manager.addExistingConnector(5, 1, 20, "input"),
              /Connector does not belong/
            );
          }
        )
      )
    );
    assert.deepEqual(tx2.calls, ["rollback"]);
  });

  it("creates fabric groups and updates connector group ids", async () => {
    const manager = new AgentConnectorManager();
    const changedKeys: string[] = [];
    const connector = {
      configuration: {},
      changed: (key: string, value: boolean) => changedKeys.push(`${key}:${value}`),
      save: async () => undefined,
    };
    const agent = {
      id: 10,
      group_id: 5,
      user_id: 6,
      configuration: { name: "Agent" },
    };
    const agentClass = {
      configuration: {
        defaultStructuredQuestions: [{ uniqueId: "q1" }],
      },
    };
    (manager as unknown as {
      createGroup: (
        currentGroupId: number,
        forAgentId: number,
        inputOutput: "input" | "output",
        communityId: number,
        userId: number,
        name: string,
        description: string,
        structuredQuestions: unknown[]
      ) => Promise<YpGroupData>;
    }).createGroup = async (
      currentGroupId,
      forAgentId,
      inputOutput,
      communityId,
      userId,
      name,
      description,
      structuredQuestions
    ) => {
      assert.deepEqual(
        [
          currentGroupId,
          forAgentId,
          inputOutput,
          communityId,
          userId,
          name,
          description,
          structuredQuestions.length,
        ],
        [5, 10, "input", 50, 6, "Agent", "Agent", 1]
      );
      return { id: 77 } as YpGroupData;
    };

    await withPatched(
      Group,
      "findByPk",
      async () => ({ id: 5, community_id: 50 }),
      async () => {
        assert.deepEqual(
          await manager.createYourPrioritiesGroupAndUpdateAgent(
            agent as never,
            agentClass as never,
            connector as never,
            "input"
          ),
          { id: 77 }
        );
      }
    );

    assert.deepEqual(connector.configuration, { groupId: 77 });
    assert.deepEqual(changedKeys, ["configuration:true"]);
  });

  it("creates groups through fetch with API-key headers", async () => {
    const manager = new AgentConnectorManager();
    const originalFetch = globalThis.fetch;
    const fetchCalls: Array<{ url: string; init: RequestInit }> = [];
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      fetchCalls.push({ url: String(url), init: init ?? {} });
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: 88 }),
      } as Response;
    }) as typeof fetch;

    try {
      await withEnv("PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY", "fabric-key", async () =>
        withEnv(
          "PS_TEMP_AGENTS_FABRIC_GROUP_SERVER_PATH",
          "https://fabric.example",
          async () => {
            assert.deepEqual(manager.getHeaders(), { "x-api-key": "fabric-key" });
            assert.deepEqual(
              await manager.createGroup(
                5,
                10,
                "output",
                50,
                6,
                "Group",
                "Description",
                [{ uniqueId: "q1", text: "Question", type: "textField" }]
              ),
              { id: 88 }
            );
          }
        )
      );
    } finally {
      globalThis.fetch = originalFetch;
    }

    assert.ok(fetchCalls[0].url.includes("/api/groups/50"));
    assert.equal(
      (fetchCalls[0].init.headers as Record<string, string>)["x-api-key"],
      "fabric-key"
    );
    assert.match(String(fetchCalls[0].init.body), /structuredQuestions=/);

    await withEnv("PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY", undefined, async () => {
      assert.deepEqual(manager.getHeaders(), {});
    });
  });

  it("creates connectors and optionally triggers Your Priorities group creation", async () => {
    const manager = new AgentConnectorManager();
    const tx = createTransaction();
    const addCalls: string[] = [];
    const agent = {
      id: 10,
      class_id: 2,
      group_id: 5,
      user_id: 6,
      configuration: { name: "Agent", answers: [] },
      addInputConnector: async () => addCalls.push("input"),
      addOutputConnector: async () => addCalls.push("output"),
    };
    const agentClass = {
      id: 2,
      version: 1,
      configuration: {
        defaultStructuredQuestions: [{ uniqueId: "q1" }],
      },
    };
    const connectorClass = {
      id: 3,
      class_base_id: PsYourPrioritiesConnector.YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID,
      configuration: {},
    };
    const newConnector = { id: 30 };
    const hydratedConnector = { id: 30, hydrated: true };
    let fabricCall = 0;
    (manager as unknown as {
      createYourPrioritiesGroupAndUpdateAgent: () => Promise<void>;
    }).createYourPrioritiesGroupAndUpdateAgent = async () => {
      fabricCall += 1;
    };

    await withEnv("PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY", "fabric-key", async () =>
      withEnv("PS_TEMP_AGENTS_FABRIC_GROUP_SERVER_PATH", "https://fabric.example", async () =>
        withPatched(sequelize, "transaction", async () => tx.transaction, async () =>
          withPatched(PsAgent, "findByPk", async (id: number) => (id === 10 ? agent : null), async () =>
            withPatched(PsAgentConnectorClass, "findByPk", async () => connectorClass, async () =>
              withPatched(PsAgentClass, "findByPk", async () => agentClass, async () =>
                withPatched(PsAgentConnector, "create", async () => newConnector, async () =>
                  withPatched(PsAgentConnector, "findByPk", async () => hydratedConnector, async () => {
                    assert.equal(
                      await manager.createConnector(10, 3, 6, "Connector", "input"),
                      hydratedConnector
                    );
                  })
                )
              )
            )
          )
        )
      )
    );

    assert.deepEqual(addCalls, ["input"]);
    assert.deepEqual(tx.calls, ["commit"]);
    assert.equal(fabricCall, 1);
  });

  it("creates standard output connectors and logs fabric group creation failures", async () => {
    const standardManager = new AgentConnectorManager();
    const standardTx = createTransaction();
    const standardAddCalls: string[] = [];
    const standardAgent = {
      id: 11,
      class_id: 2,
      group_id: 5,
      user_id: 6,
      configuration: { name: "Agent" },
      addInputConnector: async () => standardAddCalls.push("input"),
      addOutputConnector: async () => standardAddCalls.push("output"),
    };
    const standardAgentClass = {
      id: 2,
      version: 1,
      configuration: {},
    };
    const standardConnectorClass = {
      id: 4,
      class_base_id: "standard-connector",
      configuration: {},
    };
    const standardConnector = { id: 31 };
    const hydratedStandardConnector = { id: 31, hydrated: true };

    await withPatched(
      sequelize,
      "transaction",
      async () => standardTx.transaction,
      async () =>
        withPatched(PsAgent, "findByPk", async () => standardAgent, async () =>
          withPatched(
            PsAgentConnectorClass,
            "findByPk",
            async () => standardConnectorClass,
            async () =>
              withPatched(PsAgentClass, "findByPk", async () => standardAgentClass, async () =>
                withPatched(PsAgentConnector, "create", async () => standardConnector, async () =>
                  withPatched(
                    PsAgentConnector,
                    "findByPk",
                    async () => hydratedStandardConnector,
                    async () => {
                      assert.equal(
                        await standardManager.createConnector(
                          11,
                          4,
                          6,
                          "Connector",
                          "output"
                        ),
                        hydratedStandardConnector
                      );
                    }
                  )
                )
              )
          )
        )
    );
    assert.deepEqual(standardAddCalls, ["output"]);
    assert.deepEqual(standardTx.calls, ["commit"]);

    const fabricManager = new AgentConnectorManager();
    const fabricTx = createTransaction();
    const fabricAgent = {
      ...standardAgent,
      addInputConnector: async () => undefined,
      addOutputConnector: async () => undefined,
    };
    const fabricAgentClass = {
      id: 2,
      version: 1,
      configuration: {
        defaultStructuredQuestions: [{ uniqueId: "q1" }],
      },
    };
    const fabricConnectorClass = {
      id: 5,
      class_base_id:
        PsYourPrioritiesConnector.YOUR_PRIORITIES_CONNECTOR_CLASS_BASE_ID,
      configuration: {},
    };
    (
      fabricManager as unknown as {
        createYourPrioritiesGroupAndUpdateAgent: () => Promise<void>;
      }
    ).createYourPrioritiesGroupAndUpdateAgent = async () => {
      throw new Error("fabric failed");
    };

    await withEnv("PS_TEMP_AGENTS_FABRIC_GROUP_API_KEY", "fabric-key", async () =>
      withEnv("PS_TEMP_AGENTS_FABRIC_GROUP_SERVER_PATH", "https://fabric.example", async () =>
        withPatched(sequelize, "transaction", async () => fabricTx.transaction, async () =>
          withPatched(PsAgent, "findByPk", async () => fabricAgent, async () =>
            withPatched(
              PsAgentConnectorClass,
              "findByPk",
              async () => fabricConnectorClass,
              async () =>
                withPatched(PsAgentClass, "findByPk", async () => fabricAgentClass, async () =>
                  withPatched(PsAgentConnector, "create", async () => ({ id: 32 }), async () =>
                    withPatched(
                      PsAgentConnector,
                      "findByPk",
                      async () => ({ id: 32, hydrated: true }),
                      async () => {
                        assert.deepEqual(
                          await fabricManager.createConnector(
                            11,
                            5,
                            6,
                            "Connector",
                            "input"
                          ),
                          { id: 32, hydrated: true }
                        );
                      }
                    )
                  )
                )
            )
          )
        )
      )
    );
    assert.deepEqual(fabricTx.calls, ["commit"]);
  });

  it("handles connector creation and group creation failures", async () => {
    const manager = new AgentConnectorManager();
    const tx = createTransaction();
    await withPatched(sequelize, "transaction", async () => tx.transaction, async () =>
      withPatched(PsAgent, "findByPk", async () => null, async () =>
        withPatched(PsAgentConnectorClass, "findByPk", async () => null, async () =>
          withPatched(PsAgentClass, "findByPk", async () => null, async () => {
            await assert.rejects(
              () => manager.createConnector(1, 2, 3, "Connector", "output"),
              /Agent or connector class not found/
            );
          })
        )
      )
    );
    assert.deepEqual(tx.calls, ["rollback"]);

    await withPatched(Group, "findByPk", async () => null, async () => {
      await assert.rejects(
        () =>
          manager.createYourPrioritiesGroupAndUpdateAgent(
            { group_id: 1 } as never,
            { configuration: { defaultStructuredQuestions: [] } } as never,
            {} as never,
            "output"
          ),
        /Group not found/
      );
    });

    await withPatched(
      manager,
      "createGroup",
      async () => null,
      async () =>
        withPatched(
          Group,
          "findByPk",
          async () => ({ id: 1, community_id: 2 }),
          async () => {
            await assert.rejects(
              () =>
                manager.createYourPrioritiesGroupAndUpdateAgent(
                  {
                    id: 1,
                    group_id: 1,
                    user_id: 1,
                    configuration: { name: "Agent" },
                  } as never,
                  { configuration: { defaultStructuredQuestions: [] } } as never,
                  {} as never,
                  "output"
                ),
              /Group creation failed/
            );
          }
        )
    );

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      ({
        ok: false,
        status: 500,
        json: async () => ({}),
      }) as Response) as typeof fetch;
    try {
      await assert.rejects(
        () => manager.createGroup(1, 2, "input", 3, 4, "n", "d", []),
        /HTTP error! status: 500/
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
