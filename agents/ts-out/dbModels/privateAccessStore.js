import { DataTypes, Model } from "sequelize";
import { sequelize } from "./sequelize.js";
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
class PsPrivateAccessStore extends Model {
    static encryptApiKey(apiKey) {
        if (!process.env.RSA_PUBLIC_KEY) {
            throw new Error("RSA_PUBLIC_KEY is not set in the environment variables");
        }
        const publicKey = process.env.RSA_PUBLIC_KEY;
        // Generate a random AES key
        const aesKey = crypto.randomBytes(32);
        // Encrypt the AES key with RSA public key
        const encryptedAesKey = crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        }, aesKey);
        // Encrypt the API key with AES
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
        let encryptedApiKey = cipher.update(apiKey, 'utf8', 'hex');
        encryptedApiKey += cipher.final('hex');
        const authTag = cipher.getAuthTag();
        // Combine IV, auth tag, and encrypted data
        const combinedEncryptedApiKey = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encryptedApiKey;
        return {
            encryptedApiKey: combinedEncryptedApiKey,
            encryptedAesKey: encryptedAesKey.toString('base64')
        };
    }
    static decryptApiKey(encryptedApiKey, encryptedAesKey) {
        if (!process.env.RSA_PRIVATE_KEY) {
            throw new Error("RSA_PRIVATE_KEY is not set in the environment variables");
        }
        const privateKey = process.env.RSA_PRIVATE_KEY;
        // Decrypt the AES key
        const aesKey = crypto.privateDecrypt({
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        }, Buffer.from(encryptedAesKey, 'base64'));
        // Decrypt the API key
        const parts = encryptedApiKey.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encryptedText = Buffer.from(parts[2], 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    }
    static async hashUserId(userId) {
        return bcrypt.hash(userId, 12);
    }
    static async getConfigurationByGroupId(groupId) {
        const config = await this.findOne({
            where: { group_id: groupId, is_active: true },
            attributes: ['ai_model_id', 'external_api_id', 'encrypted_api_key', 'encrypted_aes_key']
        });
        if (!config)
            return null;
        const decryptedApiKey = this.decryptApiKey(config.encrypted_api_key, config.encrypted_aes_key);
        return {
            aiModelId: config.ai_model_id,
            externalApiId: config.external_api_id,
            apiKey: decryptedApiKey
        };
    }
}
PsPrivateAccessStore.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    group_id: {
        type: DataTypes.UUID,
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
    hashed_user_id: {
        type: DataTypes.STRING,
        allowNull: false,
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
    }
}, {
    sequelize,
    tableName: "ps_private_access_stores",
    indexes: [
        {
            unique: true,
            fields: ['group_id', 'ai_model_id', 'external_api_id']
        }
    ],
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (instance) => {
            instance.hashed_user_id = await PsPrivateAccessStore.hashUserId(instance.group_id);
            const { encryptedApiKey, encryptedAesKey } = PsPrivateAccessStore.encryptApiKey(instance.encrypted_api_key);
            instance.encrypted_api_key = encryptedApiKey;
            instance.encrypted_aes_key = encryptedAesKey;
        }
    }
});
// Proxy to prevent direct access to sensitive methods
const PsPrivateAccessStoreProxy = new Proxy(PsPrivateAccessStore, {
    get(target, prop) {
        if (['findAll', 'findOne', 'findByPk'].includes(prop)) {
            console.warn(`Warning: Attempted to use unsecured method ${String(prop)}. Use getConfigurationByGroupId instead.`);
            return () => Promise.reject(new Error(`Use of ${String(prop)} is not allowed. Use getConfigurationByGroupId instead.`));
        }
        return target[prop];
    }
});
export { PsPrivateAccessStoreProxy as PsPrivateAccessStore };
//# sourceMappingURL=privateAccessStore.js.map