import { CreateSolutionImagesAgent } from "../../solutions/create/createImages.js";
export declare class CreatePolicyImagesAgent extends CreateSolutionImagesAgent {
    renderCreatePolicyImagePrompt(subProblemIndex: number, policy: PSPolicy, injectText?: string): Promise<PsModelMessage[]>;
    createPolicyImages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createPolicyImages.d.ts.map