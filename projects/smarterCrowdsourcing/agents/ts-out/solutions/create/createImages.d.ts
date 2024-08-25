import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";
export declare class CreateSolutionImagesAgent extends SolutionsEvolutionSmarterCrowdsourcingAgent {
    cloudflareProxy: string;
    downloadImage(imageUrl: string, imageFilePath: string): Promise<unknown>;
    downloadStabilityImage(subProblemIndex: number, imagePrompt: string, imageFilePath: string, solutionOrPolicy?: PsSolution | PSPolicy | undefined, stylePreset?: "digital-art" | "low-poly" | "pixel-art" | "sketch"): Promise<boolean>;
    uploadImageToS3(bucket: string, filePath: string, key: string): Promise<unknown>;
    staticSecondaryColors: string[];
    get randomSecondaryColor(): string;
    staticColors: string[];
    getSubProblemColor(subProblemIndex: number): string | {
        Default: 0;
        White: 16777215;
        Aqua: 1752220;
        Green: 5763719;
        Blue: 3447003;
        Yellow: 16705372;
        Purple: 10181046;
        LuminousVividPink: 15277667;
        Fuchsia: 15418782;
        Gold: 15844367;
        Orange: 15105570;
        Red: 15548997;
        Grey: 9807270;
        Navy: 3426654;
        DarkAqua: 1146986;
        DarkGreen: 2067276;
        DarkBlue: 2123412;
        DarkPurple: 7419530;
        DarkVividPink: 11342935;
        DarkGold: 12745742;
        DarkOrange: 11027200;
        DarkRed: 10038562;
        DarkGrey: 9936031;
        DarkerGrey: 8359053;
        LightGrey: 12370112;
        DarkNavy: 2899536;
        Blurple: 5793266;
        Greyple: 10070709;
        DarkButNotBlack: 2895667;
        NotQuiteBlack: 2303786;
    };
    renderCreatePrompt(subProblemIndex: number, solution: PsSolution | PSPolicy, injectText?: string): Promise<PsModelMessage[]>;
    getImageUrlFromPrompt(prompt: string, quality?: "hd" | "standard" | undefined): Promise<any>;
    getDalleImagePrompt(subProblemIndex?: number | undefined, solution?: PsSolution | undefined): string;
    createImages(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=createImages.d.ts.map