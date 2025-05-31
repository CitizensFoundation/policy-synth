import { PsBaseConnector } from "./baseConnector.js";
export abstract class PsBaseIdeasCollaborationConnector extends PsBaseConnector {
  // Abstract methods that collaboration connectors should implement
  abstract login(): Promise<void>;
  abstract post(
    groupId: number,
    name: string,
    structuredAnswersData: YpStructuredAnswer[],
    imagePrompt: string,
    imageLocalPath: string | undefined
  ): Promise<YpPostData>;
  abstract vote(itemId: number, value: number): Promise<void>;
  abstract postPoint(
    groupId: number,
    postId: number,
    userId: number,
    value: number,
    content: string
  ): Promise<YpPointData>;

  abstract getGroupPosts(groupId: number): Promise<YpPostData[]>;

  // Optional method for image generation, if supported by the collaboration platform
  async generateImage?(groupId: number, prompt: string): Promise<number> {
    throw new Error(
      "Image generation not supported by this collaboration connector."
    );
  }
}
