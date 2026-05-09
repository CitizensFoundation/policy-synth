import { QueryTypes } from "sequelize";

import { ensureApplicationLevelSync, sequelize } from "../dbModels/index.js";
import { PolicySynthAgentBase } from "../base/agentBase.js";
import { resolvePriceConfigurationForContext } from "../base/modelPriceUtils.js";

interface PsUsageItemCostBreakdown {
  costInNormal: number;
  costInCached: number;
  costInLong: number;
  costOutNormal: number;
  costInCachedLong: number;
  costOutLong: number;
  totalCost: number;
}

interface PsUsageItemRow {
  created_at: Date;
  agent_id: number;
  agent_name?: string | null;
  ai_model_name?: string | null;
  data: PsModelUsageItemData | string;
  price_cfg?: PsBaseModelPriceConfiguration | null;
}

interface PsAppliedInferenceTypeResolution {
  inferenceType?: PsInferenceType;
  hasAppliedMetadata: boolean;
}

const zeroCosts = (): PsUsageItemCostBreakdown => ({
  costInNormal: 0,
  costInCached: 0,
  costInLong: 0,
  costOutNormal: 0,
  costInCachedLong: 0,
  costOutLong: 0,
  totalCost: 0,
});

export class AgentCostItemManager extends PolicySynthAgentBase {
  private normalizeItemData(raw: PsModelUsageItemData | string) {
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw) as PsModelUsageItemData;
      } catch (error) {
        this.logger.error("Failed to parse ps_model_usage_item.data JSON", error);
        return undefined;
      }
    }

    return raw;
  }

  private getRequestedInferenceType(data: PsModelUsageItemData) {
    const legacyInferenceMode = (
      data.pricing as { inferenceMode?: string } | undefined
    )?.inferenceMode;

    return (
      data.pricing?.inferenceType ??
      (legacyInferenceMode === "flex" || legacyInferenceMode === "priority"
        ? legacyInferenceMode
        : undefined)
    );
  }

  private getAppliedInferenceType(
    data: PsModelUsageItemData
  ): PsAppliedInferenceTypeResolution {
    const provider = data.provider?.toLowerCase();
    const providerMetadata = data.providerMetadata;
    const appliedServiceTier =
      typeof providerMetadata?.appliedServiceTier === "string"
        ? providerMetadata.appliedServiceTier.toLowerCase()
        : undefined;
    const appliedSpeed =
      typeof providerMetadata?.appliedSpeed === "string"
        ? providerMetadata.appliedSpeed.toLowerCase()
        : undefined;

    if (
      provider === "openai" ||
      provider === "openairesponses" ||
      provider === "azure"
    ) {
      if (appliedServiceTier === "flex" || appliedServiceTier === "priority") {
        return {
          inferenceType: appliedServiceTier,
          hasAppliedMetadata: true,
        };
      }

      if (appliedServiceTier) {
        return {
          inferenceType: undefined,
          hasAppliedMetadata: true,
        };
      }
    }

    if (provider === "anthropic") {
      if (appliedSpeed === "fast") {
        return {
          inferenceType: "fast",
          hasAppliedMetadata: true,
        };
      }

      if (appliedSpeed) {
        return {
          inferenceType: undefined,
          hasAppliedMetadata: true,
        };
      }

      if (appliedServiceTier === "priority") {
        return {
          inferenceType: "fast",
          hasAppliedMetadata: true,
        };
      }

      if (appliedServiceTier) {
        return {
          inferenceType: undefined,
          hasAppliedMetadata: true,
        };
      }
    }

    return {
      inferenceType: undefined,
      hasAppliedMetadata: false,
    };
  }

  private resolveEffectivePrices(
    data: PsModelUsageItemData,
    fallbackPrices?: PsBaseModelPriceConfiguration | null
  ) {
    const normalizedProvider = data.provider?.toLowerCase();
    const configuredPrices =
      data.pricing?.configuredPrices ?? fallbackPrices ?? undefined;
    const appliedInference = this.getAppliedInferenceType(data);
    const inferenceType =
      appliedInference.hasAppliedMetadata
        ? appliedInference.inferenceType
        : normalizedProvider === "azure"
          ? undefined
          : this.getRequestedInferenceType(data);
    const canReuseEffectivePrices =
      data.pricing?.effectivePrices &&
      !appliedInference.hasAppliedMetadata &&
      normalizedProvider !== "azure";

    return (
      (canReuseEffectivePrices ? data.pricing?.effectivePrices : undefined) ??
      resolvePriceConfigurationForContext(configuredPrices, {
        provider: data.provider,
        regionalProcessing:
          (normalizedProvider === "openai" ||
            normalizedProvider === "openairesponses") &&
          data.pricing?.regionalProcessing === "eu"
            ? data.pricing.regionalProcessing
            : undefined,
        inferenceType:
          inferenceType === "flex" ||
          inferenceType === "priority" ||
          inferenceType === "fast"
            ? inferenceType
            : undefined,
      }) ??
      configuredPrices
    );
  }

  private getUsageNormalized(
    data: PsModelUsageItemData
  ): PsModelUsageNormalizedCounts | undefined {
    return data.usageNormalized ?? data.providerData?.usageNormalized;
  }

  private buildUsageCountsFromNormalized(
    data: PsModelUsageItemData,
    prices?: PsBaseModelPriceConfiguration | null
  ): PsModelUsageTokenCounts | undefined {
    const usageNormalized = this.getUsageNormalized(data);

    if (!usageNormalized) {
      return undefined;
    }

    const totalInputTokens = usageNormalized.tokensIn || 0;
    const cachedInputTokens = usageNormalized.cachedInTokens || 0;
    const totalOutputTokens = usageNormalized.tokensOut || 0;
    const reasoningTokens = usageNormalized.reasoningTokens || 0;
    const audioTokens = usageNormalized.audioTokens || 0;
    const imageTokens = usageNormalized.imageTokens || 0;
    const longContextTokenThreshold = prices?.longContextTokenThreshold;

    let tokenInCount = totalInputTokens;
    let tokenInCachedContextCount = cachedInputTokens;
    let longContextTokenInCount = 0;
    let longContextTokenInCachedContextCount = 0;

    const baseTokenOutCount = Math.max(
      totalOutputTokens - reasoningTokens - audioTokens - imageTokens,
      0
    );
    let tokenOutCount = baseTokenOutCount;
    let tokenOutReasoningCount = reasoningTokens;
    let tokenOutAudioCount = audioTokens;
    let tokenOutImageCount = imageTokens;
    let longContextTokenOutCount = 0;
    let longContextTokenOutReasoningCount = 0;
    let longContextTokenOutAudioCount = 0;
    let longContextTokenOutImageCount = 0;

    if (
      longContextTokenThreshold &&
      totalInputTokens >= longContextTokenThreshold
    ) {
      longContextTokenInCount = cachedInputTokens
        ? totalInputTokens - cachedInputTokens
        : totalInputTokens;
      longContextTokenInCachedContextCount = cachedInputTokens;

      longContextTokenOutCount = tokenOutCount;
      longContextTokenOutReasoningCount = tokenOutReasoningCount;
      longContextTokenOutAudioCount = tokenOutAudioCount;
      longContextTokenOutImageCount = tokenOutImageCount;

      tokenInCount = 0;
      tokenInCachedContextCount = 0;
      tokenOutCount = 0;
      tokenOutReasoningCount = 0;
      tokenOutAudioCount = 0;
      tokenOutImageCount = 0;
    } else if (cachedInputTokens) {
      tokenInCount = totalInputTokens - cachedInputTokens;
    }

    return {
      token_in_count: tokenInCount,
      token_out_count: tokenOutCount,
      token_in_cached_context_count: tokenInCachedContextCount || undefined,
      token_out_reasoning_count: tokenOutReasoningCount || undefined,
      token_out_audio_count: tokenOutAudioCount || undefined,
      token_out_image_count: tokenOutImageCount || undefined,
      long_context_token_in_count: longContextTokenInCount || undefined,
      long_context_token_in_cached_context_count:
        longContextTokenInCachedContextCount || undefined,
      long_context_token_out_count: longContextTokenOutCount || undefined,
      long_context_token_out_reasoning_count:
        longContextTokenOutReasoningCount || undefined,
      long_context_token_out_audio_count:
        longContextTokenOutAudioCount || undefined,
      long_context_token_out_image_count:
        longContextTokenOutImageCount || undefined,
    };
  }

  private getUsageCounts(
    data: PsModelUsageItemData,
    prices?: PsBaseModelPriceConfiguration | null
  ): PsModelUsageTokenCounts | undefined {
    const usage = data.usage as
      | (PsModelUsageTokenCounts & {
          tokenInCount?: number;
          tokenOutCount?: number;
          tokenInCachedContextCount?: number;
          tokenOutReasoningCount?: number;
          tokenOutAudioCount?: number;
          longContextTokenInCount?: number;
          longContextTokenInCachedContextCount?: number;
          longContextTokenOutCount?: number;
          longContextTokenOutReasoningCount?: number;
          longContextTokenOutAudioCount?: number;
        })
      | undefined;

    if (usage?.token_in_count !== undefined || usage?.token_out_count !== undefined) {
      return usage;
    }

    if (usage?.tokenInCount !== undefined || usage?.tokenOutCount !== undefined) {
      return {
        token_in_count: usage.tokenInCount || 0,
        token_out_count: usage.tokenOutCount || 0,
        token_in_cached_context_count: usage.tokenInCachedContextCount,
        token_out_reasoning_count: usage.tokenOutReasoningCount,
        token_out_audio_count: usage.tokenOutAudioCount,
        long_context_token_in_count: usage.longContextTokenInCount,
        long_context_token_in_cached_context_count:
          usage.longContextTokenInCachedContextCount,
        long_context_token_out_count: usage.longContextTokenOutCount,
        long_context_token_out_reasoning_count:
          usage.longContextTokenOutReasoningCount,
        long_context_token_out_audio_count:
          usage.longContextTokenOutAudioCount,
      };
    }

    if (data.accountingSnapshot || data.legacyAccountingSnapshot) {
      const snapshot = data.accountingSnapshot ?? data.legacyAccountingSnapshot!;
      return {
        token_in_count: snapshot.tokenInCount,
        token_out_count: snapshot.tokenOutCount,
        token_in_cached_context_count:
          snapshot.tokenInCachedContextCount || undefined,
        long_context_token_in_count:
          snapshot.longContextTokenInCount || undefined,
        long_context_token_in_cached_context_count:
          snapshot.longContextTokenInCachedContextCount || undefined,
        long_context_token_out_count:
          snapshot.longContextTokenOutCount || undefined,
      };
    }

    return this.buildUsageCountsFromNormalized(data, prices);
  }

  private calcCostsFromItem(
    data: PsModelUsageItemData,
    fallbackPrices?: PsBaseModelPriceConfiguration | null
  ): PsUsageItemCostBreakdown {
    const effectivePrices = this.resolveEffectivePrices(data, fallbackPrices);
    const usage = this.getUsageCounts(data, effectivePrices);

    if (!effectivePrices || !usage) {
      return zeroCosts();
    }

    const costInNormal =
      ((usage.token_in_count || 0) *
        (effectivePrices.costInTokensPerMillion || 0)) /
      1000000.0;

    const costInCached =
      ((usage.token_in_cached_context_count || 0) *
        (effectivePrices.costInCachedContextTokensPerMillion || 0)) /
      1000000.0;

    const costInLong =
      ((usage.long_context_token_in_count || 0) *
        (effectivePrices.longContextCostInTokensPerMillion ||
          effectivePrices.costInTokensPerMillion ||
          0)) /
      1000000.0;

    const costOutNormal =
      (((usage.token_out_count || 0) +
        (usage.token_out_reasoning_count || 0) +
        (usage.token_out_audio_count || 0) +
        (usage.token_out_image_count || 0)) *
        (effectivePrices.costOutTokensPerMillion || 0)) /
      1000000.0;

    const costOutLong =
      (((usage.long_context_token_out_count || 0) +
        (usage.long_context_token_out_reasoning_count || 0) +
        (usage.long_context_token_out_audio_count || 0) +
        (usage.long_context_token_out_image_count || 0)) *
        (effectivePrices.longContextCostOutTokensPerMillion ||
          effectivePrices.costOutTokensPerMillion ||
          0)) /
      1000000.0;

    const costInCachedLong =
      ((usage.long_context_token_in_cached_context_count || 0) *
        (effectivePrices.longContextCostInCachedContextTokensPerMillion ||
          effectivePrices.costInCachedContextTokensPerMillion ||
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

  private async fetchUsageItemRows(agentIds: number[]): Promise<PsUsageItemRow[]> {
    if (agentIds.length === 0) {
      return [];
    }

    await ensureApplicationLevelSync();

    return sequelize.query<PsUsageItemRow>(
      `
      SELECT
        mui.created_at,
        mui.agent_id,
        a.configuration->>'name' AS agent_name,
        COALESCE(am.name, mui.data->'model'->>'name') AS ai_model_name,
        mui.data,
        am.configuration->'prices' AS price_cfg
      FROM ps_model_usage_item mui
      LEFT JOIN ps_agents a ON mui.agent_id = a.id
      LEFT JOIN ps_ai_models am ON mui.model_id = am.id
      WHERE mui.agent_id IN (:agentIds)
      ORDER BY mui.created_at DESC
    `,
      {
        replacements: { agentIds },
        type: QueryTypes.SELECT,
      }
    );
  }

  public async getDetailedAgentCosts(agentIds: number[]) {
    const rows = await this.fetchUsageItemRows(agentIds);
    if (rows.length === 0) {
      return [];
    }

    return rows.flatMap((row) => {
      const data = this.normalizeItemData(row.data);
      const effectivePrices = data
        ? this.resolveEffectivePrices(data, row.price_cfg)
        : undefined;
      const usage = data
        ? this.getUsageCounts(data, effectivePrices)
        : undefined;
      if (!data || !usage) {
        return [];
      }

      const costs = this.calcCostsFromItem(data, row.price_cfg);

      return [
        {
          createdAt: row.created_at,
          agentId: row.agent_id,
          agentName: row.agent_name ?? `Agent ${row.agent_id}`,
          aiModelName:
            row.ai_model_name ?? data.model?.name ?? "Unknown AI Model",
          tokenInCount:
            (usage.token_in_count || 0) +
            (usage.long_context_token_in_count || 0) +
            (usage.token_in_cached_context_count || 0) +
            (usage.long_context_token_in_cached_context_count || 0),
          tokenInCachedContextCount:
            usage.token_in_cached_context_count || 0,
          longContextTokenInCount: usage.long_context_token_in_count || 0,
          longContextTokenOutCount: usage.long_context_token_out_count || 0,
          longContextTokenInCachedContextCount:
            usage.long_context_token_in_cached_context_count || 0,
          tokenOutCount:
            (usage.token_out_count || 0) +
            (usage.token_out_reasoning_count || 0) +
            (usage.token_out_audio_count || 0) +
            (usage.token_out_image_count || 0) +
            (usage.long_context_token_out_count || 0) +
            (usage.long_context_token_out_reasoning_count || 0) +
            (usage.long_context_token_out_audio_count || 0) +
            (usage.long_context_token_out_image_count || 0),
          costIn:
            costs.costInNormal +
            costs.costInCached +
            costs.costInLong +
            costs.costInCachedLong,
          costOut: costs.costOutNormal + costs.costOutLong,
          totalCost: costs.totalCost,
          costInNormal: costs.costInNormal,
          costInCached: costs.costInCached,
          costInLong: costs.costInLong,
          costInCachedLong: costs.costInCachedLong,
          costOutNormal: costs.costOutNormal,
          costOutLong: costs.costOutLong,
        } satisfies PsDetailedAgentCostResults,
      ];
    });
  }

  public async getAgentCosts(rootAgentId: number, agentIds: number[]) {
    const rows = await this.fetchUsageItemRows(agentIds);
    if (rows.length === 0) {
      return undefined;
    }

    const agentHierarchy = await sequelize.query<{ id: number; level: number }>(
      `
      WITH RECURSIVE agent_levels AS (
        SELECT id, parent_agent_id, 0 AS level
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
        replacements: { rootAgentId, agentIds },
        type: QueryTypes.SELECT,
      }
    );

    const agentLevelsMap = new Map<number, number>();
    agentHierarchy.forEach((row) => {
      agentLevelsMap.set(row.id, row.level);
    });

    const agentCostMap = new Map<number, number>();
    for (const row of rows) {
      const data = this.normalizeItemData(row.data);
      const effectivePrices = data
        ? this.resolveEffectivePrices(data, row.price_cfg)
        : undefined;
      if (!data || !this.getUsageCounts(data, effectivePrices)) {
        continue;
      }

      const costs = this.calcCostsFromItem(data, row.price_cfg);
      agentCostMap.set(
        row.agent_id,
        (agentCostMap.get(row.agent_id) || 0) + costs.totalCost
      );
    }

    const agentCosts = Array.from(agentCostMap.entries())
      .map(([agentId, cost]) => ({
        agentId,
        level:
          agentLevelsMap.get(agentId) !== undefined
            ? agentLevelsMap.get(agentId)
            : -1,
        cost: parseFloat(cost.toFixed(2)),
      }))
      .sort(
        (a, b) => (a.level ?? 0) - (b.level ?? 0) || a.agentId - b.agentId
      );

    return {
      agentCosts,
      totalCost: agentCosts
        .reduce((sum, agent) => sum + agent.cost, 0)
        .toFixed(2),
    } as PsAgentCostResults;
  }

  public async getSingleAgentCosts(agentId: number) {
    const rows = await this.fetchUsageItemRows([agentId]);
    if (rows.length === 0) {
      return undefined;
    }

    let totalAgentCost = 0;

    for (const row of rows) {
      const data = this.normalizeItemData(row.data);
      const effectivePrices = data
        ? this.resolveEffectivePrices(data, row.price_cfg)
        : undefined;
      if (!data || !this.getUsageCounts(data, effectivePrices)) {
        continue;
      }

      totalAgentCost += this.calcCostsFromItem(data, row.price_cfg).totalCost;
    }

    return totalAgentCost.toFixed(2);
  }
}
