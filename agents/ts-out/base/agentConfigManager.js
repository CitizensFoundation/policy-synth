import { PolicySynthAgentBase } from "./agentBase.js";
export class PsConfigManager extends PolicySynthAgentBase {
    configuration;
    constructor(configuration) {
        super();
        this.configuration = configuration;
    }
    getConfig(uniqueId, defaultValue) {
        if (uniqueId in this.configuration) {
            //@ts-ignore
            const value = this.configuration[uniqueId];
            this.logger.debug(`Value for ${uniqueId}: ${value}`);
            // Check for null, undefined, or empty string and return defaultValue
            if (value === null ||
                value === undefined ||
                (typeof value === "string" && value.trim() === "")) {
                this.logger.debug(`Returning default value for ${uniqueId}`);
                return defaultValue;
            }
            this.logger.debug(`Type of value for ${uniqueId}: ${typeof value}`);
            // If value is not a string, return it as is (assuming it's already of type T)
            if (typeof value !== "string") {
                this.logger.debug(`Returning value as is for ${uniqueId}`);
                return value;
            }
            // Try to parse the string value intelligently
            if (value.toLowerCase() === "true") {
                return true;
            }
            else if (value.toLowerCase() === "false") {
                return false;
            }
            else if (!isNaN(Number(value))) {
                // Check if it's a valid number (integer or float)
                return Number(value);
            }
            else {
                try {
                    // Try to parse as JSON (for arrays or objects)
                    return JSON.parse(value);
                }
                catch {
                    // If all else fails, return the string value
                    return value;
                }
            }
        }
        else {
            this.logger.error(`Configuration answer not found for ${uniqueId}`);
            return defaultValue;
        }
    }
    getConfigOld(uniqueId, defaultValue) {
        this.logger.debug(JSON.stringify(this.configuration, null, 2));
        const answer = this.configuration.answers?.find((a) => a.uniqueId === uniqueId);
        if (answer) {
            if (typeof defaultValue === "number") {
                return Number(answer.value);
            }
            else if (typeof defaultValue === "boolean") {
                return (answer.value === "true");
            }
            else if (Array.isArray(defaultValue)) {
                return JSON.parse(answer.value);
            }
            return answer.value;
        }
        else {
            this.logger.error(`Configuration answer not found for ${uniqueId}`);
        }
        return defaultValue;
    }
    setConfig(uniqueId, value) {
        //@ts-ignore
        this.configuration[uniqueId] = value;
    }
    getAllConfig() {
        return this.configuration;
    }
    getModelUsageEstimates() {
        return this.configuration.modelUsageEstimates;
    }
    getApiUsageEstimates() {
        return this.configuration.apiUsageEstimates;
    }
    getMaxTokensOut() {
        return this.configuration.maxTokensOut;
    }
    getTemperature() {
        return this.configuration.temperature;
    }
    getAnswers() {
        return this.configuration.answers;
    }
}
//# sourceMappingURL=agentConfigManager.js.map