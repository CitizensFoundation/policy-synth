import { Model, Optional } from "sequelize";
interface PsModelCostCreationAttributes extends Optional<PsModelCostAttributes, "id" | "uuid" | "created_at" | "updated_at"> {
}
export declare class PsModelCost extends Model<PsModelCostAttributes, PsModelCostCreationAttributes> implements PsModelCostAttributes {
    id: number;
    uuid: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    cost_class_id: number;
    cost: number;
    agent_id: number;
    connector_id: number;
}
export {};
//# sourceMappingURL=modelCost.d.ts.map