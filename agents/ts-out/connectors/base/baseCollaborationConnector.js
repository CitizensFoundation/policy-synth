import { PsBaseConnector } from "./baseConnector.js";
export class PsBaseCollaborationConnector extends PsBaseConnector {
    // Optional method for image generation, if supported by the collaboration platform
    async generateImage(groupId, prompt) {
        throw new Error("Image generation not supported by this collaboration connector.");
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
//# sourceMappingURL=baseCollaborationConnector.js.map