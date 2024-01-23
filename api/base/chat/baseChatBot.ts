import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";

const DEBUGGING = true;

export class PsBaseChatBot {
  clientId: string;
  clientSocket: WebSocket;
  openaiClient: OpenAI;

  constructor(
    clientId: string,
    wsClients: Map<string, WebSocket>
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
