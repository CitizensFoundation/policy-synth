import { PsBaseConnector } from "./baseConnector.js";
export abstract class PsBaseCollaborationConnector extends PsBaseConnector {

  // Abstract methods that collaboration connectors should implement
  abstract login(): Promise<void>;
  abstract post(groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string): Promise<YpPostData>;
  abstract vote(itemId: number, value: number): Promise<void>;

  // Optional method for image generation, if supported by the collaboration platform
  async generateImage?(groupId: number, prompt: string): Promise<number> {
    throw new Error("Image generation not supported by this collaboration connector.");
  }

  // Common utility methods can be implemented here
  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error("Max retries reached");
  }
}