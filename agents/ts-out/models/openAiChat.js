import OpenAI from 'openai';
import { BaseChatModel } from './baseChatModel';
export class OpenAiChat extends BaseChatModel {
    client;
    constructor(apiKey) {
        super();
        this.client = new OpenAI({ apiKey });
    }
    async generate(messages, streaming, streamingCallback) {
        const formattedMessages = messages.map((msg) => ({
            role: msg.role,
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
        }
        else {
            const response = await this.client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: formattedMessages,
            });
            return response.choices[0]?.message?.content;
        }
    }
    async getNumTokensFromMessages(messages) {
        const formattedMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.message,
        }));
        const response = await this.client.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: formattedMessages,
        });
        return response.usage?.total_tokens || 0;
    }
}
export default OpenAiChat;
//# sourceMappingURL=openAiChat.js.map