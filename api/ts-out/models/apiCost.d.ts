import { Model, Optional } from "sequelize";
interface PsApiCostCreationAttributes extends Optional<PsApiCostAttributes, "id" | "uuid" | "created_at" | "updated_at"> {
}
export declare class PsApiCost extends Model<PsApiCostAttributes, PsApiCostCreationAttributes> implements PsApiCostAttributes {
    id: number;
    uuid: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    cost_class_id: number;
    cost: number;
    agent_id: number;
    connector_id: number;
    Agent?: PsAgentAttributes;
    Connector?: PsAgentConnectorAttributes;
}
export {};
//# sourceMappingURL=apiCost.d.ts.map