
import OpenAI from "openai";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";

export class OpenAiChat extends BaseChatModel {
  private client: OpenAI;

  constructor(config: PsOpenAiModelConfig) {
    const { apiKey, modelName = "gpt-4o", maxTokensOut = 4096 } = config;
    super(modelName, maxTokensOut);
    this.client = new OpenAI({ apiKey });
  }

  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<any> {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.message,
    }));

    if (streaming) {
      const stream = await this.client.chat.completions.create({
        model: this.modelName,
        messages: formattedMessages,
        stream: true,
      });

      for await (const chunk of stream) {
        if (streamingCallback) {
          streamingCallback(chunk.choices[0]?.delta?.content || "");
        }
      }
    } else {
      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: formattedMessages,
      });

      return response.choices[0]?.message?.content;
    }
  }

  async getNumTokensFromMessages(messages: PsModelMessage[]): Promise<number> {
    const encoding = encoding_for_model(this.modelName as TiktokenModel);
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.message,
    }));

    const tokenCounts = formattedMessages.map(
      (msg) => encoding.encode(msg.content).length
    );
    return tokenCounts.reduce((acc, count) => acc + count, 0);
  }
}

export default OpenAiChat;
