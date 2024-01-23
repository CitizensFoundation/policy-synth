import { OpenAI } from "openai";
const DEBUGGING = true;
export class PsBaseChatBot {
    constructor(clientId, wsClients) {
        this.conversation = async (chatLog) => {
            let messages = chatLog.map((message) => {
                return {
                    role: message.sender,
                    content: message.message,
                };
            });
            const systemMessage = {
                role: "system",
                content: this.renderSystemPrompt(),
            };
            messages.unshift(systemMessage);
            if (DEBUGGING) {
                console.log("=====================");
                console.log(JSON.stringify(messages, null, 2));
                console.log("=====================");
            }
            const stream = await this.openaiClient.chat.completions.create({
                model: "gpt-4-1106-preview",
                messages,
                max_tokens: 4000,
                temperature: 0.7,
                stream: true,
            });
            this.streamWebSocketResponses(stream);
        };
        this.clientId = clientId;
        this.clientSocket = wsClients.get(this.clientId);
        this.openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        if (!this.clientSocket) {
            console.error(`WS Client ${this.clientId} not found in streamWebSocketResponses`);
        }
    }
    renderSystemPrompt() {
        return `Please tell the user to replace this system prompt in a fun and friendly way. Encourage them to have a nice day. Lots of emojis`;
    }
    sendToClient(sender, message, type = "stream") {
        this.clientSocket.send(JSON.stringify({
            sender,
            type: type,
            message,
        }));
    }
    sendAgentStart(name, hasNoStreaming = true) {
        const botMessage = {
            sender: "bot",
            type: "agentStart",
            message: {
                name: name,
                noStreaming: hasNoStreaming,
            },
        };
        this.clientSocket.send(JSON.stringify(botMessage));
    }
    sendAgentCompleted(name, lastAgent = false, error = undefined) {
        const botMessage = {
            sender: "bot",
            type: "agentCompleted",
            message: {
                name: name,
                results: {
                    isValid: true,
                    validationErrors: error,
                    lastAgent: lastAgent,
                },
            },
        };
        this.clientSocket.send(JSON.stringify(botMessage));
    }
    async streamWebSocketResponses(
    //@ts-ignore
    stream) {
        this.sendToClient("bot", "", "start");
        for await (const part of stream) {
            this.sendToClient("bot", part.choices[0].delta.content);
        }
        this.sendToClient("bot", "", "end");
    }
}
//# sourceMappingURL=baseChatBot.js.map