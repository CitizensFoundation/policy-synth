import { PsBaseConnector } from "./baseConnector.js";
export declare abstract class PsBaseIdeasCollaborationConnector extends PsBaseConnector {
    abstract login(): Promise<void>;
    abstract post(groupId: number, name: string, structuredAnswersData: YpStructuredAnswer[], imagePrompt: string, imageLocalPath: string | undefined): Promise<YpPostData>;
    abstract vote(itemId: number, value: number): Promise<void>;
    abstract getGroupPosts(groupId: number): Promise<YpPostData[]>;
    generateImage?(groupId: number, prompt: string): Promise<number>;
}
//# sourceMappingURL=baseIdeasCollaborationConnector.d.ts.map