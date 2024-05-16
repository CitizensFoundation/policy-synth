
import OpenAI from 'openai';
import { BaseChatModel } from './baseChatModel';
import { get_encoding, TiktokenEncoding } from 'tiktoken';

export class OpenAiChat extends BaseChatModel {
  private client: OpenAI;

  constructor(apiKey: string) {
    super();
    this.client = new OpenAI({ apiKey });
  }

  async generate(
    messages: PsModelChatItem[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<any> {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.message,
    }));

    if (streaming) {
      const stream = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: formattedMessages,
        stream: true,
      });

      for await (const chunk of stream) {
        if (streamingCallback) {
          streamingCallback(chunk.choices[0]?.delta?.content || '');
        }
      }
    } else {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: formattedMessages,
      });

      return response.choices[0]?.message?.content;
    }
  }

  async getNumTokensFromMessages(messages: PsModelChatItem[]): Promise<number> {
    const encoding = get_encoding('cl100k_base' as TiktokenEncoding);
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.message,
    }));

    const tokenCounts = formattedMessages.map((msg) => encoding.encode(msg.content).length);
    return tokenCounts.reduce((acc, count) => acc + count, 0);
  }
}

export default OpenAiChat;
