import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { Base } from "../../base.js";
import { IEngineConstants } from "../../constants.js";
import { ChatOpenAI } from "@langchain/openai";
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
            streaming: true
        });
        const webSocket = this.options.webSocket;
        if (webSocket && !this.options.disableStreaming) {
            const myCallback = {
                handleLLMNewToken(token) {
                    webSocket.send(JSON.stringify({
                        sender: "bot",
                        type: "stream",
                        message: token,
                    }));
                },
            };
            if (this.options.streamingCallbacks) {
                this.options.streamingCallbacks.push(myCallback);
            }
            else {
                this.options.streamingCallbacks = [myCallback];
            }
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
        let result;
        try {
            result = await this.performExecute();
            console.log(`Results: ${result.isValid} ${JSON.stringify(result.validationErrors)}`);
        }
        catch (e) {
            //TODO: Send airbrake error
            console.error("Unkown system error in validation agent");
            console.error(e);
            result = {
                isValid: false,
                validationErrors: ["Unkown system error in validation agent"],
                nextAgent: this.options.nextAgent,
            };
        }
        result.nextAgent = result.nextAgent || this.options.nextAgent;
        await this.afterExecute(result);
        return result;
    }
    beforeExecute() {
        if (this.options.webSocket && !this.options.disableStreaming) {
            const botMessage = {
                sender: "bot",
                type: "validationAgentStart",
                message: {
                    name: this.name,
                    noStreaming: this.options.hasNoStreaming,
                },
            };
            this.options.webSocket.send(JSON.stringify(botMessage));
        }
        return Promise.resolve();
    }
    async performExecute() {
        return await this.runValidationLLM();
    }
    afterExecute(result) {
        if (this.options.webSocket && !this.options.disableStreaming) {
            const botMessage = {
                sender: "bot",
                type: "validationAgentCompleted",
                message: {
                    name: this.name,
                    results: {
                        isValid: result.isValid,
                        validationErrors: result.validationErrors,
                        lastAgent: !this.options.nextAgent
                    },
                },
            };
            this.options.webSocket.send(JSON.stringify(botMessage));
        }
        return Promise.resolve();
    }
}
//# sourceMappingURL=baseValidationAgent.js.map