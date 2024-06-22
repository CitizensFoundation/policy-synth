import { Model, Optional } from "sequelize";
interface PsAgentClassAttributesCreation extends Optional<PsAgentClassAttributes, "id" | "uuid" | "created_at" | "updated_at"> {
}
export declare class PsAgentClass extends Model<PsAgentClassAttributes, PsAgentClassAttributesCreation> implements PsAgentClassAttributes {
    id: number;
    uuid: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    name: string;
    version: number;
    configuration: PsAgentClassAttributesConfiguration;
    available: boolean;
}
export {};
//# sourceMappingURL=agentClass.d.ts.map