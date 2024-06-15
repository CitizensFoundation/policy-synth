import { Model, Optional } from "sequelize";
interface YpUserDataCreationAttributes extends Optional<YpUserData, "id" | "created_at" | "updated_at"> {
}
export declare class User extends Model<YpUserData, YpUserDataCreationAttributes> implements YpUserData {
    id: number;
    name: string;
    email: string;
    readonly created_at: Date;
    readonly updated_at: Date;
}
export {};
//# sourceMappingURL=ypUser.d.ts.map