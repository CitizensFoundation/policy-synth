
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseChatModel } from "./baseChatModel.js";

export class GoogleGeminiChat extends BaseChatModel {
  private client: GoogleGenerativeAI;
  private model: any;

  constructor(config: PsAiModelConfig) {
    super(config.modelName || "gemini-pro", config.maxTokensOut || 4096);
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = this.client.getGenerativeModel({ model: this.modelName });
  }

  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<any> {
    const history = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.message }],
    }));

    if (streaming) {
      const stream = await this.model.generateContentStream({
        history,
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

      return;
    } else {
      const result = await this.model.generateContent({
        history,
        generationConfig: {
          maxOutputTokens: this.maxTokensOut,
        },
      });

      return result.response.text();
    }
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
