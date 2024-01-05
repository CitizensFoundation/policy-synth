import { Base } from "../../base.js";

export abstract class PsBaseValidationAgent extends Base {
  name: string;
  agentMemory: PsAgentMemory;
  nextAgent: PsValidationAgent | undefined;
  errors?: string[];

  systemMessage: string;
  userMessage: string;

  constructor(
    name: string,
    agentMemory: PsAgentMemory,
    systemMessage: string,
    userMessage: string,
    nextAgent: PsValidationAgent | undefined
  ) {
    super();
    this.name = name;
    this.nextAgent = nextAgent;
    this.agentMemory = agentMemory;
    this.systemMessage = systemMessage;
    this.userMessage = userMessage;
  }

  async execute(input: string): Promise<PsValidationAgentResult> {
    await this.beforeExecute(input);

    const result = await this.performExecute(input);

    result.nextAgent = this.nextAgent;

    await this.afterExecute(input, result);

    return result;
  }

  protected beforeExecute(input: string): Promise<void> {
    return Promise.resolve();
  }

  protected abstract performExecute(
    input: string
  ): Promise<PsValidationAgentResult>;

  protected afterExecute(
    input: string,
    result: PsValidationAgentResult
  ): Promise<void> {
    return Promise.resolve();
  }
}
