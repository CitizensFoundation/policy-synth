import { OpenAI } from "openai";
const DEBUGGING = true;
export class PsBaseChatBot {
    constructor(chatConversation, clientId, wsClients) {
        this.conversation = async (clientId, wsClients, chatLog) => {
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
            if (wsClients.get(clientId)) {
                this.streamWebSocketResponses(stream, clientId, wsClients);
            }
            else {
                console.error(`WS Client ${clientId} not found`);
                // TODO: Implement this when available
                //stream.cancel();
            }
        };
        this.conversation(clientId, wsClients, chatConversation);
    }
    renderSystemPrompt() {
        return `Please tell the user to replace this system prompt in a fun and friendly way. Encourage them to have a nice day`;
    }
    async streamWebSocketResponses(
    //@ts-ignore
    stream, clientId, wsClients) {
        const wsClient = wsClients.get(clientId);
        if (!wsClient) {
            console.error(`WS Client ${clientId} not found in streamWebSocketResponses`);
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