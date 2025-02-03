import { PolicySynthAgentBase } from "../base/agentBase.js";
export class BaseChatModel extends PolicySynthAgentBase {
    modelName;
    maxTokensOut;
    constructor(modelName, maxTokensOut = 4096) {
        super();
        this.modelName = modelName;
        this.maxTokensOut = maxTokensOut;
    }
    /**
     * Truncate the text inside XML-like tags to a certain length.
     * For example:
     *   <systemMessage>This text is extremely long ...</systemMessage>
     * becomes
     *   <systemMessage>This text is extr... [TRUNCATED: 1234 chars]</systemMessage>
     *
     * @param text - The original text that may contain XML-like tags
     * @param maxChars - The maximum number of characters to allow inside the tag
     * @returns The text with tag contents truncated.
     */
    truncateXmlTags(text, maxChars = 500) {
        // This regex captures:
        //   (1) The tag name (or any wordish string after '<'), plus optional attributes
        //   (2) The text inside the tag
        //   (3) Ensures a matching end tag like </tagName>
        // Note: Not bulletproof for real XML but sufficient for debug/log truncation.
        const xmlTagRegex = /<(\w[\w\d-]*)([^>]*)>([\s\S]*?)<\/\1>/g;
        return text.replace(xmlTagRegex, (match, tagName, tagAttrs, innerText) => {
            if (innerText.length > maxChars) {
                const truncatedCount = innerText.length - maxChars;
                const truncated = innerText.slice(0, maxChars) +
                    `... [TRUNCATED: ${truncatedCount} chars]`;
                return `<${tagName}${tagAttrs}>${truncated}</${tagName}>`;
            }
            return match;
        });
    }
    prettyPrintPromptMessages(messages) {
        return messages
            .map((msg, index) => {
            // Truncate any XML-like tags:
            const truncatedContent = this.truncateXmlTags(msg.content, 500);
            return `Message #${index} [${msg.role}]:\n${truncatedContent}`;
        })
            .join("\n\n");
    }
}
//# sourceMappingURL=baseChatModel.js.map