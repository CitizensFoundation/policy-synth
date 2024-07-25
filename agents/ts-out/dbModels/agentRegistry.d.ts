import { Model, Optional } from "sequelize";
import { PsAgentClass } from "./agentClass.js";
import { PsAgentConnectorClass } from "./agentConnectorClass.js";
interface PsAgentRegistryCreationAttributes extends Optional<PsAgentRegistryAttributes, "id" | "uuid" | "created_at" | "updated_at"> {
}
export declare class PsAgentRegistry extends Model<PsAgentRegistryAttributes, PsAgentRegistryCreationAttributes> implements PsAgentRegistryAttributes {
    id: number;
    uuid: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    configuration: PsAgentRegistryConfiguration;
    Agents?: PsAgentClassAttributes[];
    Connectors?: PsAgentConnectorClassAttributes[];
    addAgent: (agent: PsAgentClass) => Promise<void>;
    addConnector: (connector: PsAgentConnectorClass) => Promise<void>;
    removeAgent: (agent: PsAgentClass) => Promise<void>;
    removeConnector: (connector: PsAgentConnectorClass) => Promise<void>;
}
export {};
//# sourceMappingURL=agentRegistry.d.ts.map