import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";
import ioredis from "ioredis";
//TODO: Use tiktoken
const WORDS_TO_TOKENS_MAGIC_CONSTANT = 1.3;
//@ts-ignore
const redis = new ioredis.default(process.env.REDIS_AGENT_URL || "redis://localhost:6379");
export class PsBaseChatBot {
    wsClientId;
    wsClientSocket;
    openaiClient;
    memory;
    broadcastingLiveCosts = false;
    liveCostsBroadcastInterval = 1000;
    liveCostsInactivityTimeout = 1000 * 60 * 10;
    static redisMemoryKeyPrefix = "ps-chatbot-memory";
    tempeture = 0.7;
    maxTokens = 4000;
    llmModel = "gpt-4-0125-preview";
    persistMemory = false;
    memoryId = undefined;
    liveCostsBroadcastTimeout = undefined;
    liveCostsBoadcastStartAt;
    lastSentToUserAt;
    lastBroacastedCosts;
    get redisKey() {
        return `${PsBaseChatBot.redisMemoryKeyPrefix}-${this.memoryId}`;
    }
    static loadMemoryFromRedis(memoryId) {
        return new Promise(async (resolve, reject) => {
            try {
                const memoryString = await redis.get(`${PsBaseChatBot.redisMemoryKeyPrefix}-${memoryId}`);
                if (memoryString) {
                    const memory = JSON.parse(memoryString);
                    resolve(memory);
                }
                else {
                    resolve(undefined);
                }
            }
            catch (error) {
                console.error("Can't load memory from redis", error);
                resolve(undefined);
            }
        });
    }
    static getFullCostOfMemory(memory) {
        let totalCost = undefined;
        if (memory && memory.stages) {
            totalCost = 0;
            Object.values(memory.stages).forEach((stage) => {
                if (stage.tokensInCost && stage.tokensOutCost) {
                    totalCost += stage.tokensInCost + stage.tokensOutCost;
                }
            });
        }
        return totalCost;
    }
    loadMemory() {
        return new Promise(async (resolve, reject) => {
            try {
                const memoryString = await redis.get(this.redisKey);
                if (memoryString) {
                    const memory = JSON.parse(memoryString);
                    resolve(memory);
                }
                else {
                    resolve(this.getEmptyMemory());
                }
            }
            catch (error) {
                console.error("Can't load memory from redis", error);
                resolve(this.getEmptyMemory());
            }
        });
    }
    constructor(wsClientId, wsClients, memoryId = undefined) {
        this.wsClientId = wsClientId;
        this.wsClientSocket = wsClients.get(this.wsClientId);
        this.openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        if (!this.wsClientSocket) {
            console.error(`WS Client ${this.wsClientId} not found in streamWebSocketResponses`);
        }
        this.setupMemory(memoryId);
    }
    async setupMemory(memoryId = undefined) {
        if (memoryId) {
            this.memoryId = memoryId;
            this.memory = await this.loadMemory();
        }
        else {
            this.memoryId = uuidv4();
            this.memory = this.getEmptyMemory();
            if (this.wsClientSocket) {
                this.sendMemoryId();
            }
            else {
                console.error("No wsClientSocket found");
            }
        }
    }
    get fullLLMCostsForMemory() {
        if (this.memory && this.memory.stages) {
            return PsBaseChatBot.getFullCostOfMemory(this.memory);
        }
        else {
            return undefined;
        }
    }
    async getLoadedMemory() {
        return await this.loadMemory();
    }
    sendMemoryId() {
        const botMessage = {
            sender: "bot",
            type: "memoryIdCreated",
            data: this.memoryId,
        };
        if (this.wsClientSocket) {
            this.wsClientSocket.send(JSON.stringify(botMessage));
        }
        else {
            console.error("No wsClientSocket found");
        }
    }
    async saveMemory() {
        if (this.memory) {
            try {
                await redis.set(this.redisKey, JSON.stringify(this.memory));
                console.log(`Saved memory to redis: ${this.redisKey}`);
            }
            catch (error) {
                console.log("Can't save memory to redis", error);
            }
        }
        else {
            console.error("Memory is not initialized");
        }
    }
    renderSystemPrompt() {
        return `Please tell the user to replace this system prompt in a fun and friendly way. Encourage them to have a nice day. Lots of emojis`;
    }
    sendAgentStart(name, hasNoStreaming = true) {
        const botMessage = {
            sender: "bot",
            type: "agentStart",
            data: {
                name: name,
                noStreaming: hasNoStreaming,
            },
        };
        if (this.wsClientSocket) {
            this.wsClientSocket.send(JSON.stringify(botMessage));
        }
        else {
            console.error("No wsClientSocket found");
        }
    }
    sendAgentCompleted(name, lastAgent = false, error = undefined) {
        const botMessage = {
            sender: "bot",
            type: "agentCompleted",
            data: {
                name: name,
                results: {
                    isValid: true,
                    validationErrors: error,
                    lastAgent: lastAgent,
                },
            },
        };
        if (this.wsClientSocket) {
            this.wsClientSocket.send(JSON.stringify(botMessage));
        }
        else {
            console.error("No wsClientSocket found");
        }
    }
    sendAgentUpdate(message) {
        const botMessage = {
            sender: "bot",
            type: "agentUpdated",
            message: message,
        };
        if (this.wsClientSocket) {
            this.wsClientSocket.send(JSON.stringify(botMessage));
        }
        else {
            console.error("No wsClientSocket found");
        }
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
            if (this.memory) {
                if (this.lastBroacastedCosts != this.fullLLMCostsForMemory) {
                    console.log(`Broadcasting live costs: ${this.fullLLMCostsForMemory}`);
                    const botMessage = {
                        sender: "bot",
                        type: "liveLlmCosts",
                        data: this.fullLLMCostsForMemory,
                    };
                    if (this.wsClientSocket) {
                        this.wsClientSocket.send(JSON.stringify(botMessage));
                    }
                    else {
                        console.error("No wsClientSocket found");
                    }
                    this.lastBroacastedCosts = this.fullLLMCostsForMemory;
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
    get emptyChatBotStagesData() {
        return {
            "chatbot-conversation": {
                tokensInCost: 0,
                tokensOutCost: 0,
                tokensIn: 0,
                tokensOut: 0,
            },
        }; //TODO: Set a type here
    }
    getEmptyMemory() {
        return {
            redisKey: this.redisKey,
            currentStage: "chatbot-conversation",
            stages: {},
            timeStart: Date.now(),
            chatLog: [],
            groupId: 1,
            communityId: 1,
            domainId: 1,
            totalCost: 0,
            customInstructions: {},
            problemStatement: {
                description: "",
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
        };
    }
    sendToClient(sender, message, type = "stream") {
        this.wsClientSocket.send(JSON.stringify({
            sender,
            type: type,
            message,
        }));
        this.lastSentToUserAt = new Date();
    }
    async streamWebSocketResponses(
    //@ts-ignore
    stream) {
        return new Promise(async (resolve, reject) => {
            this.sendToClient("bot", "", "start");
            try {
                let botMessage = "";
                for await (const part of stream) {
                    this.sendToClient("bot", part.choices[0].delta.content);
                    botMessage += part.choices[0].delta.content;
                    this.addToExternalSolutionsMemoryCosts(part.choices[0].delta.content, "out");
                    if (part.choices[0].finish_reason == "stop") {
                        this.memory.chatLog.push({
                            sender: "bot",
                            message: botMessage,
                        });
                        await this.saveMemoryIfNeeded();
                    }
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
            return (3 / 1000000 * //TODO: Get this from model
                estimateTokens);
        }
        else {
            return (15 / 1000000 * //TODO: Get this from model
                estimateTokens);
        }
    }
    addToExternalSolutionsMemoryCosts(text, type) {
        if (text) {
            const parts = text.split(" ").filter((part) => part != "");
            const estimateTokens = parts.length * WORDS_TO_TOKENS_MAGIC_CONSTANT;
            if (this.memory) {
                if (type == "in") {
                    if (this.memory.stages["chatbot-conversation"].tokensInCost ===
                        undefined ||
                        this.memory.stages["chatbot-conversation"].tokensIn === undefined) {
                        this.memory.stages["chatbot-conversation"].tokensInCost = 0;
                        this.memory.stages["chatbot-conversation"].tokensIn = 0;
                    }
                    this.memory.stages["chatbot-conversation"].tokensIn += estimateTokens;
                    this.memory.stages["chatbot-conversation"].tokensInCost +=
                        this.getTokenCosts(estimateTokens, type);
                }
                else {
                    if (this.memory.stages["chatbot-conversation"].tokensOutCost ===
                        undefined ||
                        this.memory.stages["chatbot-conversation"].tokensOut === undefined) {
                        this.memory.stages["chatbot-conversation"].tokensOutCost = 0;
                        this.memory.stages["chatbot-conversation"].tokensOut = 0;
                    }
                    this.memory.stages["chatbot-conversation"].tokensOut +=
                        estimateTokens;
                    this.memory.stages["chatbot-conversation"].tokensOutCost +=
                        this.getTokenCosts(estimateTokens, type);
                }
            }
            else {
                console.warn(`No memory found to add external solutions costs`);
            }
        }
        else {
            console.warn(`No text found to add external solutions costs`);
        }
    }
    async saveMemoryIfNeeded() {
        if (this.persistMemory) {
            await this.saveMemory();
        }
    }
    async setChatLog(chatLog) {
        this.memory.chatLog = chatLog;
        await this.saveMemoryIfNeeded();
    }
    conversation = async (chatLog) => {
        this.setChatLog(chatLog);
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
        const stream = await this.openaiClient.chat.completions.create({
            model: this.llmModel,
            messages,
            max_tokens: this.maxTokens,
            temperature: this.tempeture,
            stream: true,
        });
        this.streamWebSocketResponses(stream);
    };
}
//# sourceMappingURL=baseChatBot.js.map