import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { CreateSolutionImagesProcessor } from "../../solutions/create/createImages.js";
export declare class CreateSubProblemImagesProcessor extends CreateSolutionImagesProcessor {
    renderCreatePrompt(subProblemIndex: number): Promise<(HumanMessage | SystemMessage)[]>;
    createSubProblemImages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSubProblemImages.d.ts.map