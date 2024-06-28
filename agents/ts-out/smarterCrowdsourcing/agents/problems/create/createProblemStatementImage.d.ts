import { CreateSolutionImagesProcessor } from "../../solutions/create/createImages.js";
export declare class CreateProblemStatementImageProcessor extends CreateSolutionImagesProcessor {
    renderCreatePrompt(subProblemIndex?: number): Promise<PsModelMessage[]>;
    getDalleImagePrompt(): string;
    createProblemStatementImage(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createProblemStatementImage.d.ts.map