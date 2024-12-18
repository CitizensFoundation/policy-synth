import { PolicySynthAgentBase } from "../base/agentBase.js";
export class BaseChatModel extends PolicySynthAgentBase {
    modelName;
    maxTokensOut;
    constructor(modelName, maxTokensOut = 4096) {
        super();
        this.modelName = modelName;
        this.maxTokensOut = maxTokensOut;
    }
}
//# sourceMappingURL=baseChatModel.js.map