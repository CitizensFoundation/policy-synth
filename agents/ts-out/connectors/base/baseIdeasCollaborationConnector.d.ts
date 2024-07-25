import { PsBaseConnector } from "./baseConnector.js";
export declare abstract class PsBaseIdeasCollaborationConnector extends PsBaseConnector {
    abstract login(): Promise<void>;
    abstract post(groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string): Promise<YpPostData>;
    abstract vote(itemId: number, value: number): Promise<void>;
    generateImage?(groupId: number, prompt: string): Promise<number>;
}
//# sourceMappingURL=baseIdeasCollaborationConnector.d.ts.map