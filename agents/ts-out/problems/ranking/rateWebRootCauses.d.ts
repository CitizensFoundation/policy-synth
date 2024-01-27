import { BaseProlemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { RootCauseWebPageVectorStore } from "../../vectorstore/rootCauseWebPage.js";
export declare class RateWebRootCausesProcessor extends BaseProlemSolvingAgent {
    rootCauseWebPageVectorStore: RootCauseWebPageVectorStore;
    simplifyRootCauseType(rootCauseType: string): string;
    renderProblemPrompt(rawWebData: PSRootCauseRawWebPageData, rootCausesToRank: string[], rootCauseType: keyof PSRootCauseRawWebPageData): Promise<(SystemMessage | HumanMessage)[]>;
    rateWebRootCauses(): Promise<void>;
    process(): Promise<void>;
}
//# sourceMappingURL=rateWebRootCauses.d.ts.map