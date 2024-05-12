import { Project } from "ts-morph";
import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
export declare class PsEngineerProgrammingPlanningAgent extends PsEngineerBaseProgrammingAgent {
    planSystemPrompt(): string;
    getUserPlanPrompt(fileName: string, reviewLog: string): string;
    reviewSystemPrompt(): string;
    getUserReviewPrompt(fileName: string, codingPlan: string, reviewLog: string): string;
    getCodingPlan(fileName: string, otherFilesToKeepInContextContent: string | undefined, documentationFilesInContextContent: string | undefined, tsMorphProject: Project): Promise<string | undefined>;
}
//# sourceMappingURL=planningAgent.d.ts.map