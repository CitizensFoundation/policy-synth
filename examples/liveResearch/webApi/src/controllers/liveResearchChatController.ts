import { BaseController } from "@policysynth/api/dist/controllers/baseController.js";
import express from "express";
import WebSocket from "ws";
import { LiveResearchChatBot } from "../liveResearchChatBot.js";

export class LiveResearchChatController extends BaseController {
  public path = "/api/live_research_chat";

  constructor(wsClients: Map<string, WebSocket>) {
    super(wsClients);
    this.initializeRoutes();
  }

  public async initializeRoutes() {
    this.router.put(this.path + "/", this.liveResearchChat);
  }

  liveResearchChat = async (req: express.Request, res: express.Response) => {
    const chatLog = req.body.chatLog;
    const wsClientId = req.body.wsClientId;
    const numberOfSelectQueries = req.body.numberOfSelectQueries;
    const percentOfTopQueriesToSearch = req.body.percentOfTopQueriesToSearch;
    const percentOfTopResultsToScan = req.body.percentOfTopResultsToScan;

    try {
      const bot = new LiveResearchChatBot(wsClientId, this.wsClients);
      bot.researchConversation(
        chatLog,
        numberOfSelectQueries,
        percentOfTopQueriesToSearch,
        percentOfTopResultsToScan
      );
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }

    console.log(`LiveResearchChatController for id ${wsClientId} initialized`);

    res.sendStatus(200);
  };
}
