import { HumanMessage, SystemMessage } from "langchain/schema";
import { CreateSolutionImagesProcessor } from "../../solutions/create/createImages.js";
export declare class CreateSubProblemImagesProcessor extends CreateSolutionImagesProcessor {
    renderCreatePrompt(subProblemIndex: number): Promise<(SystemMessage | HumanMessage)[]>;
    createSubProblemImages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSubProblemImages.d.ts.map