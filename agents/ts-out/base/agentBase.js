import winston from "winston";
import { jsonrepair } from "jsonrepair";
import { encoding_for_model } from "tiktoken";
export class PolicySynthAgentBase {
    logger;
    timeStart = Date.now();
    constructor() {
        this.logger = winston.createLogger({
            level: process.env.WORKER_LOG_LEVEL || "debug",
            format: winston.format.json(),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
                }),
            ],
        });
    }
    createSystemMessage(content) {
        return { role: "system", message: content };
    }
    createHumanMessage(content) {
        return { role: "user", message: content };
    }
    getJsonBlock(text) {
        let startIndex = text.indexOf("```json");
        let endIndex = text.indexOf("```", startIndex + 6);
        if (endIndex !== -1) {
            return text.substring(startIndex + 7, endIndex).trim();
        }
        else {
            return null;
        }
    }
    repairJson(text) {
        try {
            return jsonrepair(text);
        }
        catch (error) {
            this.logger.error(error);
            throw new Error("Unable to repair JSON");
        }
    }
    parseJsonResponse(response) {
        this.logger.debug(`Attempting to parse JSON: ${response}`);
        if (this.getJsonBlock(response)) {
            response = this.getJsonBlock(response);
            this.logger.debug('Extracted JSON from code block');
        }
        else {
            response = response.replace("```json", "").trim();
            if (response.endsWith("```")) {
                response = response.substring(0, response.length - 3);
            }
            this.logger.debug('Cleaned JSON string');
        }
        try {
            const parsed = JSON.parse(response);
            this.logger.info('Successfully parsed JSON');
            return parsed;
        }
        catch (error) {
            this.logger.warn(`Error parsing JSON: ${error.message}`);
            try {
                this.logger.info('Attempting to repair JSON');
                const repairedJson = this.repairJson(response);
                const parsed = JSON.parse(repairedJson);
                this.logger.info('Successfully parsed repaired JSON');
                return parsed;
            }
            catch (repairError) {
                this.logger.error(`Failed to repair JSON: ${repairError.message}`);
                throw new Error(`Unable to parse JSON: ${repairError.message}\nOriginal JSON: ${response}`);
            }
        }
    }
    formatNumber(number, fractions = 0) {
        return new Intl.NumberFormat("en-US", {
            maximumFractionDigits: fractions,
        }).format(number);
    }
    async getTokensFromMessages(messages) {
        //TODO: Get the db model name from the agent
        const encoding = encoding_for_model("gpt-4o");
        let totalTokens = 0;
        for (const message of messages) {
            // Every message follows <im_start>{role/name}\n{content}<im_end>\n
            totalTokens += 4;
            for (const [key, value] of Object.entries(message)) {
                totalTokens += encoding.encode(value).length;
                if (key === "name") {
                    totalTokens -= 1; // Role is always required and always 1 token
                }
            }
        }
        totalTokens += 2; // Every reply is primed with <im_start>assistant
        encoding.free(); // Free up the memory used by the encoder
        return totalTokens;
    }
}
//# sourceMappingURL=agentBase.js.map