import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";

export class PsRagVectorSearch extends PolicySynthAgentBase {
  search(
    userQuestion: string,
    dataLayout: PsIngestionDataLayout
  ): Promise<PsRagRoutingResponse> {


    throw new Error("Method not implemented.");
  }
}