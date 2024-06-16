import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
export declare class CreateSolutionImagesProcessor extends BaseProblemSolvingAgent {
    cloudflareProxy: string;
    subProblemColors: string[];
    secondaryColors: string[];
    downloadImage(imageUrl: string, imageFilePath: string): Promise<unknown>;
    downloadStabilityImage(subProblemIndex: number, imagePrompt: string, imageFilePath: string, solutionOrPolicy?: PsSolution | PSPolicy | undefined, stylePreset?: "digital-art" | "low-poly" | "pixel-art" | "sketch"): Promise<boolean>;
    uploadImageToS3(bucket: string, filePath: string, key: string): Promise<unknown>;
    get randomSecondaryColor(): string;
    getSubProblemColor(subProblemIndex: number): string;
    renderCreatePrompt(subProblemIndex: number, solution: PsSolution | PSPolicy, injectText?: string): Promise<(HumanMessage | SystemMessage)[]>;
    getImageUrlFromPrompt(prompt: string): Promise<any>;
    getDalleImagePrompt(subProblemIndex?: number | undefined, solution?: PsSolution | undefined): string;
    createImages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createImages.d.ts.map