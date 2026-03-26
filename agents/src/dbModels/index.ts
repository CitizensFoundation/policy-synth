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

  return code === "42P07" || message.toLowerCase().includes("already exists");
};

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
};

const initializeModels = async () => {
  try {
    // Call associate method to set up associations
    for (const modelName of Object.keys(models)) {
      if (models[modelName].associate) {
        await models[modelName].associate(models);
      }
    }

    if (process.env.SYNC_DB_FOR_APP === "true") {
      await applicationLevelSync();
    }

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
