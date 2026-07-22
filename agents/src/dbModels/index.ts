import { PsAgentConnectorClass } from "./agentConnectorClass.js"; // Adjust the path as needed
import { User } from "./ypUser.js";
import { Group } from "./ypGroup.js";
import { PsAgentClass } from "./agentClass.js";
import { PsAgentConnector } from "./agentConnector.js";
import { PsAgent } from "./agent.js";
import { PsExternalApiUsage } from "./externalApiUsage.js";
import { PsModelUsage } from "./modelUsage.js";
import { PsModelUsageItem } from "./modelUsageItem.js";
import { PsAgentAuditLog } from "./agentAuditLog.js";
import { PsAgentRegistry } from "./agentRegistry.js";
import { PsAiModel } from "./aiModel.js";
import { PsExternalApi } from "./externalApis.js";
import { DataTypes } from "sequelize";

import { sequelize } from "./sequelize.js";
import { PolicySynthAgentBase } from "../base/agentBase.js";

interface Models {
  [key: string]: any;
}

const models: Models = {
  PsAgentClass,
  User,
  Group,
  PsExternalApiUsage,
  PsModelUsage,
  PsModelUsageItem,
  PsAgentConnector,
  PsAgent,
  PsAgentAuditLog,
  PsAgentConnectorClass,
  PsAgentRegistry,
  PsAiModel,
  PsExternalApi
};

const MODEL_USAGE_ITEM_TABLE = "ps_model_usage_item";
const MODEL_USAGE_TABLE = "ps_model_usage";
const MODEL_USAGE_CACHE_WRITE_COLUMNS = [
  "token_in_cache_write_count",
  "long_context_token_in_cache_write_count",
] as const;
const MODEL_USAGE_ITEM_INDEXES: Array<{
  name: string;
  fields: string[];
}> = [
  { name: "ps_model_usage_item_user_id", fields: ["user_id"] },
  { name: "ps_model_usage_item_model_id", fields: ["model_id"] },
  { name: "ps_model_usage_item_agent_id", fields: ["agent_id"] },
  { name: "ps_model_usage_item_connector_id", fields: ["connector_id"] },
  { name: "ps_model_usage_item_created_at", fields: ["created_at"] },
];

const isAlreadyExistsError = (error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const code =
    (error as { original?: { code?: string }; parent?: { code?: string } })
      ?.original?.code ??
    (error as { original?: { code?: string }; parent?: { code?: string } })
      ?.parent?.code;

  return (
    code === "42P07" ||
    code === "42701" ||
    message.toLowerCase().includes("already exists")
  );
};

const isMissingTableError = (error: unknown) => {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const code =
    (error as { original?: { code?: string }; parent?: { code?: string } })
      ?.original?.code ??
    (error as { original?: { code?: string }; parent?: { code?: string } })
      ?.parent?.code;

  const normalizedMessage = message.toLowerCase();
  return (
    code === "42P01" ||
    normalizedMessage.includes("does not exist") ||
    normalizedMessage.includes("missing table")
  );
};

let applicationLevelSyncPromise: Promise<void> | undefined;

const applicationLevelSync = async () => {
  const queryInterface = sequelize.getQueryInterface();

  try {
    await queryInterface.describeTable(MODEL_USAGE_ITEM_TABLE);
  } catch {
    try {
      await queryInterface.createTable(MODEL_USAGE_ITEM_TABLE, {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        },
        model_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        agent_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        connector_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        data: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
      });
      PolicySynthAgentBase.logger.info(
        `Created application-managed table ${MODEL_USAGE_ITEM_TABLE}`
      );
    } catch (error) {
      if (!isAlreadyExistsError(error)) {
        throw error;
      }
      PolicySynthAgentBase.logger.info(
        `${MODEL_USAGE_ITEM_TABLE} was created concurrently by another instance`
      );
    }
  }

  const existingIndexes = (await queryInterface.showIndex(
    MODEL_USAGE_ITEM_TABLE
  )) as Array<{ name?: string }>;
  const existingIndexNames = new Set(existingIndexes.map((index) => index.name));

  for (const index of MODEL_USAGE_ITEM_INDEXES) {
    if (existingIndexNames.has(index.name)) {
      continue;
    }
    try {
      await queryInterface.addIndex(MODEL_USAGE_ITEM_TABLE, index.fields, {
        name: index.name,
      });
    } catch (error) {
      if (!isAlreadyExistsError(error)) {
        throw error;
      }
    }
  }

  try {
    const modelUsageColumns = await queryInterface.describeTable(
      MODEL_USAGE_TABLE
    );
    for (const columnName of MODEL_USAGE_CACHE_WRITE_COLUMNS) {
      if (columnName in modelUsageColumns) {
        continue;
      }
      try {
        await queryInterface.addColumn(MODEL_USAGE_TABLE, columnName, {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        });
      } catch (error) {
        if (!isAlreadyExistsError(error)) {
          throw error;
        }
      }
    }
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }
    PolicySynthAgentBase.logger.info(
      `Skipped cache-write columns because ${MODEL_USAGE_TABLE} does not exist yet`
    );
  }
};

const ensureApplicationLevelSync = async () => {
  if (process.env.SYNC_DB_FOR_APP !== "true") {
    return;
  }

  if (!applicationLevelSyncPromise) {
    applicationLevelSyncPromise = applicationLevelSync().catch((error) => {
      applicationLevelSyncPromise = undefined;
      throw error;
    });
  }

  await applicationLevelSyncPromise;
};

const initializeModels = async () => {
  try {
    // Call associate method to set up associations
    for (const modelName of Object.keys(models)) {
      if (models[modelName].associate) {
        await models[modelName].associate(models);
      }
    }

    await ensureApplicationLevelSync();

    if (process.env.FORCE_DB_SYNC || process.env.NODE_ENV === "development") {
      sequelize.sync().then(async () => {
        PolicySynthAgentBase.logger.debug("Policy Synth database synced successfully.");
      });
    }

    PolicySynthAgentBase.logger.debug("All models initialized successfully.");

  } catch (error) {
    PolicySynthAgentBase.logger.error("Error initializing models:", error);
    process.exit(1); // Exit the process with failure
  }
};

export {
  models,
  initializeModels,
  applicationLevelSync,
  ensureApplicationLevelSync,
  sequelize,
  PsAgentConnectorClass,
  User,
  Group,
  PsAgentClass,
  PsAgentConnector,
  PsAgent,
  PsExternalApiUsage,
  PsModelUsage,
  PsModelUsageItem,
  PsAgentAuditLog,
  PsAgentRegistry,
  PsAiModel,
  PsExternalApi
 };
