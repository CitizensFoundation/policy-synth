import { PolicySynthAgentBase } from "../../baseAgent.js";
export declare class BingSearchApi extends PolicySynthAgentBase {
    private SUBSCRIPTION_KEY;
    constructor();
    search(query: string): Promise<PsSearchResultItem[]>;
}
//# sourceMappingURL=bingSearchApi.d.ts.map