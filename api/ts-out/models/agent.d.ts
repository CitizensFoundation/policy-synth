import { Model, Optional } from "sequelize";
interface PsAgentCreationAttributes extends Optional<PsAgentAttributes, "id" | "uuid" | "created_at" | "updated_at" | "parent_agent_id"> {
}
export declare class PsAgent extends Model<PsAgentAttributes, PsAgentCreationAttributes> implements PsAgentAttributes {
    id: number;
    uuid: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    class_id: number;
    group_id: number;
    configuration: PsBaseNodeConfiguration;
    parent_agent_id?: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    class?: PsAgentClassAttributes;
    user?: YpUserData;
    group?: YpGroupData;
    apiCosts?: PsApiCostAttributes[];
    modelCosts?: PsModelCostAttributes[];
    parentAgent?: PsAgent;
    subAgents?: PsAgent[];
    connectors?: PsAgentConnectorAttributes[];
}
export {};
//# sourceMappingURL=agent.d.ts.map