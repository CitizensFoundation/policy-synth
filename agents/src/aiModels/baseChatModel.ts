
import { TiktokenModel } from "tiktoken";
import { PolicySynthAgentBase } from "../base/agentBase.js";

export abstract class BaseChatModel extends PolicySynthAgentBase {
  modelName: string | TiktokenModel;
  maxTokensOut: number;

  constructor(modelName: string | TiktokenModel, maxTokensOut: number = 4096) {
    super();
    this.modelName = modelName;
    this.maxTokensOut = maxTokensOut;
  }

  abstract generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<{tokensIn: number, tokensOut: number, content: string} | undefined>;

  abstract getEstimatedNumTokensFromMessages(
    messages: PsModelMessage[]
  ): Promise<number>;

  prettyPrintPromptMessages(
    messages: { role: string; content: string }[]
  ): string {
    return messages
      .map((msg, index) => {
        return [
          `----- Message ${index + 1} -----`,
          `Role: ${msg.role}`,
          `Content:`,
          msg.content, // content is printed as-is (preserving newlines and markdown)
          `---------------------------`
        ].join("\n");
      })
      .join("\n\n");
  }
}
