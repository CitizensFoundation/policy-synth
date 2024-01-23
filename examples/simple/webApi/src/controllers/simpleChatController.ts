import { BaseController } from "@policysynth/api/dist/controllers/baseController.js";
import express from "express";
import WebSocket from "ws";
import { SimpleChatBot } from "../simpleChatBot.js";

export class SimpleChatController extends BaseController {
  public path = "/api/simple_chat";

  constructor(wsClients: Map<string, WebSocket>) {
    super(wsClients);
    this.initializeRoutes();
  }

  public async initializeRoutes() {
    this.router.put(this.path+"/", this.simpleChat);
  }

  simpleChat = async (req: express.Request, res: express.Response) => {
    const chatLog = req.body.chatLog;
    const wsClientId = req.body.wsClientId;

    try {
      new SimpleChatBot(
        chatLog,
        wsClientId,
        this.wsClients
      );
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }

    console.log(`SimpleChatController for id ${wsClientId} initialized`);

    res.sendStatus(200);
  };
}
