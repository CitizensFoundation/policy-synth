import { Model, Optional } from "sequelize";
interface PsAgentAuditLogCreationAttributes extends Optional<PsAgentAuditLogAttributes, "id" | "created_at" | "updated_at" | "details"> {
}
export declare class PsAgentAuditLog extends Model<PsAgentAuditLogAttributes, PsAgentAuditLogCreationAttributes> implements PsAgentAuditLogAttributes {
    id: number;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    agent_id: number;
    connector_id: number;
    action: string;
    details?: PsAgentAuditLogDetails;
}
export {};
//# sourceMappingURL=agentAuditLog.d.ts.map