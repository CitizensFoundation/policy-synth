import { Model, Optional } from "sequelize";
import { User } from "./ypUser.js";
interface PsAgentConnectorClassCreationAttributes extends Optional<PsAgentConnectorClassAttributes, "id" | "uuid" | "created_at" | "updated_at"> {
}
export declare class PsAgentConnectorClass extends Model<PsAgentConnectorClassAttributes, PsAgentConnectorClassCreationAttributes> implements PsAgentConnectorClassAttributes {
    id: number;
    uuid: string;
    user_id: number;
    class_base_id: string;
    created_at: Date;
    updated_at: Date;
    name: string;
    version: number;
    available: boolean;
    configuration: PsAgentConnectorConfiguration;
    Users?: User[];
    Admins?: User[];
    addUser: (user: User, obj?: any | undefined) => Promise<void>;
    addUsers: (users: User[]) => Promise<void>;
    getUsers: () => Promise<User[]>;
    setUsers: (users: User[]) => Promise<void>;
    removeUser: (user: User) => Promise<void>;
    removeUsers: (users: User[]) => Promise<void>;
    addAdmin: (user: User, obj?: any | undefined) => Promise<void>;
    addAdmins: (users: User[]) => Promise<void>;
    getAdmins: () => Promise<User[]>;
    setAdmins: (users: User[]) => Promise<void>;
    removeAdmin: (user: User) => Promise<void>;
    removeAdmins: (users: User[]) => Promise<void>;
}
export {};
//# sourceMappingURL=agentConnectorClass.d.ts.map