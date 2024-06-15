import { Model, Optional } from "sequelize";
import { PsAgentConnector } from "./agentConnector.js";
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
    Class?: PsAgentClassAttributes;
    User?: YpUserData;
    Group?: YpGroupData;
    ApiCosts?: PsApiCostAttributes[];
    ModelCosts?: PsModelCostAttributes[];
    ParentAgent?: PsAgent;
    SubAgents?: PsAgent[];
    Connectors?: PsAgentConnectorAttributes[];
    addSubAgents: (subAgents: PsAgent[]) => Promise<void>;
    addConnectors: (connectors: PsAgentConnector[]) => Promise<void>;
}
export {};
//# sourceMappingURL=agent.d.ts.map