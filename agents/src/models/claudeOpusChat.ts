import Anthropic from "@anthropic-ai/sdk";
import { BaseChatModel } from "./baseChatModel";
import { encoding_for_model, TiktokenModel } from "tiktoken";

export class ClaudeOpusChat extends BaseChatModel {
  private client: Anthropic;

  constructor(apiKey: string, modelName: string = "claude-3-opus-20240229") {
    super(modelName);
    this.client = new Anthropic({ apiKey });
  }

  async generate(
    messages: PsModelChatItem[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<any> {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.message,
    }));

    if (streaming) {
      const stream = await this.client.messages.create({
        max_tokens: 1024,
        messages: formattedMessages,
        model: this.modelName,
        stream: true,
      });

      for await (const messageStreamEvent of stream) {
        if (streamingCallback) {
          streamingCallback(messageStreamEvent);
        }
      }
    } else {
      const response = await this.client.messages.create({
        max_tokens: 1024,
        messages: formattedMessages,
        model: this.modelName,
      });

      return response;
    }
  }

  async getNumTokensFromMessages(messages: PsModelChatItem[]): Promise<number> {
    const encoding = encoding_for_model("cl100k_base" as TiktokenModel);
    const formattedMessages = messages.map((msg) => msg.message).join(" ");
    const tokenCount = encoding.encode(formattedMessages).length;
    return Promise.resolve(tokenCount);
  }
}

export default ClaudeOpusChat;
