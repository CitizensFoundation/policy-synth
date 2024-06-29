import { CreateSolutionImagesAgent } from "../../solutions/create/createImages.js";
export declare class CreateSubProblemImagesAgent extends CreateSolutionImagesAgent {
    renderCreatePrompt(subProblemIndex: number): Promise<PsModelMessage[]>;
    getDalleImagePrompt(subProblemIndex: number): string;
    createSubProblemImages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createSubProblemImages.d.ts.map