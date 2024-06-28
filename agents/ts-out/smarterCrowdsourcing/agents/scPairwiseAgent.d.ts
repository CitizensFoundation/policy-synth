import { Job } from "bullmq";
import { OperationsPairwiseRankingsAgent } from "../../base/operationsPairwiseRanking.js";
export declare abstract class BaseSmarterCrowdsourcingPairwiseAgent extends OperationsPairwiseRankingsAgent {
    memory: PsSmarterCrowdsourcingMemoryData;
    job: Job;
    currentSubProblemIndex: number | undefined;
    get customInstructionsRankSolutions(): string;
    get minimumNumberOfPairwiseVotesForPopulation(): number;
    get maxTopEntitiesToSearch(): number;
    get subProblemsRankingMinNumberOfMatches(): number;
    get maxSubProblems(): number;
    rootCauseTypes: string[];
    getProCons(prosCons: PsProCon[] | undefined): string[];
    lastPopulationIndex(subProblemIndex: number): number;
    renderSubProblem(subProblemIndex: number, useProblemAsHeader?: boolean): string;
    renderSubProblemSimple(subProblemIndex: number): string;
    getActiveSolutionsLastPopulation(subProblemIndex: number): PsSolution[];
    getActiveSolutionsFromPopulation(subProblemIndex: number, populationIndex: number): PsSolution[];
    numberOfPopulations(subProblemIndex: number): number;
    renderSubProblems(): string;
    renderEntity(subProblemIndex: number, entityIndex: number): string;
    renderProblemStatement(): string;
    renderProblemStatementSubProblemsAndEntities(index: number, includeMainProblemStatement?: boolean): string;
    renderEntityPosNegReasons(item: PsAffectedEntity): string;
}
//# sourceMappingURL=scPairwiseAgent.d.ts.map