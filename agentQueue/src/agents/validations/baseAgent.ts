import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Base } from "../../base.js";
import { IEngineConstants } from "../../constants.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Callbacks } from "langchain/callbacks";
import { BaseChatMessageHistory } from "langchain/schema";

export class PsBaseValidationAgent extends Base {
  name: string;
  agentMemory: PsAgentMemory | undefined;
  nextAgent: PsValidationAgent | undefined;
  validationErrors?: string[];

  systemMessage: string;
  userMessage: string;

  streamingCallbacks: Callbacks | undefined;

  constructor(
    name: string,
    agentMemory: PsAgentMemory | undefined,
    systemMessage: string,
    userMessage: string,
    streamingCallbacks: Callbacks,
    nextAgent: PsValidationAgent | undefined,
  ) {
    super();
    this.name = name;
    this.nextAgent = nextAgent;
    this.agentMemory = agentMemory;
    this.systemMessage = systemMessage;
    this.userMessage = userMessage;
    this.streamingCallbacks = streamingCallbacks;

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.validationModel.temperature,
      maxTokens: IEngineConstants.validationModel.maxOutputTokens,
      modelName: IEngineConstants.validationModel.name,
      verbose: IEngineConstants.validationModel.verbose,
      streaming: true
    });
  }

  protected async renderPrompt() {
    return [
      new SystemMessage(this.systemMessage),
      new HumanMessage(this.userMessage),
    ];
  }

  async runValidationLLM(): Promise<PsValidationAgentResult> {
    const llmResponse = await this.callLLM(
      "validation-agent",
      IEngineConstants.validationModel,
      await this.renderPrompt(),
      true,
      false,
      120,
      this.streamingCallbacks
    );

    if (!llmResponse) {
      throw new Error("LLM response is undefined");
    } else {
      return llmResponse
    }
  }

  async execute(input: string): Promise<PsValidationAgentResult> {
    await this.beforeExecute(input);

    const result = await this.performExecute();

    result.nextAgent = this.nextAgent;

    await this.afterExecute(input, result);

    return result;
  }

  protected beforeExecute(input: string): Promise<void> {
    return Promise.resolve();
  }

  protected async performExecute(): Promise<PsValidationAgentResult> {
    const results = await this.runValidationLLM();

    results.nextAgent = this.nextAgent;

    return results;
  }

  protected afterExecute(
    input: string,
    result: PsValidationAgentResult
  ): Promise<void> {
    return Promise.resolve();
  }
}
