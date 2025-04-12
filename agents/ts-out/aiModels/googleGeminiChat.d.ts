import { GenerativeModel as GoogleAiGenerativeModel, HarmBlockThreshold, HarmCategory as GenerativeHarmCategory } from "@google/generative-ai";
import { GenerativeModel as VertexAiGenerativeModel, HarmCategory as VertexHarmCategory } from "@google-cloud/vertexai";
import { BaseChatModel } from "./baseChatModel.js";
export declare class GoogleGeminiChat extends BaseChatModel {
    private useVertexAi;
    private googleAiClient?;
    private vertexAiClient?;
    modelName: string;
    vertexProjectId?: string;
    vertexLocation?: string;
    model: GoogleAiGenerativeModel | VertexAiGenerativeModel;
    constructor(config: PsAiModelConfig);
    private buildVertexContents;
    static vertexSafetySettingsBlockNone: {
        category: VertexHarmCategory;
        threshold: HarmBlockThreshold;
    }[];
    static generativeAiSafetySettingsBlockNone: {
        category: GenerativeHarmCategory;
        threshold: HarmBlockThreshold;
    }[];
    generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: (chunk: string) => void): Promise<{
        tokensIn: number;
        tokensOut: number;
        content: string;
    }>;
}
//# sourceMappingURL=googleGeminiChat.d.ts.map