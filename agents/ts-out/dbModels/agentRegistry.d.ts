import { Model, Optional } from "sequelize";
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
}
export {};
//# sourceMappingURL=agentRegistry.d.ts.map