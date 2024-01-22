import { BaseController } from "@policysynth/api/dist/controllers/baseController.js";
import express from "express";
import WebSocket from "ws";
import { BaseChatBot } from "../baseChatBot.js";

export class SimpleChatController extends BaseController {
  public path = "/api/simple_chat";

  constructor(wsClients: Map<string, WebSocket>) {
    super(wsClients);
    this.initializeRoutes();
  }

  public async initializeRoutes() {
    this.router.get(this.path, this.simpleChat);
  }

  simpleChat = async (req: express.Request, res: express.Response) => {
    const userQuestion = req.body.userQuestion;
    const chatConversation = req.body.chatConversation;
    const wsClientId = req.body.wsClientId;

    try {
      new BaseChatBot(
        userQuestion,
        chatConversation,
        wsClientId,
        this.wsClients
      );
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }

    console.log(`SimpleChatController: ${userQuestion}`);

    res.sendStatus(200);
  };
}
