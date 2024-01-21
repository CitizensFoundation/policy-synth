import express from "express";
import WebSocket from "ws";

export abstract class BaseController {
  public router = express.Router();
  public wsClients = new Map<string, WebSocket>();
  public basePromptOverrides: Map<number, string> | undefined;

  constructor(wsClients: Map<string, WebSocket>) {
    this.wsClients = wsClients;
  }
}
