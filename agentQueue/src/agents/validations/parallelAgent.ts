import { Callbacks } from "langchain/callbacks";
import { PsBaseValidationAgent } from "./baseValidationAgent.js";
import WebSocket from "ws";

export class PsParallelValidationAgent extends PsBaseValidationAgent {
  private agents: PsBaseValidationAgent[];

  constructor(
    name: string,
    options: PsBaseValidationAgentOptions = {},
    agents: PsBaseValidationAgent[],
  ) {
    super(name, options);
    this.agents = agents;
  }

  async execute(): Promise<PsValidationAgentResult> {
    await this.beforeExecute();

    // Execute all agents in parallel
    const results = await Promise.all(this.agents.map(agent => agent.execute()));

    // Aggregate results
    const aggregatedResult = this.aggregateResults(results);

    console.log(`Aggregated Results: ${aggregatedResult.isValid} ${JSON.stringify(aggregatedResult.validationErrors)}`)

    aggregatedResult.nextAgent = this.options.nextAgent;

    await this.afterExecute(aggregatedResult);

    return aggregatedResult;
  }

  private aggregateResults(results: PsValidationAgentResult[]): PsValidationAgentResult {
    let isValid = true;
    let validationErrors: string[] = [];

    for (const result of results) {
      if (!result.isValid) {
        isValid = false;
      }
      if (result.validationErrors) {
        validationErrors = [...validationErrors, ...result.validationErrors];
      }
    }

    return { isValid, validationErrors, nextAgent: undefined };
  }
}