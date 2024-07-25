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
    AiModels?: PsAiModelAttributes[];
    InputConnectors?: PsAgentConnectorAttributes[];
    OutputConnectors?: PsAgentConnectorAttributes[];
    addInputConnector: (connector: PsAgentConnector, obj?: any | undefined) => Promise<void>;
    addInputConnectors: (connectors: PsAgentConnector[]) => Promise<void>;
    getInputConnectors: () => Promise<PsAgentConnector[]>;
    setInputConnectors: (connectors: PsAgentConnector[]) => Promise<void>;
    removeInputConnectors: (connectors: PsAgentConnector[]) => Promise<void>;
    addOutputConnector: (connector: PsAgentConnector, obj?: any | undefined) => Promise<void>;
    addOutputConnectors: (connectors: PsAgentConnector[]) => Promise<void>;
    getOutputConnectors: () => Promise<PsAgentConnector[]>;
    setOutputConnectors: (connectors: PsAgentConnector[]) => Promise<void>;
    removeOutputConnectors: (connectors: PsAgentConnector[]) => Promise<void>;
    addSubAgent: (agent: PsAgent) => Promise<void>;
    addSubAgents: (agents: PsAgent[]) => Promise<void>;
    getSubAgents: () => Promise<PsAgent[]>;
    setSubAgents: (agents: PsAgent[]) => Promise<void>;
    removeSubAgents: (agents: PsAgent[]) => Promise<void>;
    addAiModel: (model: PsAiModel, obj?: any | undefined) => Promise<void>;
    addAiModels: (models: PsAiModel[]) => Promise<void>;
    getAiModels: () => Promise<PsAiModel[]>;
    setAiModels: (models: PsAiModel[]) => Promise<void>;
    removeAiModel: (model: PsAiModel) => Promise<boolean>;
    removeAiModels: (models: PsAiModel[]) => Promise<void>;
    get redisMemoryKey(): string;
    get redisStatusKey(): string;
}
export {};
//# sourceMappingURL=agent.d.ts.map