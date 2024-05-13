
import Anthropic from '@anthropic-ai/sdk';
import { BaseChatModel } from './baseChatModel';

export class ClaudeOpusChat extends BaseChatModel {
  private client: Anthropic;

  constructor(apiKey: string) {
    super();
    this.client = new Anthropic({ apiKey });
  }

  async generate(
    messages: PsModelChatItem[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<any> {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.message,
    }));

    if (streaming) {
      const stream = await this.client.messages.create({
        max_tokens: 1024,
        messages: formattedMessages,
        model: 'claude-3-opus-20240229',
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
        model: 'claude-3-opus-20240229',
      });

      return response;
    }
  }

  async getNumTokensFromMessages(messages: PsModelChatItem[]): Promise<number> {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.message,
    }));

    // Assuming a token counting logic here, as the SDK does not provide a direct method for this
    const tokenCount = formattedMessages.reduce((acc, msg) => acc + msg.content.split(' ').length, 0);
    return Promise.resolve(tokenCount);
  }
}

export default ClaudeOpusChat;
