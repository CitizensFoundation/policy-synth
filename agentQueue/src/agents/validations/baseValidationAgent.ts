import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Base } from "../../base.js";
import { IEngineConstants } from "../../constants.js";
import { ChatOpenAI } from "@langchain/openai";

export class PsBaseValidationAgent extends Base {
  name: string;
  options: PsBaseValidationAgentOptions;

  constructor(name: string, options: PsBaseValidationAgentOptions = {}) {
    super();
    this.name = name;
    this.options = options;

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.validationModel.temperature,
      maxTokens: IEngineConstants.validationModel.maxOutputTokens,
      modelName: IEngineConstants.validationModel.name,
      verbose: IEngineConstants.validationModel.verbose,
      streaming: true,
    });

    const webSocket = this.options.webSocket;

    if (webSocket && !this.options.disableStreaming) {
      const myCallback =  {
        handleLLMNewToken(token: string) {
          webSocket.send(
            JSON.stringify({
              sender: "bot",
              type: "stream",
              message: token,
            })
          )
        },
      }

      if (this.options.streamingCallbacks) {
        this.options.streamingCallbacks.push(myCallback);
      } else {
        this.options.streamingCallbacks = [myCallback];
      }
    }
  }

  set nextAgent(agent: PsValidationAgent) {
    this.options.nextAgent = agent;
  }

  protected async renderPrompt() {
    if (this.options.systemMessage && this.options.userMessage) {
      return [
        new SystemMessage(this.options.systemMessage),
        new HumanMessage(this.options.userMessage),
      ];
    } else {
      throw new Error("System or user message is undefined");
    }
  }

  async runValidationLLM(): Promise<PsValidationAgentResult> {
    const llmResponse = await this.callLLM(
      "validation-agent",
      IEngineConstants.validationModel,
      await this.renderPrompt(),
      true,
      false,
      120,
      this.options.streamingCallbacks
    );

    if (!llmResponse) {
      throw new Error("LLM response is undefined");
    } else {
      return llmResponse;
    }
  }

  async execute(): Promise<PsValidationAgentResult> {
    await this.beforeExecute();

    const result = await this.performExecute();

    console.log(
      `Results: ${result.isValid} ${JSON.stringify(result.validationErrors)}`
    );

    result.nextAgent = result.nextAgent || this.options.nextAgent;

    await this.afterExecute(result);

    return result;
  }

  protected beforeExecute(): Promise<void> {
    if (this.options.webSocket && !this.options.disableStreaming) {
      const botMessage = {
        sender: "bot",
        type: "agentStart",
        message: {
          name: this.name,
          noStreaming:
            !this.options.streamingCallbacks || this.options.disableStreaming,
        } as PsAgentStartWsOptions,
      };
      this.options.webSocket.send(JSON.stringify(botMessage));
    }

    return Promise.resolve();
  }

  protected async performExecute(): Promise<PsValidationAgentResult> {
    return await this.runValidationLLM();
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
            lastAgent: !this.options.nextAgent
          } as PsValidationAgentResult,
        } as PsAgentCompletedWsOptions,
      };

      this.options.webSocket.send(JSON.stringify(botMessage));
    }

    return Promise.resolve();
  }
}
