import { DataTypes, Model, Optional, Transaction } from "sequelize";
import { sequelize } from "./sequelize.js";
import * as crypto from "crypto";
import { PolicySynthAgentBase } from "../base/agentBase.js";

interface PsPrivateAccessStoreConfiguration {
  maxBudget: {
    perDay: number;
    petMonth: number;
    total: number;
  };
  emailNotificationBudgetThresholds: {
    daily: number;
    monthly: number;
  };
}

interface PsPrivateAccessStoreUsage {
  dailyUse: number;
  monthlyUse: number;
  totalUse: number;
}

interface PsPrivateAccessStoreAttributes {
  id: number;
  group_id: number;
  user_id: number;
  ai_model_id?: number;
  external_api_id?: number;
  encrypted_api_key: string;
  encrypted_aes_key: string;
  configuration: PsPrivateAccessStoreConfiguration;
  usage: PsPrivateAccessStoreUsage;
  created_at: Date;
  updated_at: Date;
  last_used_at?: Date;
  is_active: boolean;
  Group?: YpGroupData;
  User?: YpUserData;
}

interface GetApiKeysOptions {
  aiModelId?: number;
  externalApiId?: number;
  isActive?: boolean;
}

interface IncrementUsageOptions extends GetApiKeysOptions {
  incrementAmount?: number;
}

interface PsPrivateAccessStoreCreationAttributes
  extends Optional<
    PsPrivateAccessStoreAttributes,
    "id" | "created_at" | "updated_at" | "last_used_at" | "is_active" | "usage"
  > {}

class PsPrivateAccessStore
  extends Model<
    PsPrivateAccessStoreAttributes,
    PsPrivateAccessStoreCreationAttributes
  >
  implements PsPrivateAccessStoreAttributes
{
  declare id: number;
  declare group_id: number;
  declare user_id: number;
  declare ai_model_id?: number;
  declare external_api_id?: number;
  declare encrypted_api_key: string;
  declare encrypted_aes_key: string;
  declare configuration: PsPrivateAccessStoreConfiguration;
  declare usage: PsPrivateAccessStoreUsage;
  declare created_at: Date;
  declare updated_at: Date;
  declare last_used_at?: Date;
  declare is_active: boolean;

  static encryptApiKey(apiKey: string): {
    encryptedApiKey: string;
    encryptedAesKey: string;
  } {
    if (!process.env.RSA_API_ENCRYPTION_PUBLIC_KEY) {
      throw new Error(
        "RSA_API_ENCRYPTION_PUBLIC_KEY is not set in the environment variables"
      );
    }
    const publicKey = process.env.RSA_API_ENCRYPTION_PUBLIC_KEY;

    // Generate a random AES key
    const aesKey = crypto.randomBytes(32);

    // Encrypt the AES key with RSA public key
    const encryptedAesKey = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      aesKey
    );

    // Encrypt the API key with AES
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);
    let encryptedApiKey = cipher.update(apiKey, "utf8", "hex");
    encryptedApiKey += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    // Combine IV, auth tag, and encrypted data
    const combinedEncryptedApiKey =
      iv.toString("hex") +
      ":" +
      authTag.toString("hex") +
      ":" +
      encryptedApiKey;

    return {
      encryptedApiKey: combinedEncryptedApiKey,
      encryptedAesKey: encryptedAesKey.toString("base64"),
    };
  }

  static decryptApiKey(
    encryptedApiKey: string,
    encryptedAesKey: string
  ): string {
    if (!process.env.RSA_API_ENCRYPTION_PRIVATE_KEY) {
      throw new Error(
        "RSA_API_ENCRYPTION_PRIVATE_KEY is not set in the environment variables"
      );
    }
    const privateKey = process.env.RSA_API_ENCRYPTION_PRIVATE_KEY;

    // Decrypt the AES key
    const aesKey = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(encryptedAesKey, "base64")
    );

    // Decrypt the API key
    const parts = encryptedApiKey.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedText = Buffer.from(parts[2], "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
  }

  static async addPreEncryptedKey(
    groupId: number,
    userId: number,
    aiModelId: number | undefined,
    externalApiId: number | undefined,
    encryptedApiKey: string,
    encryptedAesKey: string,
    configuration: PsPrivateAccessStoreConfiguration
  ): Promise<PsPrivateAccessStore> {
    // Validate the encrypted data format
    if (
      !this.isValidEncryptedFormat(encryptedApiKey) ||
      !this.isValidBase64(encryptedAesKey)
    ) {
      throw new Error("Invalid encrypted key format");
    }

    const newStore = await this.create({
      group_id: groupId,
      user_id: userId,
      ai_model_id: aiModelId,
      external_api_id: externalApiId,
      encrypted_api_key: encryptedApiKey,
      encrypted_aes_key: encryptedAesKey,
      configuration: configuration,
      usage: {
        dailyUse: 0,
        monthlyUse: 0,
        totalUse: 0,
      },
      is_active: true,
    });

    return newStore;
  }

  private static isValidEncryptedFormat(encryptedApiKey: string): boolean {
    const parts = encryptedApiKey.split(":");
    return (
      parts.length === 3 &&
      this.isValidHex(parts[0]) &&
      this.isValidHex(parts[1]) &&
      this.isValidHex(parts[2])
    );
  }

  private static isValidHex(str: string): boolean {
    return /^[0-9A-Fa-f]+$/.test(str);
  }

  private static isValidBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

  static async getApiKeys(
    groupId: number,
    options: GetApiKeysOptions = {}
  ): Promise<PsPrivateAccessStore[]> {
    const { aiModelId, externalApiId, isActive } = options;
    const whereClause: any = { group_id: groupId };

    if (aiModelId !== undefined) whereClause.ai_model_id = aiModelId;
    if (externalApiId !== undefined)
      whereClause.external_api_id = externalApiId;
    if (isActive !== undefined) whereClause.is_active = isActive;

    return this.findAll({
      where: whereClause,
      order: [
        ["is_active", "DESC"],
        ["id", "ASC"],
      ],
    });
  }

  static async incrementUsageAndGetApiKey(
    groupId: number,
    options: IncrementUsageOptions = {}
  ): Promise<string | null> {
    const { aiModelId, externalApiId, incrementAmount = 1 } = options;

    const result = await sequelize.transaction(async (t: Transaction) => {
      const whereClause: any = {
        group_id: groupId,
        is_active: true,
      };

      if (aiModelId !== undefined) whereClause.ai_model_id = aiModelId;
      if (externalApiId !== undefined)
        whereClause.external_api_id = externalApiId;

      const stores = await this.findAll({
        where: whereClause,
        order: [["id", "ASC"]],
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (stores.length === 0) return null;

      // Use the first active key
      const store = stores[0];

      // Increment usage
      const newUsage = {
        dailyUse: (store.usage.dailyUse || 0) + incrementAmount,
        monthlyUse: (store.usage.monthlyUse || 0) + incrementAmount,
        totalUse: (store.usage.totalUse || 0) + incrementAmount,
      };

      await store.update(
        {
          usage: newUsage,
          last_used_at: new Date(),
        },
        { transaction: t }
      );

      const decryptedApiKey = this.decryptApiKey(
        store.encrypted_api_key,
        store.encrypted_aes_key
      );

      return decryptedApiKey;
    });

    return result;
  }

  static async setKeyStatus(id: number, isActive: boolean): Promise<boolean> {
    const [updatedRows] = await this.update(
      { is_active: isActive },
      { where: { id } }
    );
    return updatedRows > 0;
  }

  static async getUsage(id: number): Promise<PsPrivateAccessStoreUsage | null> {
    const result = await this.findOne({
      where: { id },
      attributes: ["usage"],
    });

    return result ? result.usage : null;
  }
}

(PsPrivateAccessStore as any).associate = (models: any) => {
  PsPrivateAccessStore.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "User",
  });

  PsPrivateAccessStore.belongsTo(models.Group, {
    foreignKey: "group_id",
    as: "Group",
  });
};

PsPrivateAccessStore.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ai_model_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    external_api_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    encrypted_api_key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    encrypted_aes_key: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    usage: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        dailyUse: 0,
        monthlyUse: 0,
        totalUse: 0,
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: "ps_private_access_store",
    indexes: [
      {
        fields: ["group_id"],
      },
      {
        fields: ["ai_model_id"],
      },
      {
        fields: ["external_api_id"],
      },
      {
        fields: ["is_active"],
      }
    ],
    timestamps: true,
    underscored: true,
  }
);

// Proxy to prevent direct access to sensitive methods
const PsPrivateAccessStoreProxy = new Proxy(PsPrivateAccessStore, {
  get(target: typeof PsPrivateAccessStore, prop: string | symbol) {
    if (["findAll", "findOne", "findByPk"].includes(prop as string)) {
      PolicySynthAgentBase.logger.warn(
        `Warning: Attempted to use unsecured method ${String(
          prop
        )}. Use incrementUsageAndGetApiKey instead.`
      );
      return () =>
        Promise.reject(
          new Error(
            `Use of ${String(
              prop
            )} is not allowed. Use incrementUsageAndGetApiKey instead.`
          )
        );
    }
    return target[prop as keyof typeof PsPrivateAccessStore];
  },
});

export { PsPrivateAccessStoreProxy as PsPrivateAccessStore };
