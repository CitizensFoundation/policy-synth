import { CreateSolutionImagesAgent } from "../../solutions/create/createImages.js";
export declare class CreateProblemStatementImageAgent extends CreateSolutionImagesAgent {
    renderCreatePrompt(subProblemIndex?: number): Promise<PsModelMessage[]>;
    getDalleImagePrompt(): string;
    createProblemStatementImage(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createProblemStatementImage.d.ts.map