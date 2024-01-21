import express from "express";
import WebSocket from "ws";

export abstract class BaseController {
  public router = express.Router();
  public wsClients = new Map<string, WebSocket>();
  public prompts: Map<number, string> | undefined;

  constructor(wsClients: Map<string, WebSocket>) {
    this.wsClients = wsClients;
    this.initializeRoutes();
  }

  public async initializeRoutes() {
    throw new Error("Method not implemented.");
  }
}
