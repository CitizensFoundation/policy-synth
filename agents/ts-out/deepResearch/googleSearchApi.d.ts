import { PolicySynthSimpleAgentBase } from "../base/simpleAgent.js";
export declare class GoogleSearchApi extends PolicySynthSimpleAgentBase {
    needsAiModel: boolean;
    search(query: string, numberOfResults: number): Promise<PsSearchResultItem[]>;
}
//# sourceMappingURL=googleSearchApi.d.ts.map