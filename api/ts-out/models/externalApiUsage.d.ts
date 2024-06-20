import { Model, Optional } from "sequelize";
interface PsExternalApiUsageCreationAttributes extends Optional<PsExternalApiUsageAttributes, "id" | "created_at" | "updated_at"> {
}
export declare class PsExternalApiUsage extends Model<PsExternalApiUsageAttributes, PsExternalApiUsageCreationAttributes> implements PsExternalApiUsageAttributes {
    id: number;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    external_api_id: number;
    call_count: number;
    agent_id: number;
    connector_id: number;
    Agent?: PsAgentAttributes;
    Connector?: PsAgentConnectorAttributes;
}
export {};
//# sourceMappingURL=externalApiUsage.d.ts.map