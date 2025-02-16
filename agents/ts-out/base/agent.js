import { PolicySynthAgentBase } from "./agentBase.js";
import { PsAiModelManager } from "./agentModelManager.js";
import { PsProgressTracker } from "./agentProgressTracker.js";
import { PsConfigManager } from "./agentConfigManager.js";
import sharedRedisClient from "./redisClient.js";
export class AgentExecutionStoppedError extends Error {
    constructor(message) {
        super(message);
        this.name = "AgentExecutionStoppedError";
    }
}
export class PolicySynthAgent extends PolicySynthAgentBase {
    memory;
    agent;
    modelManager;
    progressTracker;
    configManager;
    redis;
    skipAiModels = false;
    skipCheckForProgress = false;
    startProgress = 0;
    endProgress = 100;
    get maxModelTokensOut() { return 16384; }
    get modelTemperature() { return 0.7; }
    get reasoningEffort() { return 'medium'; }
    pauseCheckInterval = 1000 * 60 * 60 * 48; // 48 hours
    pauseTimeout = 1000;
    memorySaveTimer = null;
    memorySaveError = null;
    constructor(agent, memory = undefined, startProgress, endProgress) {
        super();
        this.agent = agent;
        this.logger.debug(`Agent ${agent?.id} constructor ${process.env.PS_AI_MODEL_NAME}`);
        if (!this.agent &&
            (!process.env.PS_AGENT_MAX_MODEL_TOKENS_OUT ||
                !process.env.PS_AGENT_MODEL_TEMPERATURE ||
                !process.env.PS_REDIS_MEMORY_KEY ||
                !process.env.PS_AI_MODEL_PROVIDER ||
                !process.env.PS_AI_MODEL_NAME ||
                !process.env.PS_AI_MODEL_TYPE ||
                !process.env.PS_AI_MODEL_SIZE)) {
            throw new Error("Agent not found and required environment variables not set");
        }
        if (!this.skipAiModels) {
            this.modelManager = new PsAiModelManager(agent?.AiModels || [], agent
                ? agent.Group?.private_access_configuration || []
                : [] /*this.getAccessConfigFromEnv()*/, this.maxModelTokensOut, this.modelTemperature, this.reasoningEffort, agent ? agent.id : -1, agent ? agent.user_id : -1);
        }
        if (agent && !agent.redisStatusKey) {
            this.logger.error("Agent status key not set", agent);
        }
        this.progressTracker = new PsProgressTracker(agent ? agent.redisStatusKey : "agent:status:-1", //TODO: Look into this fallback
        startProgress, endProgress);
        this.redis = sharedRedisClient;
        if (memory) {
            this.memory = memory;
            /*console.log(
              `Agent ${this.agent.id} loaded memory from constructor: ${JSON.stringify(
                this.memory
              )}`
            );*/
        }
        else {
            this.loadAgentMemoryFromRedis();
        }
        this.configManager = new PsConfigManager(agent?.configuration, this.memory);
    }
    async process() {
        if (!this.memory) {
            this.logger.error("Memory is not initialized");
            throw new Error("Memory is not initialized");
        }
        await this.progressTracker?.updateProgress(undefined, `Agent ${this.agent.Class?.name} Starting`);
        // The main processing logic would go here.
        // Subclasses would override this method to implement specific agent behaviors.
    }
    async loadAgentMemoryFromRedis() {
        if (!this.agent) {
            this.logger.error("Agent not found");
            return {};
        }
        else if (!this.agent.redisMemoryKey) {
            this.logger.error("Agent memory key not set");
            this.logger.error(JSON.stringify(this.agent, null, 2));
            throw new Error("Agent memory key not set");
        }
        try {
            this.logger.debug(`Loading memory from Redis: ${this.agent.redisMemoryKey}`);
            const memoryData = await this.redis.get(this.agent.redisMemoryKey);
            if (memoryData) {
                this.memory = JSON.parse(memoryData);
            }
            else {
                throw Error("No memory data found!");
            }
        }
        catch (error) {
            this.logger.error("Error initializing agent memory");
            this.logger.error(error);
        }
        return this.memory;
    }
    async callModel(modelType, modelSize, messages, parseJson = true, limitedRetries = false, tokenOutEstimate = 120, streamingCallbacks) {
        return this.modelManager?.callModel(modelType, modelSize, messages, parseJson, limitedRetries, tokenOutEstimate, streamingCallbacks);
    }
    async updateRangedProgress(progress, message) {
        if (this.progressTracker) {
            await this.progressTracker.updateRangedProgress(progress, message);
        }
        else {
            this.logger.error("Progress tracker not initialized");
        }
    }
    async updateProgress(progress, message) {
        await this.progressTracker?.updateProgress(progress, message);
    }
    getConfig(uniqueId, defaultValue) {
        return this.configManager.getConfig(uniqueId, defaultValue);
    }
    getConfigOld(uniqueId, defaultValue) {
        return this.configManager.getConfigOld(uniqueId, defaultValue);
    }
    async loadStatusFromRedis() {
        try {
            const statusDataString = await this.redis.get(this.agent.redisStatusKey);
            if (statusDataString) {
                /*this.logger.debug(
                  `Loading status from Redis: ${statusDataString} from key: ${this.agent.redisStatusKey}`
                );*/
                return JSON.parse(statusDataString);
            }
            else {
                this.logger.error("No memory data found!");
            }
        }
        catch (error) {
            this.logger.error("Error loading status from Redis");
            this.logger.error(error);
        }
    }
    async checkProgressForPauseOrStop() {
        let status = await this.loadStatusFromRedis();
        if (!status) {
            console.warn("Agent status not initialized");
        }
        else {
            //this.logger.debug(JSON.stringify(status, null, 2));
            if (status.state === "stopped") {
                throw new AgentExecutionStoppedError("Agent execution stopped");
            }
            if (status.state === "paused") {
                const startPauseTime = Date.now();
                while (status && status.state === "paused") {
                    await new Promise((resolve) => setTimeout(resolve, this.pauseCheckInterval));
                    status = await this.loadStatusFromRedis();
                    if (Date.now() - startPauseTime > this.pauseTimeout) {
                        throw new AgentExecutionStoppedError("Agent execution timed out while paused");
                    }
                    if (status) {
                        if (status.state === "stopped") {
                            throw new AgentExecutionStoppedError("Agent execution stopped while paused");
                        }
                        if (status.state === "running") {
                            break;
                        }
                    }
                }
            }
        }
    }
    async scheduleMemorySave() {
        if (!this.memorySaveTimer) {
            this.memorySaveTimer = setTimeout(async () => {
                try {
                    await this.saveMemory();
                    this.memorySaveError = null;
                }
                catch (error) {
                    this.memorySaveError =
                        error instanceof Error ? error : new Error(String(error));
                }
                finally {
                    if (this.memorySaveTimer) {
                        clearTimeout(this.memorySaveTimer);
                        this.memorySaveTimer = null;
                    }
                }
            }, 1500);
        }
    }
    checkLastMemorySaveError() {
        if (this.memorySaveError) {
            const error = this.memorySaveError;
            this.memorySaveError = null; // Clear the error after throwing
            throw error;
        }
    }
    async saveMemory() {
        try {
            await this.redis.set(this.agent.redisMemoryKey, JSON.stringify(this.memory));
            this.logger.debug(`Saving memory to Redis ${this.agent.redisMemoryKey}`);
            if (!this.skipCheckForProgress) {
                await this.checkProgressForPauseOrStop();
            }
        }
        catch (error) {
            if (error instanceof AgentExecutionStoppedError) {
                throw error;
            }
            else {
                this.logger.error("Error saving agent memory to Redis");
                this.logger.error(error);
            }
        }
    }
    async getTokensFromMessages(messages) {
        return this.modelManager?.getTokensFromMessages(messages) || 0;
    }
    // Additional methods that might be needed
    async setCompleted(message) {
        await this.progressTracker?.setCompleted(message);
    }
    async setError(errorMessage) {
        await this.progressTracker?.setError(errorMessage);
    }
    getModelUsageEstimates() {
        return this.configManager.getModelUsageEstimates();
    }
    getApiUsageEstimates() {
        return this.configManager.getApiUsageEstimates();
    }
    getMaxTokensOut() {
        return this.configManager.getMaxTokensOut();
    }
    getTemperature() {
        return this.configManager.getTemperature();
    }
}
//# sourceMappingURL=agent.js.map