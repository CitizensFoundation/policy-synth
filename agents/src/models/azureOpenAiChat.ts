
import { OpenAIClient, AzureKeyCredential, ChatRole } from "@azure/openai";
import { BaseChatModel } from "./baseChatModel";
import { encoding_for_model, TiktokenModel } from "tiktoken";

export class AzureOpenAiChat extends BaseChatModel {
  private client: OpenAIClient;
  private deploymentName: string;

  constructor(config: PSAzureModelConfig) {
    super(config.modelName || "gpt-4o", config.maxTokensOut || 4096);
    this.client = new OpenAIClient(config.endpoint, new AzureKeyCredential(config.apiKey));
    this.deploymentName = config.deploymentName;
  }

  async generate(
    messages: PsModelChatItem[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<any> {
    const chatMessages = messages.map((msg) => ({
      role: msg.role as ChatRole,
      content: msg.message,
    }));

    if (streaming) {
      const events = await this.client.streamChatCompletions(
        this.deploymentName,
        chatMessages,
        { maxTokens: this.maxTokensOut }
      );
      for await (const event of events) {
        for (const choice of event.choices) {
          const delta = choice.delta?.content;
          if (delta !== undefined && streamingCallback) {
            streamingCallback(delta);
          }
        }
      }
    } else {
      const result = await this.client.getChatCompletions(
        this.deploymentName,
        chatMessages,
        { maxTokens: this.maxTokensOut }
      );
      return result.choices.map((choice) => choice.message?.content).join("");
    }
  }

  async getNumTokensFromMessages(messages: PsModelChatItem[]): Promise<number> {
    const encoder = encoding_for_model(this.modelName as TiktokenModel);
    const chatMessages = messages.map((msg) => ({
      role: msg.role as ChatRole,
      content: msg.message,
    }));

    const tokenCounts = chatMessages.map(
      (msg) => encoder.encode(msg.content).length
    );
    return tokenCounts.reduce((acc, count) => acc + count, 0);
  }
}
