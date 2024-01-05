import { PsBaseValidationAgent } from "./baseAgent.js";

export abstract class PsClassificationAgent extends PsBaseValidationAgent {
  private routes: Map<string, PsValidationAgent>;

  constructor(
    name: string,
    agentMemory: PsAgentMemory,
    systemMessage: string,
    userMessage: string,
    nextAgent: PsValidationAgent | undefined
  ) {
    super(name, agentMemory, systemMessage, userMessage, nextAgent);
    this.routes = new Map();
  }

  addRoute(classification: string, agent: PsValidationAgent): void {
    this.routes.set(classification, agent);
  }

  protected async performExecute(
    input: string
  ): Promise<PsValidationAgentResult> {
    const classificationResult = await this.classify(input);
    const nextAgent = this.routes.get(classificationResult.classification);

    return {
      isValid: classificationResult.isValid,
      validationErrors: classificationResult.validationErrors,
      nextAgent: nextAgent,
    };
  }

  protected abstract classify(
    input: string
  ): Promise<PsClassificationAgentResult>;
}
