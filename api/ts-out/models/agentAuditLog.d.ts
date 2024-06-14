import { Model, Optional } from "sequelize";
interface PsAgentAuditLogCreationAttributes extends Optional<PsAgentAuditLogAttributes, "id" | "uuid" | "created_at" | "updated_at" | "details"> {
}
export declare class PsAgentAuditLog extends Model<PsAgentAuditLogAttributes, PsAgentAuditLogCreationAttributes> implements PsAgentAuditLogAttributes {
    id: number;
    uuid: string;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    agent_id: number;
    connector_id: number;
    action: string;
    details?: PsAgentAuditLogDetails;
    timestamp: Date;
}
export {};
//# sourceMappingURL=agentAuditLog.d.ts.map