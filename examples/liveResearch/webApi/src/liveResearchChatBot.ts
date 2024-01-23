import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";

const DEBUGGING = true;

import { PsBaseChatBot } from '@policysynth/api';

export class LiveResearchChatBot extends PsBaseChatBot {
  openaiClient: OpenAI;

  constructor(
    chatlog: PsSimpleChatLog[],
    clientId: string,
    wsClients: Map<string, WebSocket>) {
    super(chatlog, clientId, wsClients);
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  conversation = async (
    chatLog: PsSimpleChatLog[],
  ) => {
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
      this.streamWebSocketResponses(
        stream
      );
    } else {
      console.error(`WS Client ${this.clientId} not found`);
      // TODO: Implement this when available
      //stream.cancel();
    }
  };
}
