import type { Sequelize, Transaction } from "sequelize";

import { PolicySynthAgentBase } from "./agentBase.js";
import { resolveUsageAccountingVersion } from "./modelUsageAccounting.js";

let sequelize: Sequelize | undefined;
let PsModelUsageItem:
  | (typeof import("../dbModels/modelUsageItem.js"))["PsModelUsageItem"]
  | undefined;
let ensureApplicationLevelSync:
  | (typeof import("../dbModels/index.js"))["ensureApplicationLevelSync"]
  | undefined;
let loadDbModulesPromise: Promise<void> | undefined;

type PsModelUsageItemModel = (typeof import("../dbModels/modelUsageItem.js"))["PsModelUsageItem"];

export type PsModelUsageItemDbModules = {
  sequelize?: Sequelize;
  PsModelUsageItem?: PsModelUsageItemModel;
};

export type PsModelUsageItemDbModuleLoader =
  () => Promise<PsModelUsageItemDbModules>;

async function loadDbModules() {
  if (process.env.DISABLE_DB_INIT) {
    return;
  }

  if (!loadDbModulesPromise) {
    loadDbModulesPromise = (async () => {
      ({ sequelize, ensureApplicationLevelSync } = await import(
        "../dbModels/index.js"
      ));
      ({ PsModelUsageItem } = await import("../dbModels/modelUsageItem.js"));

      if (ensureApplicationLevelSync) {
        await ensureApplicationLevelSync();
      }
    })();
  }

  try {
    await loadDbModulesPromise;
  } catch (error) {
    loadDbModulesPromise = undefined;
    throw error;
  }
}

export const loadPsModelUsageItemDbModules: PsModelUsageItemDbModuleLoader =
  async () => {
    await loadDbModules();

    return {
      sequelize,
      PsModelUsageItem,
    };
  };

export class PsModelUsageItemManager extends PolicySynthAgentBase {
  constructor(
    private readonly loadDbModulesForUsageItems:
      PsModelUsageItemDbModuleLoader = loadPsModelUsageItemDbModules
  ) {
    super();
  }

  private async requireDbModules(): Promise<{
    sequelize: Sequelize;
    PsModelUsageItem: PsModelUsageItemModel;
  }> {
    const modules = await this.loadDbModulesForUsageItems();
    if (!modules.sequelize || !modules.PsModelUsageItem) {
      throw new Error(
        "Database modules not initialized for usage item persistence"
      );
    }

    return {
      sequelize: modules.sequelize,
      PsModelUsageItem: modules.PsModelUsageItem,
    };
  }

  async preparePersistence(): Promise<void> {
    await this.requireDbModules();
  }

  private getUsageNormalized(
    ctx: PsModelUsageItemSaveContext
  ): PsModelUsageNormalizedCounts {
    return {
      tokensIn: ctx.usageItemData?.usageNormalized?.tokensIn ?? ctx.tokensIn,
      tokensOut: ctx.usageItemData?.usageNormalized?.tokensOut ?? ctx.tokensOut,
      cachedInTokens:
        ctx.usageItemData?.usageNormalized?.cachedInTokens ?? ctx.cachedInTokens,
      cacheWriteInTokens:
        ctx.usageItemData?.usageNormalized?.cacheWriteInTokens ??
        ctx.cacheWriteInTokens,
      reasoningTokens:
        ctx.usageItemData?.usageNormalized?.reasoningTokens ??
        ctx.reasoningTokens,
      audioTokens:
        ctx.usageItemData?.usageNormalized?.audioTokens ?? ctx.audioTokens,
      imageTokens: ctx.usageItemData?.usageNormalized?.imageTokens,
      cacheReadInputTokens:
        ctx.usageItemData?.usageNormalized?.cacheReadInputTokens,
    };
  }

  private shouldPersistUsageItem(
    ctx: PsModelUsageItemSaveContext
  ): boolean {
    return Boolean(
      ctx.usageItemData?.usageRaw ||
        ctx.tokensIn ||
        ctx.tokensOut ||
        ctx.cachedInTokens ||
        ctx.cacheWriteInTokens ||
        ctx.reasoningTokens ||
        ctx.audioTokens
    );
  }

  private buildUsageItemData(
    ctx: PsModelUsageItemSaveContext & { userId: number; agentId: number }
  ): PsModelUsageItemData {
    return {
      version: 1,
      accountingVersion: resolveUsageAccountingVersion(
        ctx.accountingVersion ?? ctx.usageItemData?.accountingVersion
      ),
      provider: ctx.modelProvider,
      apiFamily: ctx.usageItemData?.apiFamily ?? ctx.modelProvider,
      timestamp: new Date().toISOString(),
      model: {
        id: ctx.modelId,
        name: ctx.modelName,
        type: ctx.modelType,
        size: ctx.modelSize,
      },
      actor: {
        userId: ctx.userId,
        agentId: ctx.agentId,
        connectorId: ctx.connectorId,
      },
      request: {
        streaming: ctx.streaming,
        ...(ctx.usageItemData?.request ?? {}),
      },
      pricing: {
        configuredPrices: ctx.prices,
        inferenceType: ctx.inferenceType,
        regionalProcessing: ctx.regionalProcessing,
      },
      usageNormalized: this.getUsageNormalized(ctx),
      providerData: ctx.usageItemData,
      usageRaw: ctx.usageItemData?.usageRaw,
      providerMetadata: ctx.usageItemData?.providerMetadata,
    };
  }

  async saveUsageItem(
    ctx: PsModelUsageItemSaveContext & { userId: number; agentId: number },
    transaction?: Transaction
  ) {
    if (
      process.env.DISABLE_DB_USAGE_TRACKING === "true" ||
      process.env.DISABLE_DB_INIT ||
      !this.shouldPersistUsageItem(ctx)
    ) {
      return;
    }

    if (!ctx.modelId || ctx.modelId === -1) {
      this.logger.debug(
        `Skipping ps_model_usage_item insert for ${ctx.modelProvider}/${ctx.modelName}: no persisted model id`
      );
      return;
    }

    const { PsModelUsageItem: loadedPsModelUsageItem } =
      await this.requireDbModules();

    const modelId = ctx.modelId;
    const data = this.buildUsageItemData(ctx);

    const createPayload: Omit<
      PsModelUsageItemAttributes,
      "id" | "created_at" | "updated_at"
    > = {
      user_id: ctx.userId,
      model_id: modelId,
      agent_id: ctx.agentId,
      data,
      ...(ctx.connectorId !== undefined
        ? { connector_id: ctx.connectorId }
        : {}),
    };

    await loadedPsModelUsageItem.create(createPayload, { transaction });
  }
}
