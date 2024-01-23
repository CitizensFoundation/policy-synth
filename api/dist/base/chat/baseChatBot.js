import { OpenAI } from "openai";
const DEBUGGING = true;
export class PsBaseChatBot {
    constructor(chatLog, clientId, wsClients) {
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
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
            if (DEBUGGING) {
                console.log("=====================");
                console.log(JSON.stringify(messages, null, 2));
                console.log("=====================");
            }
            const stream = await openai.chat.completions.create({
                model: "gpt-4-1106-preview",
                messages,
                max_tokens: 4000,
                temperature: 0.7,
                stream: true,
            });
            if (this.wsClients.get(this.clientId)) {
                this.streamWebSocketResponses(stream);
            }
            else {
                console.error(`WS Client ${this.clientId} not found`);
                // TODO: Implement this when available
                //stream.cancel();
            }
        };
        this.clientId = clientId;
        this.wsClients = wsClients;
        this.conversation(chatLog);
    }
    renderSystemPrompt() {
        return `Please tell the user to replace this system prompt in a fun and friendly way. Encourage them to have a nice day. Lots of emojis`;
    }
    async streamWebSocketResponses(
    //@ts-ignore
    stream) {
        const wsClient = this.wsClients.get(this.clientId);
        if (!wsClient) {
            console.error(`WS Client ${this.clientId} not found in streamWebSocketResponses`);
            return;
        }
        wsClient.send(JSON.stringify({ sender: "bot", type: "start" }));
        for await (const part of stream) {
            wsClient.send(JSON.stringify({
                sender: "bot",
                type: "stream",
                message: part.choices[0].delta.content,
            }));
            //console.log(part.choices[0].delta);
        }
        wsClient.send(JSON.stringify({
            sender: "bot",
            type: "end",
        }));
    }
}
//# sourceMappingURL=baseChatBot.js.map