import { PsBaseConnector } from "./baseConnector.js";
export abstract class PsBaseVotingCollaborationConnector extends PsBaseConnector {

  // Abstract methods that collaboration connectors should implement
  abstract login(): Promise<void>;
  abstract postItems(groupId: number, items: any): Promise<boolean>;
}