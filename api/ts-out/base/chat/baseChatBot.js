import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";
import { IEngineConstants } from "@policysynth/agents/constants.js";
const DEBUGGING = true;
//TODO: Use tiktoken
const WORDS_TO_TOKENS_MAGIC_CONSTANT = 1.3;
export class PsBaseChatBot {
    constructor(clientId, wsClients) {
        this.broadcastingLiveCosts = false;
        this.liveCostsBroadcastTimeout = undefined;
        this.liveCostsBroadcastInterval = 1000;
        this.liveCostsInactivityTimeout = 1000 * 60 * 10;
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
                model: "gpt-4-0125-preview",
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
        this.lastSentToUserAt = new Date();
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
    startBroadcastingLiveCosts() {
        this.stopBroadcastingLiveCosts();
        this.liveCostsBoadcastStartAt = new Date();
        this.lastBroacastedCosts = undefined;
        this.broadcastingLiveCosts = true;
        this.broadCastLiveCosts();
    }
    broadCastLiveCosts() {
        if (this.broadcastingLiveCosts) {
            if (this.currentAgent && this.currentAgent.fullLLMCostsForMemory) {
                if (this.lastBroacastedCosts != this.currentAgent.fullLLMCostsForMemory) {
                    console.log(`Broadcasting live costs: ${this.currentAgent.fullLLMCostsForMemory}`);
                    const botMessage = {
                        sender: "bot",
                        type: "liveLlmCosts",
                        message: this.currentAgent.fullLLMCostsForMemory,
                    };
                    this.clientSocket.send(JSON.stringify(botMessage));
                    this.lastBroacastedCosts = this.currentAgent.fullLLMCostsForMemory;
                }
            }
            let timePassedSinceBroadcastStartActivity = 0;
            if (this.liveCostsBoadcastStartAt && this.lastSentToUserAt) {
                timePassedSinceBroadcastStartActivity =
                    this.lastSentToUserAt.getTime() -
                        this.liveCostsBoadcastStartAt.getTime();
            }
            if (timePassedSinceBroadcastStartActivity < this.liveCostsInactivityTimeout) {
                this.liveCostsBroadcastTimeout = setTimeout(() => {
                    this.broadCastLiveCosts();
                }, this.liveCostsBroadcastInterval);
            }
        }
        else {
            this.stopBroadcastingLiveCosts();
        }
    }
    stopBroadcastingLiveCosts() {
        if (this.liveCostsBroadcastTimeout) {
            clearTimeout(this.liveCostsBroadcastTimeout);
        }
        this.broadcastingLiveCosts = false;
        console.log("Stopped broadcasting live costs");
    }
    getEmptyMemory() {
        return {
            redisKey: `webResearch-${uuidv4()}`,
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
        return new Promise(async (resolve, reject) => {
            this.sendToClient("bot", "", "start");
            try {
                for await (const part of stream) {
                    this.sendToClient("bot", part.choices[0].delta.content);
                    this.addToExternalSolutionsMemoryCosts(part.choices[0].delta.content, "out");
                }
            }
            catch (error) {
                console.error(error);
                this.sendToClient("bot", "There has been an error, please retry", "error");
                reject();
            }
            finally {
                this.sendToClient("bot", "", "end");
            }
            resolve();
        });
    }
    getTokenCosts(estimateTokens, type) {
        if (type == "in") {
            return (IEngineConstants.analyseExternalSolutionsModel.inTokenCostUSD *
                estimateTokens);
        }
        else {
            return (IEngineConstants.analyseExternalSolutionsModel.outTokenCostUSD *
                estimateTokens);
        }
    }
    addToExternalSolutionsMemoryCosts(text, type) {
        if (text) {
            const parts = text.split(" ").filter((part) => part != "");
            const estimateTokens = parts.length * WORDS_TO_TOKENS_MAGIC_CONSTANT;
            if (this.currentAgent && this.currentAgent.memory) {
                if (type == "in") {
                    if (this.memory.stages["analyse-external-solutions"].tokensInCost ===
                        undefined ||
                        this.memory.stages["analyse-external-solutions"].tokensIn ===
                            undefined) {
                        this.memory.stages["analyse-external-solutions"].tokensInCost = 0;
                        this.memory.stages["analyse-external-solutions"].tokensIn = 0;
                    }
                    this.memory.stages["analyse-external-solutions"].tokensIn +=
                        estimateTokens;
                    this.memory.stages["analyse-external-solutions"].tokensInCost +=
                        this.getTokenCosts(estimateTokens, type);
                }
                else {
                    if (this.memory.stages["analyse-external-solutions"].tokensOutCost ===
                        undefined ||
                        this.memory.stages["analyse-external-solutions"].tokensOut ===
                            undefined) {
                        this.memory.stages["analyse-external-solutions"].tokensOutCost = 0;
                        this.memory.stages["analyse-external-solutions"].tokensOut = 0;
                    }
                    this.memory.stages["analyse-external-solutions"].tokensOut +=
                        estimateTokens;
                    this.memory.stages["analyse-external-solutions"].tokensOutCost +=
                        this.getTokenCosts(estimateTokens, type);
                }
            }
            else {
                console.warn(`No current agent or memory found to add external solutions costs`);
            }
        }
        else {
            console.warn(`No text found to add external solutions costs`);
        }
    }
}
//# sourceMappingURL=baseChatBot.js.map