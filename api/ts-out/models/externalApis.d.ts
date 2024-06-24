import { Model, Optional } from "sequelize";
interface PsExternalApiCreationAttributes extends Optional<PsExternalApiAttributes, "id" | "uuid" | "created_at" | "updated_at"> {
}
export declare class PsExternalApi extends Model<PsExternalApiAttributes, PsExternalApiCreationAttributes> implements PsExternalApiAttributes {
    id: number;
    uuid: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    organization_id: number;
    type: string;
    priceAdapter: PsBaseApiPriceAdapter;
}
export {};
//# sourceMappingURL=externalApis.d.ts.map