import { Model, Optional } from "sequelize";
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
interface PsPrivateAccessStoreCreationAttributes extends Optional<PsPrivateAccessStoreAttributes, "id" | "created_at" | "updated_at" | "last_used_at" | "is_active" | "usage"> {
}
declare class PsPrivateAccessStore extends Model<PsPrivateAccessStoreAttributes, PsPrivateAccessStoreCreationAttributes> implements PsPrivateAccessStoreAttributes {
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
    static encryptApiKey(apiKey: string): {
        encryptedApiKey: string;
        encryptedAesKey: string;
    };
    static decryptApiKey(encryptedApiKey: string, encryptedAesKey: string): string;
    static addPreEncryptedKey(groupId: number, userId: number, aiModelId: number | undefined, externalApiId: number | undefined, encryptedApiKey: string, encryptedAesKey: string, configuration: PsPrivateAccessStoreConfiguration): Promise<PsPrivateAccessStore>;
    private static isValidEncryptedFormat;
    private static isValidHex;
    private static isValidBase64;
    static getApiKeys(groupId: number, options?: GetApiKeysOptions): Promise<PsPrivateAccessStore[]>;
    static incrementUsageAndGetApiKey(groupId: number, options?: IncrementUsageOptions): Promise<string | null>;
    static setKeyStatus(id: number, isActive: boolean): Promise<boolean>;
    static getUsage(id: number): Promise<PsPrivateAccessStoreUsage | null>;
}
declare const PsPrivateAccessStoreProxy: typeof PsPrivateAccessStore;
export { PsPrivateAccessStoreProxy as PsPrivateAccessStore };
//# sourceMappingURL=privateAccessStore.d.ts.map