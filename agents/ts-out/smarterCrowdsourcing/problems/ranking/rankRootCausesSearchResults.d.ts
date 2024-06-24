import { RankRootCausesSearchQueriesProcessor } from "./rankRootCausesSearchQueries.js";
export declare class RankRootCausesSearchResultsProcessor extends RankRootCausesSearchQueriesProcessor {
    voteOnPromptPair(index: number, promptPair: number[]): Promise<PsPairWiseVoteResults>;
    process(): Promise<void>;
}
//# sourceMappingURL=rankRootCausesSearchResults.d.ts.map