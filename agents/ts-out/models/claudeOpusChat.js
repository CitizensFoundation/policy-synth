import Anthropic from '@anthropic-ai/sdk';
import { BaseChatModel } from './baseChatModel';
export class ClaudeOpusChat extends BaseChatModel {
    client;
    constructor(apiKey) {
        super();
        this.client = new Anthropic({ apiKey });
    }
    async generate(messages, streaming, streamingCallback) {
        const formattedMessages = messages.map((msg) => ({
            role: msg.role,
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
        }
        else {
            const response = await this.client.messages.create({
                max_tokens: 1024,
                messages: formattedMessages,
                model: 'claude-3-opus-20240229',
            });
            return response;
        }
    }
    async getNumTokensFromMessages(messages) {
        const formattedMessages = messages.map((msg) => ({
            role: msg.role,
            content: msg.message,
        }));
        // Assuming a token counting logic here, as the SDK does not provide a direct method for this
        const tokenCount = formattedMessages.reduce((acc, msg) => acc + msg.content.split(' ').length, 0);
        return Promise.resolve(tokenCount);
    }
}
export default ClaudeOpusChat;
//# sourceMappingURL=claudeOpusChat.js.map