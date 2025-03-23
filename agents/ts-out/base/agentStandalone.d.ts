import { PolicySynthAgentBase } from "./agentBase.js";
import { PsAiModelManager } from "./agentModelManager.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";
/**
 * PolicySynthStandaloneAgent
 *
 * This agent works like the core agent but does not use any database models or Redis.
 * It initializes its AI models solely from the command-line .env variables.
 */
export declare class PolicySynthStandaloneAgent extends PolicySynthAgentBase {
    memory: Record<string, unknown>;
    modelManager: PsAiModelManager;
    get maxModelTokensOut(): number;
    get modelTemperature(): number;
    get reasoningEffort(): "low" | "medium" | "high";
    get maxThinkingTokens(): number;
    /**
     * Creates a new standalone agent.
     * @param memory Optional initial memory object.
     */
    constructor(memory?: Record<string, unknown>);
    /**
     * Main processing logic for the standalone agent.
     * Override this method to implement custom behavior.
     */
    process(): Promise<void>;
    /**
     * Delegates the call to the model manager.
     * @param modelType The type of the model.
     * @param modelSize The size of the model.
     * @param messages Array of messages to send to the model.
     * @param parseJson Whether to parse the response as JSON.
     * @param limitedRetries Whether to use limited retries.
     * @param tokenOutEstimate Estimated tokens for the output.
     * @param streamingCallbacks Optional streaming callbacks.
     */
    callModel(modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options?: PsCallModelOptions): Promise<any>;
}
//# sourceMappingURL=agentStandalone.d.ts.map