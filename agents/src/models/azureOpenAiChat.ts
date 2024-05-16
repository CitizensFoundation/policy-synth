
import { OpenAIClient, AzureKeyCredential, ChatRole } from '@azure/openai';
import { BaseChatModel } from './baseChatModel';

export class AzureOpenAiChat extends BaseChatModel {
  private client: OpenAIClient;
  private deploymentName: string;

  constructor(endpoint: string, apiKey: string, deploymentName: string) {
    super();
    this.client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
    this.deploymentName = deploymentName;
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
      const events = await this.client.streamChatCompletions(this.deploymentName, chatMessages, { maxTokens: 128 });
      for await (const event of events) {
        for (const choice of event.choices) {
          const delta = choice.delta?.content;
          if (delta !== undefined && streamingCallback) {
            streamingCallback(delta);
          }
        }
      }
    } else {
      const result = await this.client.getChatCompletions(this.deploymentName, chatMessages, { maxTokens: 128 });
      return result.choices.map((choice) => choice.message?.content).join('');
    }
  }

  async getNumTokensFromMessages(messages: PsModelChatItem[]): Promise<number> {
    const chatMessages = messages.map((msg) => ({
      role: msg.role as ChatRole,
      content: msg.message,
    }));

    const result = await this.client.getCompletions(this.deploymentName, chatMessages.map((msg) => msg.content), { maxTokens: 1 });
    return result.usage.totalTokens;
  }
}
