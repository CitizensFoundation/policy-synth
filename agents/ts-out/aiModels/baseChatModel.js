export class BaseChatModel {
    modelName;
    maxTokensOut;
    constructor(modelName, maxTokensOut = 4096) {
        this.modelName = modelName;
        this.maxTokensOut = maxTokensOut;
    }
}
//# sourceMappingURL=baseChatModel.js.map