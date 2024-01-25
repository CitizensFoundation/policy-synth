import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
import { PolicySynthAgentBase } from "@policysynth/agents";

const DEBUGGING = true;

export class PsBaseChatBot {
  clientId: string;
  clientSocket: WebSocket;
  openaiClient: OpenAI;
  memory!: IEngineInnovationMemoryData;
  currentAgent: PolicySynthAgentBase | undefined;
  broadcastingLiveCosts = false;
  liveCostsBroadcastTimeout: NodeJS.Timeout | undefined = undefined;
  liveCostsBroadcastInterval = 1000;
  liveCostsInactivityTimeout = 1000 * 60 * 10;
  liveCostsBoadcastStartAt: Date | undefined;
  lastSentToUserAt: Date | undefined;

  constructor(clientId: string, wsClients: Map<string, WebSocket>) {
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
    this.memory = this.getEmptyMemory();
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

    this.broadcastingLiveCosts = true;
  }

  broadCastLiveCosts() {
    if (this.broadcastingLiveCosts) {
      if (this.currentAgent) {
        const botMessage = {
          sender: "bot",
          type: "liveLlmCosts",
          message: this.currentAgent.fullLLMCostsForMemory,
        };
        this.clientSocket.send(JSON.stringify(botMessage));
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
    } as IEngineInnovationMemoryData;
  }

  async streamWebSocketResponses(
    //@ts-ignore
    stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
  ) {
    this.sendToClient("bot", "", "start");
    for await (const part of stream) {
      this.sendToClient("bot", part.choices[0].delta.content!);
    }
    this.sendToClient("bot", "", "end");
  }

  conversation = async (chatLog: PsSimpleChatLog[]) => {
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
}
