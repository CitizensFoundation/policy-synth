import { PolicySynthSimpleAgentBase } from "../base/simpleAgent.js";
export declare class BingSearchApi extends PolicySynthSimpleAgentBase {
    private SUBSCRIPTION_KEY;
    constructor();
    search(query: string): Promise<PsSearchResultItem[]>;
}
//# sourceMappingURL=bingSearchApi.d.ts.map