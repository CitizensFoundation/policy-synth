import { Model, Optional } from "sequelize";
interface PsModelUsageCreationAttributes extends Optional<PsModelUsageAttributes, "id" | "created_at" | "updated_at"> {
}
export declare class PsModelUsage extends Model<PsModelUsageAttributes, PsModelUsageCreationAttributes> implements PsModelUsageAttributes {
    id: number;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    model_id: number;
    token_in_count: number;
    token_out_count: number;
    token_in_cached_context_count: number;
    agent_id: number;
    connector_id: number;
}
export {};
//# sourceMappingURL=modelUsage.d.ts.map