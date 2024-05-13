
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BaseChatModel } from "./baseChatModel";

export class GoogleGeminiChat extends BaseChatModel {
  private client: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    super();
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: "gemini-pro" });
  }

  async generate(
    messages: PsModelChatItem[],
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
          maxOutputTokens: 1024,
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
          maxOutputTokens: 1024,
        },
      });

      return result.response.text();
    }
  }

  async getNumTokensFromMessages(messages: PsModelChatItem[]): Promise<number> {
    const contents = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.message }],
    }));

    const { totalTokens } = await this.model.countTokens({ contents });
    return totalTokens;
  }
}

export default GoogleGeminiChat;
