import { Model, Optional } from "sequelize";
interface PsModelUsageCreationAttributes extends Optional<PsModelUsageAttributes, "id" | "created_at" | "updated_at"> {
}
export declare class PsModelUsage extends Model<PsModelUsageAttributes, PsModelUsageCreationAttributes> implements PsModelUsageAttributes {
    id: number;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    model_id: number;
    tokenInCount: number;
    tokenOutCount: number;
    tokenInCachedContextCount: number;
    agent_id: number;
    connector_id: number;
}
export {};
//# sourceMappingURL=modelUsage.d.ts.map