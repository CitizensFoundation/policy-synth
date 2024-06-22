import { Model, Optional } from "sequelize";
interface YpGroupDataCreationAttributes extends Optional<YpGroupData, "id" | "created_at" | "updated_at"> {
}
export declare class Group extends Model<YpGroupData, YpGroupDataCreationAttributes> implements YpGroupData {
    id: number;
    name: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    configuration: YpPsGroupConfigurationData;
}
export {};
//# sourceMappingURL=ypGroup.d.ts.map