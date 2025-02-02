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
  ): Promise<
    { tokensIn: number; tokensOut: number; content: string } | undefined
  >;

  abstract getEstimatedNumTokensFromMessages(
    messages: PsModelMessage[]
  ): Promise<number>;

  private truncateXmlTags(text: string, maxChars = 500): string {
    // This regex captures:
    //   1. The tag name (or any wordish string after '<'), along with optional attributes
    //   2. The text inside the tag
    // And ensures matching end tag like </tagName>.
    // Note: Not bulletproof for real XML parsing, but works for debug/truncation.
    const xmlTagRegex = /<(\w[\w\d-]*)([^>]*)>([\s\S]*?)<\/\1>/g;

    return text.replace(xmlTagRegex, (match, tagName, tagAttrs, innerText) => {
      // If the inner text is longer than `maxChars`, truncate it.
      if (innerText.length > maxChars) {
        const truncated = innerText.slice(0, maxChars) + "... [TRUNCATED]";
        return `<${tagName}${tagAttrs}>${truncated}</${tagName}>`;
      } else {
        return match; // Otherwise, leave as-is.
      }
    });
  }

  prettyPrintPromptMessages(
    messages: { role: string; content: string }[]
  ): string {
    return messages
      .map((msg, index) => {
        // Truncate any XML-like tags:
        const truncatedContent = this.truncateXmlTags(msg.content, 500);
        return `Message #${index} [${msg.role}]:\n${truncatedContent}`;
      })
      .join("\n\n");
  }
}
