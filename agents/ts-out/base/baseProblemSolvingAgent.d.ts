import { Job } from "bullmq";
import { PolicySynthScAgentBase } from "./baseScAgentBase.js";
export declare abstract class BaseProblemSolvingAgent extends PolicySynthScAgentBase {
    memory: PsSmarterCrowdsourcingMemoryData;
    job: Job;
    currentSubProblemIndex: number | undefined;
    private startProgress;
    private endProgress;
    constructor(job: Job, memory: PsSmarterCrowdsourcingMemoryData, startProgress: number, endProgress: number);
    getProCons(prosCons: PsProCon[] | undefined): string[];
    process(): Promise<void>;
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
//# sourceMappingURL=baseProblemSolvingAgent.d.ts.map