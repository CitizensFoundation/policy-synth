import { Model, Optional } from "sequelize";
interface PsApiCostClassCreationAttributes extends Optional<PsApiCostClassAttributes, "id" | "uuid" | "created_at" | "updated_at"> {
}
export declare class PsApiCostClass extends Model<PsApiCostClassAttributes, PsApiCostClassCreationAttributes> implements PsApiCostClassAttributes {
    id: number;
    uuid: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    model_id: string;
    configuration: PsBaseApiCostConfiguration;
}
export {};
//# sourceMappingURL=apiCostClass.d.ts.map