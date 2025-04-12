import { GenerativeModel as GoogleAiGenerativeModel } from "@google/generative-ai";
import { GenerativeModel as VertexAiGenerativeModel } from "@google-cloud/vertexai";
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
    generate(messages: PsModelMessage[], streaming?: boolean, streamingCallback?: (chunk: string) => void): Promise<{
        tokensIn: number;
        tokensOut: number;
        content: string;
    }>;
}
//# sourceMappingURL=googleGeminiChat.d.ts.map