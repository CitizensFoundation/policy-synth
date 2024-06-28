import { CreateSolutionImagesProcessor } from "../../solutions/create/createImages.js";
export declare class CreateSubProblemImagesProcessor extends CreateSolutionImagesProcessor {
    renderCreatePrompt(subProblemIndex: number): Promise<PsModelMessage[]>;
    getDalleImagePrompt(subProblemIndex: number): string;
    createSubProblemImages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSubProblemImages.d.ts.map