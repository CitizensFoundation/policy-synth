import { Model, Optional } from "sequelize";
interface PsPrivateAccessStoreAttributes {
    id: string;
    group_id: string;
    ai_model_id?: number;
    external_api_id?: number;
    encrypted_api_key: string;
    encrypted_aes_key: string;
    hashed_user_id: string;
    created_at: Date;
    updated_at: Date;
    last_used_at?: Date;
    is_active: boolean;
}
interface PsPrivateAccessStoreCreationAttributes extends Optional<PsPrivateAccessStoreAttributes, "id" | "created_at" | "updated_at" | "last_used_at" | "is_active"> {
}
declare class PsPrivateAccessStore extends Model<PsPrivateAccessStoreAttributes, PsPrivateAccessStoreCreationAttributes> implements PsPrivateAccessStoreAttributes {
    id: string;
    group_id: string;
    ai_model_id?: number;
    external_api_id?: number;
    encrypted_api_key: string;
    encrypted_aes_key: string;
    hashed_user_id: string;
    created_at: Date;
    updated_at: Date;
    last_used_at?: Date;
    is_active: boolean;
    static encryptApiKey(apiKey: string): {
        encryptedApiKey: string;
        encryptedAesKey: string;
    };
    static decryptApiKey(encryptedApiKey: string, encryptedAesKey: string): string;
    static hashUserId(userId: string): Promise<string>;
    static getConfigurationByGroupId(groupId: string): Promise<{
        aiModelId?: number;
        externalApiId?: number;
        apiKey: string;
    } | null>;
}
declare const PsPrivateAccessStoreProxy: typeof PsPrivateAccessStore;
export { PsPrivateAccessStoreProxy as PsPrivateAccessStore };
//# sourceMappingURL=privateAccessStore.d.ts.map