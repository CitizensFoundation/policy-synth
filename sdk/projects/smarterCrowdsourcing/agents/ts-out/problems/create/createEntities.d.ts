import { ProblemsSmarterCrowdsourcingAgent } from "../../base/scBaseProblemsAgent.js";
export declare class CreateEntitiesAgent extends ProblemsSmarterCrowdsourcingAgent {
    renderRefinePrompt(subProblemIndex: number, results: PsAffectedEntity[]): Promise<PsModelMessage[]>;
    renderCreatePrompt(subProblemIndex: number): Promise<PsModelMessage[]>;
    createEntities(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createEntities.d.ts.map