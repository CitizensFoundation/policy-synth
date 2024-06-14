import { Model, Optional } from "sequelize";
interface PsModelCostClassCreationAttributes extends Optional<PsModelCostClassAttributes, "id" | "uuid" | "created_at" | "updated_at"> {
}
export declare class PsModelCostClass extends Model<PsModelCostClassAttributes, PsModelCostClassCreationAttributes> implements PsModelCostClassAttributes {
    id: number;
    uuid: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    model_id: string;
    configuration: PsBaseModelCostConfiguration;
}
export {};
//# sourceMappingURL=modelCostClass.d.ts.map