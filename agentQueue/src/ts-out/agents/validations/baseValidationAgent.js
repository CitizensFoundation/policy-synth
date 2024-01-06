import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Base } from "../../base.js";
import { IEngineConstants } from "../../constants.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
export class PsBaseValidationAgent extends Base {
    name;
    options;
    constructor(name, options = {}) {
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
        if (this.options.webSocket) {
            const botMessage = {
                sender: "bot",
                type: "agentStart",
                message: {
                    name: this.name,
                    noStreaming: !this.options.streamingCallbacks || this.options.disableStreaming,
                }
            };
            this.options.webSocket.send(JSON.stringify(botMessage));
        }
    }
    set nextAgent(agent) {
        this.options.nextAgent = agent;
    }
    async renderPrompt() {
        if (this.options.systemMessage && this.options.userMessage) {
            return [
                new SystemMessage(this.options.systemMessage),
                new HumanMessage(this.options.userMessage),
            ];
        }
        else {
            throw new Error("System or user message is undefined");
        }
    }
    async runValidationLLM() {
        const llmResponse = await this.callLLM("validation-agent", IEngineConstants.validationModel, await this.renderPrompt(), true, false, 120, this.options.streamingCallbacks);
        if (!llmResponse) {
            throw new Error("LLM response is undefined");
        }
        else {
            return llmResponse;
        }
    }
    async execute() {
        await this.beforeExecute();
        const result = await this.performExecute();
        console.log(`Results: ${result.isValid} ${JSON.stringify(result.validationErrors)}`);
        result.nextAgent = result.nextAgent || this.options.nextAgent;
        await this.afterExecute(result);
        return result;
    }
    beforeExecute() {
        return Promise.resolve();
    }
    async performExecute() {
        return await this.runValidationLLM();
    }
    afterExecute(result) {
        if (this.options.webSocket) {
            const botMessage = {
                sender: "bot",
                type: "agentCompleted",
                message: {
                    name: this.name,
                    results: {
                        isValid: result.isValid,
                        validationErrors: result.validationErrors
                    },
                }
            };
            this.options.webSocket.send(JSON.stringify(botMessage));
        }
        return Promise.resolve();
    }
}
