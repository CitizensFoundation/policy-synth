import { PolicySynthAgentBase } from "../base/agentBase.js";
export class BaseChatModel extends PolicySynthAgentBase {
    modelName;
    maxTokensOut;
    constructor(modelName, maxTokensOut = 4096) {
        super();
        this.modelName = modelName;
        this.maxTokensOut = maxTokensOut;
    }
    prettyPrintPromptMessages(messages) {
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
//# sourceMappingURL=baseChatModel.js.map