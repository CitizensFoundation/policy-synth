import { Model, Optional } from "sequelize";
import { PsAgentClass } from "./agentClass.js";
import { PsAgentConnector } from "./agentConnector.js";
import { PsAiModel } from "./aiModel.js";
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
    Class?: PsAgentClass;
    User?: YpUserData;
    Group?: YpGroupData;
    ExternalApiUsage?: PsExternalApiUsageAttributes[];
    ModelUsage?: PsModelUsageAttributes[];
    ParentAgent?: PsAgent;
    SubAgents?: PsAgent[];
    Connectors?: PsAgentConnectorAttributes[];
    AiModels?: PsAiModelAttributes[];
    addConnector: (connector: PsAgentConnector) => Promise<void>;
    addConnectors: (connectors: PsAgentConnector[]) => Promise<void>;
    getConnectors: () => Promise<PsAgentConnector[]>;
    setConnectors: (connectors: PsAgentConnector[]) => Promise<void>;
    removeConnectors: (connectors: PsAgentConnector[]) => Promise<void>;
    addSubAgent: (agent: PsAgent) => Promise<void>;
    addSubAgents: (agents: PsAgent[]) => Promise<void>;
    getSubAgents: () => Promise<PsAgent[]>;
    setSubAgents: (agents: PsAgent[]) => Promise<void>;
    removeSubAgents: (agents: PsAgent[]) => Promise<void>;
    addAiModel: (model: PsAiModel) => Promise<void>;
    addAiModels: (models: PsAiModel[]) => Promise<void>;
    getAiModels: () => Promise<PsAiModel[]>;
    setAiModels: (models: PsAiModel[]) => Promise<void>;
    removeAiModels: (models: PsAiModel[]) => Promise<void>;
}
export {};
//# sourceMappingURL=agent.d.ts.map