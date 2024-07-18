import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { BaseChatModel } from "./baseChatModel.js";

export class GoogleGeminiChat extends BaseChatModel {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(config: PsAiModelConfig) {
    super(config.modelName || "gemini-pro", config.maxTokensOut || 4096);
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = this.client.getGenerativeModel({ model: this.modelName });
  }

  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function
  ) {
    const history = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.message }],
    }));

    //TODO: FIX
    /*if (streaming) {
      const stream = await this.model.generateContentStream({
        request: history,
        generationConfig: {
          maxOutputTokens: this.maxTokensOut,
        },
      });

      for await (const chunk of stream) {
        const chunkText = chunk.text();
        if (streamingCallback) {
          streamingCallback(chunkText);
        }
      }
      // Deal with tokenusage here
      return;
    } else {
      const result = await this.model.generateContent({
        history,
        generationConfig: {
          maxOutputTokens: this.maxTokensOut,
        },
      });

      const content = result.response.text();
      return {
        tokensIn: result.response.usageMetadata?.promptTokenCount ?? 0,
        tokensOut: result.response.usageMetadata?.candidatesTokenCount ?? 0,
        content,
      };
    }*/
    return undefined;
  }

  async getNumTokensFromMessages(messages: PsModelMessage[]): Promise<number> {
    const contents = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.message }],
    }));

    const { totalTokens } = await this.model.countTokens({ contents });
    return totalTokens;
  }
}

export default GoogleGeminiChat;
