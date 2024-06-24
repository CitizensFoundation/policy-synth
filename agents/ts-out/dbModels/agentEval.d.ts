import { Model, Optional } from "sequelize";
interface PsAgentEvalAttributesCreation extends Optional<PsAgentEvalAttributes, "id" | "created_at" | "updated_at"> {
}
export declare class PsEval extends Model<PsAgentEvalAttributes, PsAgentEvalAttributesCreation> implements PsAgentEvalAttributes {
    id: number;
    user_id: number;
    created_at: Date;
    updated_at: Date;
    overall_score: number;
    agent_id: number;
    notes: string;
    results: PsAgentEvalCriterionResult[];
}
export {};
//# sourceMappingURL=agentEval.d.ts.map