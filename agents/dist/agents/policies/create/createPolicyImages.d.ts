import { SystemMessage, HumanMessage } from "langchain/schema";
import { CreateSolutionImagesProcessor } from "../../solutions/create/createImages.js";
export declare class CreatePolicyImagesProcessor extends CreateSolutionImagesProcessor {
    renderCreatePolicyImagePrompt(subProblemIndex: number, policy: PSPolicy, injectText?: string): Promise<(HumanMessage | SystemMessage)[]>;
    createPolicyImages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createPolicyImages.d.ts.map