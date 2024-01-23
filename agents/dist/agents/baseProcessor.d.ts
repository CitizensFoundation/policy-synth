import { Job } from "bullmq";
import { PolicySynthAgentBase } from "../base.js";
export declare abstract class BaseProcessor extends PolicySynthAgentBase {
    memory: IEngineInnovationMemoryData;
    job: Job;
    currentSubProblemIndex: number | undefined;
    constructor(job: Job, memory: IEngineInnovationMemoryData);
    getProCons(prosCons: IEngineProCon[] | undefined): string[];
    process(): Promise<void>;
    lastPopulationIndex(subProblemIndex: number): number;
    renderSubProblem(subProblemIndex: number, useProblemAsHeader?: boolean): string;
    renderSubProblemSimple(subProblemIndex: number): string;
    getActiveSolutionsLastPopulation(subProblemIndex: number): IEngineSolution[];
    getActiveSolutionsFromPopulation(subProblemIndex: number, populationIndex: number): IEngineSolution[];
    numberOfPopulations(subProblemIndex: number): number;
    renderSubProblems(): string;
    renderEntity(subProblemIndex: number, entityIndex: number): string;
    renderProblemStatement(): string;
    renderProblemStatementSubProblemsAndEntities(index: number): string;
    renderEntityPosNegReasons(item: IEngineAffectedEntity): string;
}
//# sourceMappingURL=baseProcessor.d.ts.map