import { Model, Optional } from "sequelize";
interface PsAiModelCreationAttributes extends Optional<PsAiModelAttributes, "id" | "uuid" | "created_at" | "updated_at"> {
}
export declare class PsAiModel extends Model<PsAiModelAttributes, PsAiModelCreationAttributes> implements PsAiModelAttributes {
    id: number;
    uuid: string;
    user_id: number;
    organization_id: number;
    created_at: Date;
    updated_at: Date;
    name: string;
    configuration: PsAiModelConfiguration;
}
export {};
//# sourceMappingURL=aiModel.d.ts.map