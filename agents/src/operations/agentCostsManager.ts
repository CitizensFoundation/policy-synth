import { QueryTypes } from "sequelize";
import { sequelize } from "../dbModels/index.js";
import { PolicySynthAgentBase } from "../base/agentBase.js";
import {
  getCacheWriteInputCostMultiplier,
  getWebSearchCost,
  resolveLongContextPriceRates,
  resolveUsageAccountingVersion,
} from "../base/modelUsageAccounting.js";

const MODEL_USAGE_COUNTER_COLUMNS = [
  "token_in_count",
  "token_out_count",
  "token_in_cached_context_count",
  "token_in_cache_write_count",
  "long_context_token_in_count",
  "long_context_token_in_cached_context_count",
  "long_context_token_in_cache_write_count",
  "token_out_reasoning_count",
  "token_out_audio_count",
  "token_out_image_count",
  "long_context_token_out_count",
  "long_context_token_out_reasoning_count",
  "long_context_token_out_audio_count",
  "long_context_token_out_image_count",
] as const;

const PROVIDER_REPORTED_WEB_SEARCH_COUNT_SQL = `
  CASE
    WHEN jsonb_typeof(
      mui.data->'providerMetadata'->'builtInTools'->'webSearchCallCount'
    ) = 'number'
    THEN mui.data->'providerMetadata'->'builtInTools'->'webSearchCallCount'
    WHEN jsonb_typeof(
      mui.data->'providerData'->'providerMetadata'->'builtInTools'->'webSearchCallCount'
    ) = 'number'
    THEN mui.data->'providerData'->'providerMetadata'->'builtInTools'->'webSearchCallCount'
    ELSE NULL
  END
`;

const NORMALIZED_WEB_SEARCH_CALLS_SQL = `
  CASE
    WHEN jsonb_typeof(
      COALESCE(
        mui.data->'providerMetadata'->'builtInTools'->'webSearchCalls',
        mui.data->'providerData'->'providerMetadata'->'builtInTools'->'webSearchCalls'
      )
    ) = 'array'
    THEN COALESCE(
      mui.data->'providerMetadata'->'builtInTools'->'webSearchCalls',
      mui.data->'providerData'->'providerMetadata'->'builtInTools'->'webSearchCalls'
    )
    ELSE '[]'::jsonb
  END
`;

// Compact usage rows are intended to be unique per agent/model, but the
// database does not enforce that. Aggregate first so concurrent duplicate
// inserts cannot multiply the independently persisted web-search charges.
const buildCostAggregationCtes = (
  modelUsageAgentFilter: string,
  usageItemAgentFilter: string
) => `
  WITH aggregated_usage AS (
    SELECT
      MIN(mu.created_at) AS created_at,
      mu.agent_id,
      mu.model_id,
      ${MODEL_USAGE_COUNTER_COLUMNS.map(
        (column) => `SUM(COALESCE(mu.${column}, 0)) AS ${column}`
      ).join(",\n      ")}
    FROM ps_model_usage mu
    WHERE ${modelUsageAgentFilter}
    GROUP BY mu.agent_id, mu.model_id
  ),
  web_search_item_counts AS (
    SELECT
      mui.agent_id,
      mui.model_id,
      CASE
        WHEN (${PROVIDER_REPORTED_WEB_SEARCH_COUNT_SQL}) IS NOT NULL
        THEN GREATEST(
          FLOOR(
            ((${PROVIDER_REPORTED_WEB_SEARCH_COUNT_SQL})::text)::numeric
          ),
          0
        )
        ELSE (
          SELECT COUNT(*)
          FROM jsonb_array_elements(
            ${NORMALIZED_WEB_SEARCH_CALLS_SQL}
          ) AS web_search_call(call_data)
          WHERE jsonb_typeof(web_search_call.call_data) = 'object'
            AND web_search_call.call_data->>'status' IS DISTINCT FROM 'not_used'
        )
      END AS web_search_call_count
    FROM ps_model_usage_item mui
    WHERE ${usageItemAgentFilter}
  ),
  web_search_counts AS (
    SELECT
      agent_id,
      model_id,
      SUM(web_search_call_count) AS web_search_call_count
    FROM web_search_item_counts
    GROUP BY agent_id, model_id
  )
`;

interface PsCostBreakdown {
  costInNormal: number;
  costInCached: number;
  costInCacheWrite: number;
  costInLong: number;
  costOutNormal: number;
  costInCachedLong: number; // Combined for simplicity as per PsBaseModelPriceConfiguration
  costInCacheWriteLong: number;
  costOutLong: number;
  webSearchCallCount: number;
  costWebSearch: number;
  totalCost: number;
}

export class AgentCostManager extends PolicySynthAgentBase {
  private async getSubAgentIds(rootId: number): Promise<number[]> {
    const allAgentIds: number[] = [];
    const queue: number[] = [rootId];
    const visited: Set<number> = new Set();

    while (queue.length > 0) {
      const currentAgentId = queue.shift()!;
      if (visited.has(currentAgentId)) {
        continue;
      }
      visited.add(currentAgentId);
      allAgentIds.push(currentAgentId);

      const children = await sequelize.query<{ id: number }>(
        `SELECT id FROM ps_agents WHERE parent_agent_id = :currentAgentId`,
        {
          replacements: { currentAgentId },
          type: QueryTypes.SELECT,
        }
      );
      children.forEach((child) => queue.push(child.id));
    }
    return allAgentIds;
  }

  private calcCosts(
    mu: PsModelUsageAttributes,
    prices: PsBaseModelPriceConfiguration,
    webSearchCallCount = 0
  ): PsCostBreakdown {
    const costInNormal =
      ((mu.token_in_count || 0) * (prices.costInTokensPerMillion || 0)) /
      1000000.0;

    const costInCached =
      ((mu.token_in_cached_context_count || 0) *
        (prices.costInCachedContextTokensPerMillion || 0)) /
      1000000.0;

    const cacheWriteMultiplier = getCacheWriteInputCostMultiplier(prices);
    const costInCacheWrite =
      ((mu.token_in_cache_write_count || 0) *
        (prices.costInTokensPerMillion || 0) *
        cacheWriteMultiplier) /
      1000000.0;

    const longContextRates = resolveLongContextPriceRates(prices);

    const costInLong =
      ((mu.long_context_token_in_count || 0) *
        longContextRates.inputTokensPerMillion) /
      1000000.0;

    // Sum all token_out_ variants for normal context
    const totalTokenOutNormal =
      (mu.token_out_count || 0) +
      (mu.token_out_reasoning_count || 0) +
      (mu.token_out_audio_count || 0) +
      (mu.token_out_image_count || 0);

    const costOutNormal =
      (totalTokenOutNormal * (prices.costOutTokensPerMillion || 0)) / 1000000.0;

    // Sum all long_context_token_out_ variants for long context
    const totalTokenOutLong =
      (mu.long_context_token_out_count || 0) +
      (mu.long_context_token_out_reasoning_count || 0) +
      (mu.long_context_token_out_audio_count || 0) +
      (mu.long_context_token_out_image_count || 0);

    const costOutLong =
      (totalTokenOutLong *
        longContextRates.outputTokensPerMillion) /
      1000000.0;

    // Cached Long Context Out Tokens
    // Assuming longContextCostInCachedContextTokensPerMillion implies a similar out cost or fallback
    const costInCachedLong =
      ((mu.long_context_token_in_cached_context_count || 0) * // Note: Using IN cached count for OUT cost calculation as per schema fields
        longContextRates.cachedInputTokensPerMillion) /
      1000000.0;

    const costInCacheWriteLong =
      ((mu.long_context_token_in_cache_write_count || 0) *
        longContextRates.inputTokensPerMillion *
        cacheWriteMultiplier) /
      1000000.0;

    const costWebSearch = getWebSearchCost(webSearchCallCount, prices);

    const totalCost =
      costInNormal +
      costInCached +
      costInCacheWrite +
      costInLong +
      costOutNormal +
      costOutLong +
      costInCachedLong +
      costInCacheWriteLong +
      costWebSearch;

    return {
      costInNormal,
      costInCached,
      costInCacheWrite,
      costInLong,
      costOutNormal,
      costInCachedLong,
      costInCacheWriteLong,
      costOutLong,
      webSearchCallCount,
      costWebSearch,
      totalCost,
    };
  }

  public async getDetailedAgentCosts(
    agentId: number
  ): Promise<PsDetailedAgentCostResults[]> {
    try {
      const agentIds = await this.getSubAgentIds(agentId);
      if (agentIds.length === 0) {
        return [];
      }

      const usageRows = await sequelize.query(
        `
        ${buildCostAggregationCtes(
          "mu.agent_id IN (:agentIds)",
          "mui.agent_id IN (:agentIds)"
        )}
        SELECT
          mu.created_at,
          a.id as agent_id,
          a.configuration->>'name' as agent_name,
          am.name as ai_model_name,
          am.configuration->>'accountingVersion' AS accounting_version,
          am.configuration->'prices' AS price_cfg,
          mu.token_in_count,
          mu.token_out_count,
          mu.token_in_cached_context_count,
          mu.token_in_cache_write_count,
          mu.long_context_token_in_count,
          mu.long_context_token_in_cached_context_count,
          mu.long_context_token_in_cache_write_count,
          mu.token_out_reasoning_count,
          mu.token_out_audio_count,
          mu.token_out_image_count,
          mu.long_context_token_out_count,
          mu.long_context_token_out_reasoning_count,
          mu.long_context_token_out_audio_count,
          mu.long_context_token_out_image_count,
          COALESCE(wsc.web_search_call_count, 0) AS web_search_call_count
        FROM aggregated_usage mu
        JOIN ps_ai_models am ON mu.model_id = am.id
        JOIN ps_agents a ON mu.agent_id = a.id
        LEFT JOIN web_search_counts wsc
          ON wsc.agent_id = mu.agent_id AND wsc.model_id = mu.model_id
        ORDER BY mu.created_at DESC
      `,
        {
          replacements: { agentIds },
          type: QueryTypes.SELECT,
        }
      );

      return usageRows.map((row: any) => {
        const modelUsage: PsModelUsageAttributes = {
          // Assuming all fields from PsModelUsageAttributes are present in row
          id: 0, // Not strictly needed for cost calculation, placeholder
          user_id: 0, // Not strictly needed for cost calculation, placeholder
          created_at: row.created_at,
          updated_at: new Date(), // Placeholder
          model_id: 0, // Not strictly needed for cost calculation, placeholder
          token_in_count: parseInt(row.token_in_count || "0"),
          token_in_cached_context_count: parseInt(
            row.token_in_cached_context_count || "0"
          ),
          token_in_cache_write_count: parseInt(
            row.token_in_cache_write_count || "0"
          ),
          long_context_token_in_count: parseInt(
            row.long_context_token_in_count || "0"
          ),
          long_context_token_out_count: parseInt(
            row.long_context_token_out_count || "0"
          ),
          long_context_token_in_cached_context_count: parseInt(
            row.long_context_token_in_cached_context_count || "0"
          ),
          long_context_token_in_cache_write_count: parseInt(
            row.long_context_token_in_cache_write_count || "0"
          ),
          token_out_count: parseInt(row.token_out_count || "0"),
          token_out_reasoning_count: parseInt(
            row.token_out_reasoning_count || "0"
          ),
          token_out_audio_count: parseInt(row.token_out_audio_count || "0"),
          token_out_image_count: parseInt(row.token_out_image_count || "0"),
          long_context_token_out_reasoning_count: parseInt(
            row.long_context_token_out_reasoning_count || "0"
          ),
          long_context_token_out_audio_count: parseInt(
            row.long_context_token_out_audio_count || "0"
          ),
          long_context_token_out_image_count: parseInt(
            row.long_context_token_out_image_count || "0"
          ),
          agent_id: row.agent_id,
        };

        const prices: PsBaseModelPriceConfiguration = row.price_cfg;
        const costs = this.calcCosts(
          modelUsage,
          prices,
          parseInt(row.web_search_call_count || "0")
        );

        return {
          createdAt: row.created_at,
          agentId: row.agent_id,
          agentName: row.agent_name,
          aiModelName: row.ai_model_name,
          accountingVersion: resolveUsageAccountingVersion(
            row.accounting_version
          ),
          tokenInCount:
            (modelUsage.token_in_count || 0) +
            (modelUsage.long_context_token_in_count || 0) +
            (modelUsage.token_in_cached_context_count || 0) +
            (modelUsage.long_context_token_in_cached_context_count || 0) +
            (modelUsage.token_in_cache_write_count || 0) +
            (modelUsage.long_context_token_in_cache_write_count || 0),
          tokenInCachedContextCount:
            modelUsage.token_in_cached_context_count || 0,
          tokenInCacheWriteCount:
            modelUsage.token_in_cache_write_count || 0,
          longContextTokenInCount: modelUsage.long_context_token_in_count || 0,
          longContextTokenOutCount:
            modelUsage.long_context_token_out_count || 0,
          longContextTokenInCachedContextCount:
            modelUsage.long_context_token_in_cached_context_count || 0,
          longContextTokenInCacheWriteCount:
            modelUsage.long_context_token_in_cache_write_count || 0,
          tokenOutCount:
            (modelUsage.token_out_count || 0) +
            (modelUsage.token_out_reasoning_count || 0) +
            (modelUsage.token_out_audio_count || 0) +
            (modelUsage.token_out_image_count || 0) +
            (modelUsage.long_context_token_out_count || 0) +
            (modelUsage.long_context_token_out_reasoning_count || 0) +
            (modelUsage.long_context_token_out_audio_count || 0) +
            (modelUsage.long_context_token_out_image_count || 0),
          costIn:
            costs.costInNormal +
            costs.costInCached +
            costs.costInCacheWrite +
            costs.costInLong +
            costs.costInCachedLong +
            costs.costInCacheWriteLong,
          costInNormal: costs.costInNormal,
          costInCached: costs.costInCached,
          costInCacheWrite: costs.costInCacheWrite,
          costInLong: costs.costInLong,
          costInCachedLong: costs.costInCachedLong,
          costInCacheWriteLong: costs.costInCacheWriteLong,
          costOutNormal: costs.costOutNormal,
          costOutLong: costs.costOutLong,
          costOut: costs.costOutNormal + costs.costOutLong,
          webSearchCallCount: costs.webSearchCallCount,
          costWebSearch: costs.costWebSearch,
          totalCost: costs.totalCost,
          // Optionally, include detailed breakdown:
          // costBreakdown: costs
        };
      });
    } catch (error) {
      this.logger.error("Error calculating detailed agent costs:", error);
      throw new Error("Error calculating detailed agent costs: " + error);
    }
  }

  public async getAgentCosts(agentId: number): Promise<PsAgentCostResults> {
    try {
      const agentIds = await this.getSubAgentIds(agentId);
      if (agentIds.length === 0) {
        return { agentCosts: [], totalCost: "0.00" };
      }

      const usageRows = await sequelize.query(
        `
        ${buildCostAggregationCtes(
          "mu.agent_id IN (:agentIds)",
          "mui.agent_id IN (:agentIds)"
        )}
        SELECT
          mu.agent_id,
          a.configuration->>'name' as agent_name,
          am.configuration->'prices' AS price_cfg,
          mu.token_in_count,
          mu.token_out_count,
          mu.token_in_cached_context_count,
          mu.token_in_cache_write_count,
          mu.long_context_token_in_count,
          mu.long_context_token_in_cached_context_count,
          mu.long_context_token_in_cache_write_count,
          mu.token_out_reasoning_count,
          mu.token_out_audio_count,
          mu.token_out_image_count,
          mu.long_context_token_out_count,
          mu.long_context_token_out_reasoning_count,
          mu.long_context_token_out_audio_count,
          mu.long_context_token_out_image_count,
          COALESCE(wsc.web_search_call_count, 0) AS web_search_call_count
        FROM aggregated_usage mu
        JOIN ps_ai_models am ON mu.model_id = am.id
        JOIN ps_agents a ON mu.agent_id = a.id
        LEFT JOIN web_search_counts wsc
          ON wsc.agent_id = mu.agent_id AND wsc.model_id = mu.model_id
      `,
        {
          replacements: { agentIds },
          type: QueryTypes.SELECT,
        }
      );

      // Fetch agent levels separately to avoid complex recursive SQL for levels here
      const agentHierarchy = await sequelize.query(
        `
        WITH RECURSIVE agent_levels AS (
          SELECT id, parent_agent_id, 0 as level
          FROM ps_agents
          WHERE id = :rootAgentId
          UNION ALL
          SELECT a.id, a.parent_agent_id, al.level + 1
          FROM ps_agents a
          JOIN agent_levels al ON a.parent_agent_id = al.id
          WHERE a.id IN (:agentIds)
        )
        SELECT id, level FROM agent_levels WHERE id IN (:agentIds);
        `,
        {
          replacements: { rootAgentId: agentId, agentIds },
          type: QueryTypes.SELECT,
        }
      );

      const agentLevelsMap = new Map<number, number>();
      agentHierarchy.forEach((row: any) => {
        agentLevelsMap.set(row.id, row.level);
      });

      const agentCostMap = new Map<number, number>();

      usageRows.forEach((row: any) => {
        const modelUsage: PsModelUsageAttributes = {
          id: 0,
          user_id: 0,
          created_at: new Date(),
          updated_at: new Date(),
          model_id: 0, // Placeholders
          token_in_count: parseInt(row.token_in_count || "0"),
          token_in_cached_context_count: parseInt(
            row.token_in_cached_context_count || "0"
          ),
          token_in_cache_write_count: parseInt(
            row.token_in_cache_write_count || "0"
          ),
          long_context_token_in_count: parseInt(
            row.long_context_token_in_count || "0"
          ),
          long_context_token_in_cached_context_count: parseInt(
            row.long_context_token_in_cached_context_count || "0"
          ),
          long_context_token_in_cache_write_count: parseInt(
            row.long_context_token_in_cache_write_count || "0"
          ),
          token_out_count: parseInt(row.token_out_count || "0"),
          token_out_reasoning_count: parseInt(
            row.token_out_reasoning_count || "0"
          ),
          token_out_audio_count: parseInt(row.token_out_audio_count || "0"),
          token_out_image_count: parseInt(row.token_out_image_count || "0"),
          long_context_token_out_count: parseInt(
            row.long_context_token_out_count || "0"
          ),
          long_context_token_out_reasoning_count: parseInt(
            row.long_context_token_out_reasoning_count || "0"
          ),
          long_context_token_out_audio_count: parseInt(
            row.long_context_token_out_audio_count || "0"
          ),
          long_context_token_out_image_count: parseInt(
            row.long_context_token_out_image_count || "0"
          ),
          agent_id: row.agent_id,
        };
        const prices: PsBaseModelPriceConfiguration = row.price_cfg;
        const costs = this.calcCosts(
          modelUsage,
          prices,
          parseInt(row.web_search_call_count || "0")
        );
        agentCostMap.set(
          row.agent_id,
          (agentCostMap.get(row.agent_id) || 0) + costs.totalCost
        );
      });

      const агентCosts = Array.from(agentCostMap.entries())
        .map(([agentId, cost]) => ({
          agentId,
          level:
            agentLevelsMap.get(agentId) !== undefined
              ? agentLevelsMap.get(agentId)
              : -1, // Fallback level
          cost: parseFloat(cost.toFixed(2)),
        }))
        .sort(
          (a, b) => (a.level ?? 0) - (b.level ?? 0) || a.agentId - b.agentId
        );

      const totalCost = агентCosts
        .reduce((sum, agent) => sum + agent.cost, 0)
        .toFixed(2);

      return { agentCosts: агентCosts, totalCost } as PsAgentCostResults;
    } catch (error) {
      this.logger.error("Error calculating agent costs:", error);
      throw Error("Error calculating agent costs: " + error);
    }
  }

  public async getSingleAgentCosts(agentId: number): Promise<string> {
    try {
      const usageRows = await sequelize.query(
        `
        ${buildCostAggregationCtes(
          "mu.agent_id = :agentId",
          "mui.agent_id = :agentId"
        )}
        SELECT
          am.configuration->'prices' AS price_cfg,
          mu.token_in_count,
          mu.token_out_count,
          mu.token_in_cached_context_count,
          mu.token_in_cache_write_count,
          mu.long_context_token_in_count,
          mu.long_context_token_in_cached_context_count,
          mu.long_context_token_in_cache_write_count,
          mu.token_out_reasoning_count,
          mu.token_out_audio_count,
          mu.token_out_image_count,
          mu.long_context_token_out_count,
          mu.long_context_token_out_reasoning_count,
          mu.long_context_token_out_audio_count,
          mu.long_context_token_out_image_count,
          COALESCE(wsc.web_search_call_count, 0) AS web_search_call_count
        FROM aggregated_usage mu
        JOIN ps_ai_models am ON mu.model_id = am.id
        LEFT JOIN web_search_counts wsc
          ON wsc.agent_id = mu.agent_id AND wsc.model_id = mu.model_id
      `,
        {
          replacements: { agentId },
          type: QueryTypes.SELECT,
        }
      );

      if (usageRows.length === 0) {
        return "0.00";
      }

      let totalAgentCost = 0;

      usageRows.forEach((row: any) => {
        const modelUsage: PsModelUsageAttributes = {
          id: 0,
          user_id: 0,
          created_at: new Date(),
          updated_at: new Date(),
          model_id: 0, // Placeholders
          token_in_count: parseInt(row.token_in_count || "0"),
          token_in_cached_context_count: parseInt(
            row.token_in_cached_context_count || "0"
          ),
          token_in_cache_write_count: parseInt(
            row.token_in_cache_write_count || "0"
          ),
          long_context_token_in_count: parseInt(
            row.long_context_token_in_count || "0"
          ),
          long_context_token_in_cached_context_count: parseInt(
            row.long_context_token_in_cached_context_count || "0"
          ),
          long_context_token_in_cache_write_count: parseInt(
            row.long_context_token_in_cache_write_count || "0"
          ),
          token_out_count: parseInt(row.token_out_count || "0"),
          token_out_reasoning_count: parseInt(
            row.token_out_reasoning_count || "0"
          ),
          token_out_audio_count: parseInt(row.token_out_audio_count || "0"),
          token_out_image_count: parseInt(row.token_out_image_count || "0"),
          long_context_token_out_count: parseInt(
            row.long_context_token_out_count || "0"
          ),
          long_context_token_out_reasoning_count: parseInt(
            row.long_context_token_out_reasoning_count || "0"
          ),
          long_context_token_out_audio_count: parseInt(
            row.long_context_token_out_audio_count || "0"
          ),
          long_context_token_out_image_count: parseInt(
            row.long_context_token_out_image_count || "0"
          ),
          agent_id: agentId,
        };
        const prices: PsBaseModelPriceConfiguration = row.price_cfg;
        const costs = this.calcCosts(
          modelUsage,
          prices,
          parseInt(row.web_search_call_count || "0")
        );
        totalAgentCost += costs.totalCost;
      });

      return totalAgentCost.toFixed(2);
    } catch (error) {
      this.logger.error("Error calculating single agent costs:", error);
      throw new Error("Error calculating single agent costs: " + error);
    }
  }
}
