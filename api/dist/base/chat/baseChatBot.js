import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";
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
        this.memory = this.getEmptyMemory();
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
    sendAgentUpdate(message) {
        const botMessage = {
            sender: "bot",
            type: "agentUpdated",
            message: message,
        };
        this.clientSocket.send(JSON.stringify(botMessage));
    }
    getEmptyMemory() {
        return {
            redisKey: `webResearch-${uuidv4}`,
            groupId: 1,
            communityId: 2,
            domainId: 1,
            stage: "create-sub-problems",
            currentStage: "create-sub-problems",
            stages: {
                "create-root-causes-search-queries": {},
                "web-search-root-causes": {},
                "web-get-root-causes-pages": {},
                "rank-web-root-causes": {},
                "rate-web-root-causes": {},
                "web-get-refined-root-causes": {},
                "get-metadata-for-top-root-causes": {},
                "create-problem-statement-image": {},
                "create-sub-problems": {},
                "rank-sub-problems": {},
                "policies-seed": {},
                "policies-create-images": {},
                "create-entities": {},
                "rank-entities": {},
                "reduce-sub-problems": {},
                "create-search-queries": {},
                "rank-root-causes-search-results": {},
                "rank-root-causes-search-queries": {},
                "create-sub-problem-images": {},
                "rank-search-queries": {},
                "web-search": {},
                "rank-web-solutions": {},
                "rate-solutions": {},
                "rank-search-results": {},
                "web-get-pages": {},
                "create-seed-solutions": {},
                "create-pros-cons": {},
                "create-solution-images": {},
                "rank-pros-cons": {},
                "rank-solutions": {},
                "group-solutions": {},
                "evolve-create-population": {},
                "evolve-mutate-population": {},
                "evolve-recombine-population": {},
                "evolve-reap-population": {},
                "topic-map-solutions": {},
                "evolve-rank-population": {},
                "analyse-external-solutions": {},
                "create-evidence-search-queries": {},
                "web-get-evidence-pages": {},
                "web-search-evidence": {},
                "rank-web-evidence": {},
                "rate-web-evidence": {},
                "web-get-refined-evidence": {},
                "get-metadata-for-top-evidence": {},
                "validation-agent": {},
            },
            timeStart: Date.now(),
            totalCost: 0,
            customInstructions: {},
            problemStatement: {
                description: "problemStatement",
                searchQueries: {
                    general: [],
                    scientific: [],
                    news: [],
                    openData: [],
                },
                searchResults: {
                    pages: {
                        general: [],
                        scientific: [],
                        news: [],
                        openData: [],
                    },
                },
            },
            subProblems: [],
            currentStageData: undefined,
        };
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