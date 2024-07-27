import { PolicySynthAgentBase } from "./agentBase.js";
export declare class PsConfigManager extends PolicySynthAgentBase {
    configuration: PsBaseNodeConfiguration;
    constructor(configuration: PsBaseNodeConfiguration);
    getConfig<T>(uniqueId: string, defaultValue: T): T;
    getConfigOld<T>(uniqueId: string, defaultValue: T): T;
    setConfig<T>(uniqueId: string, value: T): void;
    getAllConfig(): PsBaseNodeConfiguration;
    getModelUsageEstimates(): PsAgentModelUsageEstimate[] | undefined;
    getApiUsageEstimates(): PsAgentApiUsageEstimate[] | undefined;
    getMaxTokensOut(): number | undefined;
    getTemperature(): number | undefined;
    getAnswers(): YpStructuredAnswer[] | undefined;
}
//# sourceMappingURL=agentConfigManager.d.ts.map