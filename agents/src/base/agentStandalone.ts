import { PolicySynthAgentBase } from "./agentBase.js";
import { PsAiModelManager } from "./agentModelManager.js";
import { PsAiModelType, PsAiModelSize } from "../aiModelTypes.js";

/**
 * PolicySynthStandaloneAgent
 *
 * This agent works like the core agent but does not use any database models or Redis.
 * It initializes its AI models solely from the command-line .env variables.
 */
export class PolicySynthStandaloneAgent extends PolicySynthAgentBase {
  // In-memory memory store (can hold conversation state, etc.)
  memory: Record<string, unknown>;

  // AI model manager initialized without DB models or Redis dependencies.
  modelManager: PsAiModelManager;

  // Settings inherited from the core agent
  get maxModelTokensOut(): number {
    return 16384;
  }
  get modelTemperature(): number {
    return 0.7;
  }
  get reasoningEffort(): "low" | "medium" | "high" {
    return "medium";
  }
  get maxThinkingTokens(): number {
    return 0;
  }

  /**
   * Creates a new standalone agent.
   * @param memory Optional initial memory object.
   */
  constructor(memory: Record<string, unknown> = {}) {
    super();
    this.memory = memory;

    // Initialize the model manager with empty arrays for DB models and access configurations.
    // Pass -1 for both agentId and userId since there is no database.
    this.modelManager = new PsAiModelManager(
      [], // No DB-based AI models.
      [], // No access configuration.
      this.maxModelTokensOut,
      this.modelTemperature,
      this.reasoningEffort,
      this.maxThinkingTokens,
      -1,
      -1
    );

    // Override the token usage saving to avoid any database calls.
    this.modelManager.saveTokenUsage = async (
      modelType: PsAiModelType,
      modelSize: PsAiModelSize,
      tokensIn: number,
      tokensOut: number
    ) => {
      console.log(
        `(Standalone) Token usage for model ${modelType} (${modelSize}): tokensIn=${tokensIn}, tokensOut=${tokensOut}`
      );
    };
  }

  /**
   * Main processing logic for the standalone agent.
   * Override this method to implement custom behavior.
   */
  async process(): Promise<void> {
    console.log("PolicySynthStandaloneAgent processing started.");

  }

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
  async callModel(
    modelType: PsAiModelType,
    modelSize: PsAiModelSize,
    messages: PsModelMessage[],
    parseJson = true,
    limitedRetries = false,
    tokenOutEstimate = 120,
    streamingCallbacks?: Function
  ): Promise<any> {
    return this.modelManager.callModel(
      modelType,
      modelSize,
      messages,
      parseJson,
      limitedRetries,
      tokenOutEstimate,
      streamingCallbacks
    );
  }

  // The following methods from the core agent that rely on Redis or DB have been omitted
  // because they are not applicable in the standalone mode.
}
