import { QueryTypes } from "sequelize";
import { sequelize } from "../dbModels/index.js";

interface PsCostBreakdown {
  costInNormal: number;
  costInCached: number;
  costInLong: number;
  costOutNormal: number;
  costInCachedLong: number; // Combined for simplicity as per PsBaseModelPriceConfiguration
  costOutLong: number;
  totalCost: number;
}

export class AgentCostManager {
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
    prices: PsBaseModelPriceConfiguration
  ): PsCostBreakdown {
    const costInNormal =
      ((mu.token_in_count || 0) * (prices.costInTokensPerMillion || 0)) /
      1000000.0;

    const costInCached =
      ((mu.token_in_cached_context_count || 0) *
        (prices.costInCachedContextTokensPerMillion || 0)) /
      1000000.0;

    const costInLong =
      ((mu.long_context_token_in_count || 0) *
        (prices.longContextCostInTokensPerMillion || 0)) /
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
        (prices.longContextCostOutTokensPerMillion ||
          prices.costOutTokensPerMillion ||
          0)) /
      1000000.0;

    // Cached Long Context Out Tokens
    // Assuming longContextCostInCachedContextTokensPerMillion implies a similar out cost or fallback
    const costInCachedLong =
      ((mu.long_context_token_in_cached_context_count || 0) * // Note: Using IN cached count for OUT cost calculation as per schema fields
        (prices.longContextCostInCachedContextTokensPerMillion ||
          prices.costInCachedContextTokensPerMillion ||
          0)) /
      1000000.0;

    const totalCost =
      costInNormal +
      costInCached +
      costInLong +
      costOutNormal +
      costOutLong +
      costInCachedLong;

    return {
      costInNormal,
      costInCached,
      costInLong,
      costOutNormal,
      costInCachedLong,
      costOutLong,
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
        SELECT
          mu.created_at,
          a.id as agent_id,
          a.configuration->>'name' as agent_name,
          am.name as ai_model_name,
          am.configuration->'prices' AS price_cfg,
          mu.token_in_count,
          mu.token_out_count,
          mu.token_in_cached_context_count,
          mu.long_context_token_in_count,
          mu.long_context_token_in_cached_context_count,
          mu.token_out_reasoning_count,
          mu.token_out_audio_count,
          mu.token_out_image_count,
          mu.long_context_token_out_count,
          mu.long_context_token_out_reasoning_count,
          mu.long_context_token_out_audio_count,
          mu.long_context_token_out_image_count
        FROM ps_model_usage mu
        JOIN ps_ai_models am ON mu.model_id = am.id
        JOIN ps_agents a ON mu.agent_id = a.id
        WHERE mu.agent_id IN (:agentIds)
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
          long_context_token_in_count: parseInt(
            row.long_context_token_in_count || "0"
          ),
          long_context_token_in_cached_context_count: parseInt(
            row.long_context_token_in_cached_context_count || "0"
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
        const costs = this.calcCosts(modelUsage, prices);

        return {
          createdAt: row.created_at,
          agentId: row.agent_id,
          agentName: row.agent_name,
          aiModelName: row.ai_model_name,
          tokenInCount:
            (modelUsage.token_in_count || 0) +
            (modelUsage.long_context_token_in_count || 0) +
            (modelUsage.token_in_cached_context_count || 0) +
            (modelUsage.long_context_token_in_cached_context_count || 0),
          tokenInCachedContextCount:
            modelUsage.token_in_cached_context_count || 0,
          longContextTokenInCount: modelUsage.long_context_token_in_count || 0,
          longContextTokenInCachedContextCount:
            modelUsage.long_context_token_in_cached_context_count || 0,
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
            costs.costInLong +
            costs.costInCachedLong,
          costInNormal: costs.costInNormal,
          costInCached: costs.costInCached,
          costInLong: costs.costInLong,
          costInCachedLong: costs.costInCachedLong,
          costOutNormal: costs.costOutNormal,
          costOutLong: costs.costOutLong,
          costOut: costs.costOutNormal + costs.costOutLong,
          totalCost: costs.totalCost,
          // Optionally, include detailed breakdown:
          // costBreakdown: costs
        };
      });
    } catch (error) {
      console.error("Error calculating detailed agent costs:", error);
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
        SELECT
          mu.agent_id,
          a.configuration->>'name' as agent_name,
          am.configuration->'prices' AS price_cfg,
          mu.token_in_count,
          mu.token_out_count,
          mu.token_in_cached_context_count,
          mu.long_context_token_in_count,
          mu.long_context_token_in_cached_context_count,
          mu.token_out_reasoning_count,
          mu.token_out_audio_count,
          mu.token_out_image_count,
          mu.long_context_token_out_count,
          mu.long_context_token_out_reasoning_count,
          mu.long_context_token_out_audio_count,
          mu.long_context_token_out_image_count
        FROM ps_model_usage mu
        JOIN ps_ai_models am ON mu.model_id = am.id
        JOIN ps_agents a ON mu.agent_id = a.id
        WHERE mu.agent_id IN (:agentIds)
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
          long_context_token_in_count: parseInt(
            row.long_context_token_in_count || "0"
          ),
          long_context_token_in_cached_context_count: parseInt(
            row.long_context_token_in_cached_context_count || "0"
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
        const costs = this.calcCosts(modelUsage, prices);
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
      console.error("Error calculating agent costs:", error);
      throw Error("Error calculating agent costs: " + error);
    }
  }

  public async getSingleAgentCosts(agentId: number): Promise<string> {
    try {
      const usageRows = await sequelize.query(
        `
        SELECT
          am.configuration->'prices' AS price_cfg,
          mu.token_in_count,
          mu.token_out_count,
          mu.token_in_cached_context_count,
          mu.long_context_token_in_count,
          mu.long_context_token_in_cached_context_count,
          mu.token_out_reasoning_count,
          mu.token_out_audio_count,
          mu.token_out_image_count,
          mu.long_context_token_out_count,
          mu.long_context_token_out_reasoning_count,
          mu.long_context_token_out_audio_count,
          mu.long_context_token_out_image_count
        FROM ps_model_usage mu
        JOIN ps_ai_models am ON mu.model_id = am.id
        WHERE mu.agent_id = :agentId
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
          long_context_token_in_count: parseInt(
            row.long_context_token_in_count || "0"
          ),
          long_context_token_in_cached_context_count: parseInt(
            row.long_context_token_in_cached_context_count || "0"
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
        const costs = this.calcCosts(modelUsage, prices);
        totalAgentCost += costs.totalCost;
      });

      return totalAgentCost.toFixed(2);
    } catch (error) {
      console.error("Error calculating single agent costs:", error);
      throw new Error("Error calculating single agent costs: " + error);
    }
  }
}
