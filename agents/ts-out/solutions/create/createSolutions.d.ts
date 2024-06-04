import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class CreateSolutionsProcessor extends BaseProblemSolvingAgent {
    useLanguage: string | undefined;
    renderCreateSystemMessage(): SystemMessage;
    renderCreatePrompt(subProblemIndex: number, solutionsForInspiration: IEngineSolution[], alreadyCreatedSolutions?: string | undefined): Promise<(HumanMessage | SystemMessage)[]>;
    createSolutions(subProblemIndex: number, solutionsForInspiration: IEngineSolution[], alreadyCreatedSolutions?: string | undefined, stageName?: PsMemoryStageTypes): Promise<IEngineSolution[]>;
    countTokensForString(text: string): Promise<number>;
    getRandomSolutions(subProblemIndex: number, alreadyCreatedSolutions: string | undefined): IEngineSolution[];
    getRandomItemsFromArray<T>(array: T[], count: number): T[];
    getRandomItemFromArray<T>(array: T[], useTopN?: number | undefined): "" | T;
    createAllSeedSolutions(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSolutions.d.ts.map