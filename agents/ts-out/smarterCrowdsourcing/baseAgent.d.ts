import { Job } from "bullmq";
import { PolicySynthOperationsAgent } from "../base/operationsAgent.js";
import { PsAgent } from "../dbModels/agent.js";
export declare abstract class BaseSmarterCrowdsourcingAgent extends PolicySynthOperationsAgent {
    memory: PsSmarterCrowdsourcingMemoryData;
    job: Job;
    currentSubProblemIndex: number | undefined;
    constructor(agent: PsAgent, memory: PsAgentMemoryData | undefined, startProgress: number, endProgress: number);
    get maxSubProblems(): number;
    initEmptySmarterCrowdsourcingMemory(): Promise<void>;
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
//# sourceMappingURL=baseAgent.d.ts.map