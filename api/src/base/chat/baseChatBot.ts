import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";

import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { IEngineConstants } from "@policysynth/agents/constants.js";

//TODO: Use tiktoken
const WORDS_TO_TOKENS_MAGIC_CONSTANT = 1.3;

//@ts-ignore
const redis = new ioredis.default(
  process.env.REDIS_MEMORY_URL || "redis://localhost:6379"
);

export class PsBaseChatBot {
  clientId: string;
  clientSocket: WebSocket;
  openaiClient: OpenAI;
  memory!: PsChatBotMemoryData;
  currentAgent: PolicySynthAgentBase | undefined;
  broadcastingLiveCosts = false;
  liveCostsBroadcastTimeout: NodeJS.Timeout | undefined = undefined;
  liveCostsBroadcastInterval = 1000;
  liveCostsInactivityTimeout = 1000 * 60 * 10;
  liveCostsBoadcastStartAt: Date | undefined;
  lastSentToUserAt: Date | undefined;
  lastBroacastedCosts: number | undefined;
  redisMemoryKey = "chatbot-memory";
  tempeture = 0.7;
  maxTokens = 4000;
  llmModel = "gpt-4-0125-preview";
  persistMemory = false;

  loadMemory(id: string) {
    return new Promise<PsChatBotMemoryData>(async (resolve, reject) => {
      try {
        const memoryString = await redis.get(`${this.redisMemoryKey}-${id}`);
        if (memoryString) {
          const memory = JSON.parse(memoryString);
          resolve(memory);
        } else {
          resolve(this.getEmptyMemory());
        }
      } catch (error) {
        console.error("Can't load memory from redis", error);
        resolve(this.getEmptyMemory());
      }
    });
  }

  constructor(
    clientId: string,
    wsClients: Map<string, WebSocket>,
    memoryId: string | undefined = undefined
  ) {
    this.clientId = clientId;
    this.clientSocket = wsClients.get(this.clientId)!;
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    if (!this.clientSocket) {
      console.error(
        `WS Client ${this.clientId} not found in streamWebSocketResponses`
      );
    }
    this.setupMemory(memoryId);
  }

  async setupMemory(memoryId: string | undefined = undefined) {
    if (memoryId) {
      this.memory = await this.loadMemory(memoryId);
    }
    this.memory = this.getEmptyMemory();
  }

  async saveMemory() {
    if (this.memory) {
      try {
        await redis.set(this.memory.redisKey, JSON.stringify(this.memory));
      } catch (error) {
        console.log("Can't save memory to redis", error);
      }
    } else {
      console.error("Memory is not initialized");
    }
  }

  renderSystemPrompt() {
    return `Please tell the user to replace this system prompt in a fun and friendly way. Encourage them to have a nice day. Lots of emojis`;
  }

  sendToClient(sender: string, message: string, type = "stream") {
    this.clientSocket.send(
      JSON.stringify({
        sender,
        type: type,
        message,
      })
    );
    this.lastSentToUserAt = new Date();
  }

  sendAgentStart(name: string, hasNoStreaming = true) {
    const botMessage = {
      sender: "bot",
      type: "agentStart",
      message: {
        name: name,
        noStreaming: hasNoStreaming,
      } as PsAgentStartWsOptions,
    };
    this.clientSocket.send(JSON.stringify(botMessage));
  }

  sendAgentCompleted(
    name: string,
    lastAgent = false,
    error: string | undefined = undefined
  ) {
    const botMessage = {
      sender: "bot",
      type: "agentCompleted",
      message: {
        name: name,
        results: {
          isValid: true,
          validationErrors: error,
          lastAgent: lastAgent,
        } as PsValidationAgentResult,
      } as PsAgentCompletedWsOptions,
    };

    this.clientSocket.send(JSON.stringify(botMessage));
  }

  sendAgentUpdate(message: string) {
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
        if (
          this.lastBroacastedCosts != this.currentAgent.fullLLMCostsForMemory
        ) {
          console.log(
            `Broadcasting live costs: ${this.currentAgent.fullLLMCostsForMemory}`
          );
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

      if (
        timePassedSinceBroadcastStartActivity < this.liveCostsInactivityTimeout
      ) {
        this.liveCostsBroadcastTimeout = setTimeout(() => {
          this.broadCastLiveCosts();
        }, this.liveCostsBroadcastInterval);
      }
    } else {
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
      } as IEngineInnovationStagesData,
    } as Record<PSChatBotStageTypes, IEngineInnovationStagesData>;
  }

  getEmptyMemory() {
    return {
      redisKey: `${this.redisMemoryKey}-${uuidv4()}`,
      currentStage: "chatbot-conversation",
      stages: {
        ...PolicySynthAgentBase.emptyDefaultStages,
        ...this.emptyChatBotStagesData,
      },
      timeStart: Date.now(),
      chatLog: []
    } as PsChatBotMemoryData;
  }

  async streamWebSocketResponses(
    //@ts-ignore
    stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
  ) {
    return new Promise<void>(async (resolve, reject) => {
      this.sendToClient("bot", "", "start");
      try {
        for await (const part of stream) {
          this.sendToClient("bot", part.choices[0].delta.content!);
          this.addToExternalSolutionsMemoryCosts(
            part.choices[0].delta.content!,
            "out"
          );
          console.log(JSON.stringify(part, null, 2));
          // chatLog.push({})
        }
      } catch (error) {
        console.error(error);
        this.sendToClient(
          "bot",
          "There has been an error, please retry",
          "error"
        );
        reject();
      } finally {
        this.sendToClient("bot", "", "end");
      }
      resolve();
    });
  }

  getTokenCosts(estimateTokens: number, type: "in" | "out") {
    if (type == "in") {
      return (
        IEngineConstants.analyseExternalSolutionsModel.inTokenCostUSD *
        estimateTokens
      );
    } else {
      return (
        IEngineConstants.analyseExternalSolutionsModel.outTokenCostUSD *
        estimateTokens
      );
    }
  }

  addToExternalSolutionsMemoryCosts(text: string, type: "in" | "out") {
    if (text) {
      const parts = text.split(" ").filter((part) => part != "");
      const estimateTokens = parts.length * WORDS_TO_TOKENS_MAGIC_CONSTANT;

      if (this.currentAgent && this.currentAgent.memory) {
        if (type == "in") {
          if (
            this.memory.stages["chatbot-conversation"].tokensInCost ===
              undefined ||
            this.memory.stages["chatbot-conversation"].tokensIn === undefined
          ) {
            this.memory.stages["chatbot-conversation"].tokensInCost = 0;
            this.memory.stages["chatbot-conversation"].tokensIn = 0;
          }
          this.memory.stages["chatbot-conversation"].tokensIn += estimateTokens;
          this.memory.stages["chatbot-conversation"].tokensInCost +=
            this.getTokenCosts(estimateTokens, type);
        } else {
          if (
            this.memory.stages["chatbot-conversation"].tokensOutCost ===
              undefined ||
            this.memory.stages["chatbot-conversation"].tokensOut === undefined
          ) {
            this.memory.stages["chatbot-conversation"].tokensOutCost = 0;
            this.memory.stages["chatbot-conversation"].tokensOut = 0;
          }
          this.memory.stages["chatbot-conversation"].tokensOut +=
            estimateTokens;
          this.memory.stages["chatbot-conversation"].tokensOutCost +=
            this.getTokenCosts(estimateTokens, type);
        }
      } else {
        console.warn(
          `No current agent or memory found to add external solutions costs`
        );
      }
    } else {
      console.warn(`No text found to add external solutions costs`);
    }
  }

  conversation = async (chatLog: PsSimpleChatLog[]) => {
    this.memory.chatLog = chatLog;

    if (this.persistMemory) {
      await this.saveMemory();
    }

    let messages: any[] = chatLog.map((message: PsSimpleChatLog) => {
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
