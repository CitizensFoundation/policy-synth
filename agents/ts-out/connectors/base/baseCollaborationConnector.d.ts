import { PsBaseConnector } from "./baseConnector.js";
export declare abstract class PsBaseCollaborationConnector extends PsBaseConnector {
    abstract login(): Promise<void>;
    abstract post(groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string): Promise<YpPostData>;
    abstract vote(itemId: number, value: number): Promise<void>;
    generateImage?(groupId: number, prompt: string): Promise<number>;
    protected retryOperation<T>(operation: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
}
//# sourceMappingURL=baseCollaborationConnector.d.ts.map