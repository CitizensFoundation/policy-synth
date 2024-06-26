import { BaseSmarterCrowdsourcingAgent } from "../../baseAgent.js";
export declare class CreateEntitiesProcessor extends BaseSmarterCrowdsourcingAgent {
    renderRefinePrompt(subProblemIndex: number, results: PsAffectedEntity[]): Promise<PsModelMessage[]>;
    renderCreatePrompt(subProblemIndex: number): Promise<PsModelMessage[]>;
    createEntities(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createEntities.d.ts.map