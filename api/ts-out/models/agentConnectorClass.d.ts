import { Model, Optional } from "sequelize";
interface PsAgentConnectorClassCreationAttributes extends Optional<PsAgentConnectorClassAttributes, "id" | "uuid" | "created_at" | "updated_at"> {
}
export declare class PsAgentConnectorClass extends Model<PsAgentConnectorClassAttributes, PsAgentConnectorClassCreationAttributes> implements PsAgentConnectorClassAttributes {
    id: number;
    uuid: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    name: string;
    version: number;
    available: boolean;
    configuration: PsAgentConnectorConfiguration;
}
export {};
//# sourceMappingURL=agentConnectorClass.d.ts.map