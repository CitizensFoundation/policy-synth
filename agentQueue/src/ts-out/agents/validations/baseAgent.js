import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Base } from "../../base.js";
import { IEngineConstants } from "../../constants.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
export class PsBaseValidationAgent extends Base {
    name;
    agentMemory;
    nextAgent;
    validationErrors;
    systemMessage;
    userMessage;
    streamingCallbacks;
    webSocket;
    constructor(name, agentMemory, systemMessage, userMessage, streamingCallbacks, webSocket, nextAgent) {
        super();
        this.name = name;
        this.nextAgent = nextAgent;
        this.agentMemory = agentMemory;
        this.systemMessage = systemMessage;
        this.userMessage = userMessage;
        this.streamingCallbacks = streamingCallbacks;
        this.webSocket = webSocket;
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.validationModel.temperature,
            maxTokens: IEngineConstants.validationModel.maxOutputTokens,
            modelName: IEngineConstants.validationModel.name,
            verbose: IEngineConstants.validationModel.verbose,
            streaming: true,
        });
        if (this.webSocket) {
            this.webSocket.send(JSON.stringify({
                sender: "bot",
                type: "validationAgentStart",
                message: `Agent ${this.name} started`,
            }));
        }
    }
    async renderPrompt() {
        if (this.systemMessage && this.userMessage) {
            return [
                new SystemMessage(this.systemMessage),
                new HumanMessage(this.userMessage),
            ];
        }
        else {
            throw new Error("System or user message is undefined");
        }
    }
    async runValidationLLM() {
        const llmResponse = await this.callLLM("validation-agent", IEngineConstants.validationModel, await this.renderPrompt(), true, false, 120, this.streamingCallbacks);
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
        result.nextAgent = result.nextAgent || this.nextAgent;
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
        if (this.webSocket) {
            this.webSocket.send(JSON.stringify({
                sender: "bot",
                type: "agentEnd",
                message: `Agent ${this.name} completed ${result.isValid ? "successfully" : "unsuccessfully"}`,
            }));
        }
        return Promise.resolve();
    }
}
