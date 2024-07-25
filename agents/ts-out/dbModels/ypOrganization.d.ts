import { Model, Optional } from "sequelize";
interface YpOrganizationDataCreationAttributes extends Optional<YpOrganizationsData, "id" | "created_at" | "updated_at"> {
}
export declare class Group extends Model<YpOrganizationsData, YpOrganizationDataCreationAttributes> implements YpOrganizationsData {
    id: number;
    name: string;
    type: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    configuration: any;
}
export {};
//# sourceMappingURL=ypOrganization.d.ts.map