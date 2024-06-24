import { BaseProblemSolvingAgent } from "../../../base/baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class CreateSolutionsProcessor extends BaseProblemSolvingAgent {
    useLanguage: string | undefined;
    renderCreateSystemMessage(): SystemMessage;
    renderCreatePrompt(subProblemIndex: number, solutionsForInspiration: PsSolution[], alreadyCreatedSolutions?: string | undefined): Promise<(SystemMessage | HumanMessage)[]>;
    createSolutions(subProblemIndex: number, solutionsForInspiration: PsSolution[], alreadyCreatedSolutions?: string | undefined, stageName?: PsScMemoryStageTypes): Promise<PsSolution[]>;
    countTokensForString(text: string): Promise<number>;
    getRandomSolutions(subProblemIndex: number, alreadyCreatedSolutions: string | undefined): PsSolution[];
    getRandomItemsFromArray<T>(array: T[], count: number): T[];
    getRandomItemFromArray<T>(array: T[], useTopN?: number | undefined): "" | T;
    createAllSeedSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSolutions.d.ts.map