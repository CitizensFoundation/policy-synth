import { Model, Optional } from "sequelize";
interface PsAgentConnectorCreationAttributes extends Optional<PsAgentConnectorAttributes, "id" | "uuid" | "created_at" | "updated_at"> {
}
export declare class PsAgentConnector extends Model<PsAgentConnectorAttributes, PsAgentConnectorCreationAttributes> implements PsAgentConnectorAttributes {
    id: number;
    uuid: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    class_id: number;
    group_id: number;
    configuration: PsAgentConnectorsBaseConfiguration;
    User?: YpUserData;
    Group?: YpGroupData;
    Class?: PsAgentConnectorClassAttributes;
}
export {};
//# sourceMappingURL=agentConnector.d.ts.map