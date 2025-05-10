import { TiktokenModel } from "tiktoken";
import chalk from "chalk";
import { PolicySynthAgentBase } from "../base/agentBase.js";
import { PsAiModel } from "../dbModels/aiModel.js";

export abstract class BaseChatModel extends PolicySynthAgentBase {
  modelName: string | TiktokenModel;
  maxTokensOut: number;
  provider?: string;
  config: PsAiModelConfig;

  constructor(config: PsAiModelConfig, modelName: string | TiktokenModel, maxTokensOut = 4096) {
    super();
    this.modelName = modelName;
    this.maxTokensOut = maxTokensOut;
    this.config = config;
  }

  abstract generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<PsBaseModelReturnParameters | undefined>;

  truncateXmlTags(text: string, maxChars = 500): string {
    const xmlTagRegex = /<(\w[\w\d-]*)([^>]*)>([\s\S]*?)<\/\1>/g;
    return text.replace(xmlTagRegex, (match, tagName, tagAttrs, innerText) => {
      if (innerText.length > maxChars) {
        const truncatedCount = innerText.length - maxChars;
        const truncated =
          innerText.slice(0, maxChars) +
          `... \n[TRUNCATED: ${truncatedCount} chars]\n`;
        return `<${tagName}${tagAttrs}>${truncated}</${tagName}>`;
      }
      return match;
    });
  }

  prettyPrintPromptMessages(
    messages: { role: string; content: string }[]
  ): string {
    return messages
      .map((msg, index) => {
        // 1) Truncate
        const truncatedContent = this.truncateXmlTags(msg.content, 500);

        // 2) Color-code
        const colorized = this.colorCodeXml(truncatedContent);

        return `Message #${index} [${msg.role}]:\n${colorized}`;
      })
      .join("\n\n");
  }

  // Example color-coding method (using chalk)
  colorCodeXml(text: string): string {
    const tagRegex = /(<\/?)(\w[\w\d-]*)([^>]*)(>)/g;
    return text.replace(tagRegex, (_, openBracket, tagName, attrs, closeBracket) => {
      const coloredOpen = chalk.gray(openBracket);
      const coloredTagName = chalk.cyan(tagName);
      const coloredAttrs = chalk.yellow(attrs);
      const coloredClose = chalk.gray(closeBracket);
      return `${coloredOpen}${coloredTagName}${coloredAttrs}${coloredClose}`;
    });
  }
}
