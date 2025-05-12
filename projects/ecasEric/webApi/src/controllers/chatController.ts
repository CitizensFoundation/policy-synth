import { BaseController } from "@policysynth/api/controllers/baseController.js";
import express from "express";
import WebSocket from "ws";
import { EcasYeaChatBot } from "../chatbot/chatBot.js";

export class ChatController extends BaseController {
  public path = "/api/rd_chat";

  constructor(wsClients: Map<string, WebSocket>) {
    super(wsClients);
    this.initializeRoutes();
  }

  public async initializeRoutes() {
    this.router.put(this.path + "/", this.ecasYeaConversation);
    this.router.get(this.path + "/:memoryId", this.getChatLog);
  }

  private getChatLog = async (req: express.Request, res: express.Response) => {
    const memoryId = req.params.memoryId;
    let chatLog: PsSimpleChatLog[] | undefined;
    let totalCosts: number | undefined;

    try {
      if (memoryId) {
        const memory = await EcasYeaChatBot.loadMemoryFromRedis(memoryId);
        if (memory) {
          console.log(`memory loaded: ${JSON.stringify(memory, null, 2)}`)
          chatLog = memory.chatLog;
          totalCosts = 0;//EcasYeaChatBot.getFullCostOfMemory(memory);
        } else {
          console.log(`memory not found for id ${memoryId}`)
        }
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
    if (chatLog) {
      res.send({ chatLog, totalCosts });
    } else {
      res.sendStatus(404);
    }
  };

  ecasYeaConversation = async (req: express.Request, res: express.Response) => {
    const chatLog = req.body.chatLog;
    const wsClientId = req.body.wsClientId;
    const memoryId = req.body.memoryId;
    const topicId = req.body.topicId;
    let saveChatLog: PsSimpleChatLog[] | undefined;

    console.log(`ecasYeaConversation chatLog: ${JSON.stringify(chatLog, null, 2)}`);
    console.log(`ecasYeaConversation topicId: ${topicId}`);

    if (!wsClientId) {
      res.status(400).send("wsClientId is required");
      return;
    }

    if (topicId !== undefined && typeof topicId !== 'number') {
       res.status(400).send("Invalid topicId format, must be a number");
       return;
    }

    try {
      const bot = new EcasYeaChatBot(wsClientId, this.wsClients, memoryId, topicId);
      if (memoryId) {
        const memory = await bot.getLoadedMemory();
        if (memory) {
          saveChatLog = memory.chatLog;
        }
      }
      bot.ecasYeaConversation(
        chatLog
      );
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    console.log(
      `ChatController for id ${wsClientId} initialized chatLog of length ${chatLog?.length} for topic ${topicId}`
    );

    if (saveChatLog) {
      res.status(200).send({ chatLog: saveChatLog });
    } else {
      res.sendStatus(200);
    }
  };
}
