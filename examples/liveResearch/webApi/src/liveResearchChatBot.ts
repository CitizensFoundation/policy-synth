import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import WebSocket from "ws";

const DEBUGGING = true;

import { PsBaseChatBot } from "@policysynth/api";

export class LiveResearchChatBot extends PsBaseChatBot {
  jsonWebPageResearchSchema = `
    {
      shortSummary: string,
      mostRelevantParagraphs: string[],
      typesOfPlantsMentioned: string[],
      authors: string,
      relevanceScore: number,
    }
  `

  async doLiveResearch(question: string) {
  }

  conversation = async (chatLog: PsSimpleChatLog[]) => {
    let messages: any[] = chatLog.map((message: PsSimpleChatLog) => {
      return {
        role: message.sender,
        content: message.message,
      };
    });

    if (messages.length === 1) {
      this.doLiveResearch(messages[0].content);
    } else {
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

      const stream = await this.openaiClient.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages,
        max_tokens: 4000,
        temperature: 0.7,
        stream: true,
      });

      if (this.wsClients.get(this.clientId)) {
        this.streamWebSocketResponses(stream);
      } else {
        console.error(`WS Client ${this.clientId} not found`);
        // TODO: Implement this when available
        //stream.cancel();
      }
    }
  };
}
