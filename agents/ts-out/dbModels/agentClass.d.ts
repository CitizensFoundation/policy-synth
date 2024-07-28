import { Model, Optional } from "sequelize";
import { User } from "./ypUser.js";
interface PsAgentClassAttributesCreation extends Optional<PsAgentClassAttributes, "id" | "uuid" | "class_base_id" | "created_at" | "updated_at"> {
}
export declare class PsAgentClass extends Model<PsAgentClassAttributes, PsAgentClassAttributesCreation> implements PsAgentClassAttributes {
    id: number;
    uuid: string;
    class_base_id: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    name: string;
    version: number;
    configuration: PsAgentClassAttributesConfiguration;
    available: boolean;
    Users?: User[];
    Admins?: User[];
    addUser: (user: User, obj?: any | undefined) => Promise<void>;
    addUsers: (users: User[]) => Promise<void>;
    getUsers: () => Promise<User[]>;
    setUsers: (users: User[]) => Promise<void>;
    removeUser: (user: User) => Promise<void>;
    removeUsers: (users: User[]) => Promise<void>;
    hasUser: (user: User) => Promise<boolean>;
    hasAdmin: (user: User) => Promise<boolean>;
    addAdmin: (user: User, obj?: any | undefined) => Promise<void>;
    addAdmins: (users: User[]) => Promise<void>;
    getAdmins: () => Promise<User[]>;
    setAdmins: (users: User[]) => Promise<void>;
    removeAdmin: (user: User) => Promise<void>;
    removeAdmins: (users: User[]) => Promise<void>;
}
export {};
//# sourceMappingURL=agentClass.d.ts.map