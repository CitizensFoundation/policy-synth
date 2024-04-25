import { PsBaseValidationAgent } from "./baseValidationAgent.js";

export class PsClassificationAgent extends PsBaseValidationAgent {
  private routes: Map<string, PsValidationAgent>;

  constructor(
    name: string,
    options: PsBaseValidationAgentOptions = {},
  ) {
    super(
      name,
      options
    );
    this.routes = new Map();
  }

  addRoute(classification: string, agent: PsValidationAgent): void {
    this.routes.set(classification, agent);
  }

  protected async performExecute(): Promise<PsValidationAgentResult> {
    const classificationResult =
      (await this.runValidationLLM()) as PsClassificationAgentResult;
    const nextAgent = this.routes.get(classificationResult.classification);

    classificationResult.nextAgent = nextAgent;
    console.log(`Classification: ${classificationResult.nextAgent?.name}`)

    return classificationResult;
  }

  protected afterExecute(result: PsValidationAgentResult): Promise<void> {
    if (this.options.webSocket && !this.options.disableStreaming) {
      const botMessage = {
        sender: "bot",
        type: "agentCompleted",
        message: {
          name: this.name,
          results: {
            isValid: result.isValid,
            validationErrors: result.validationErrors,
            lastAgent: false
          } as PsValidationAgentResult,
        } as PsAgentCompletedWsOptions,
      };

      this.options.webSocket.send(JSON.stringify(botMessage));
    }

    return Promise.resolve();
  }
}
