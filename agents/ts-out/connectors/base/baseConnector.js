import { PolicySynthAgent } from "../../base/agent.js";
export class PsBaseConnector extends PolicySynthAgent {
    connector;
    connectorClass;
    skipAiModels = true;
    constructor(connector, connectorClass, agent, memory = undefined, startProgress = 0, endProgress = 100) {
        super(agent, memory, startProgress, endProgress);
        this.connector = connector;
        this.connectorClass = connectorClass;
    }
    static getConfigurationQuestions() {
        return [
            {
                uniqueId: "name",
                text: "Name",
                type: "textField",
                maxLength: 200,
                required: true,
            },
            {
                uniqueId: "description",
                text: "Description",
                type: "textArea",
                maxLength: 500,
                required: false,
            },
            ...this.getExtraConfigurationQuestions(),
        ];
    }
    static getExtraConfigurationQuestions() {
        return [];
    }
    get name() {
        return this.getConfig("name", "");
    }
    get description() {
        return this.getConfig("description", "");
    }
    getConfig(uniqueId, defaultValue) {
        if (uniqueId in this.connector.configuration) {
            //TODO: Look into this
            //@ts-ignore
            const value = this.connector.configuration[uniqueId];
            this.logger.debug(`Value for ${uniqueId}: ${value}`);
            if (value === null ||
                value === undefined ||
                (typeof value === "string" && value.trim() === "")) {
                this.logger.debug(`Returning default value for ${uniqueId}`);
                return defaultValue;
            }
            this.logger.debug(`Type of value for ${uniqueId}: ${typeof value}`);
            if (typeof value !== "string") {
                this.logger.debug(`Returning value as is for ${uniqueId}`);
                return value;
            }
            if (value.toLowerCase() === "true") {
                return true;
            }
            else if (value.toLowerCase() === "false") {
                return false;
            }
            else if (!isNaN(Number(value))) {
                return Number(value);
            }
            else {
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            }
        }
        else {
            this.logger.error(`Configuration answer not found for ${uniqueId}`);
            return defaultValue;
        }
    }
    // Common utility methods can be implemented here
    async retryOperation(operation, maxRetries = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                if (attempt === maxRetries)
                    throw error;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw new Error("Max retries reached");
    }
}
//# sourceMappingURL=baseConnector.js.map