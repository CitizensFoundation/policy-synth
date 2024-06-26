import { BaseSmarterCrowdsourcingAgent } from "../../../baseAgent.js";
interface Item {
    title: string;
    description: string;
    whyIsSubProblemImportant: string;
    yearPublished?: number;
}
export declare class PsSubProblemsReportGenerator extends BaseSmarterCrowdsourcingAgent {
    private summaryCount;
    constructor(memoryData: PSMemoryData);
    renderPairwiseChoicesPrompt(items: Item[], previousSummary: string | undefined): Promise<Array<PsModelMessage>>;
    renderSummaryPrompt50(items: Item[], previousSummary: string | undefined): Promise<Array<PsModelMessage>>;
    renderSummaryPrompt(items: Item[], previousSummary: string | undefined): Promise<Array<PsModelMessage>>;
    renderSummaryPromptNovel(items: Item[], previousSummary: string | undefined): Promise<Array<PsModelMessage>>;
    summarizeItems(items: Item[], previousSummary: string | undefined): Promise<string>;
    processCSV(filePath: string): Promise<string>;
    processItemsInBatches(items: Item[]): Promise<string>;
    process(): Promise<void>;
}
export {};
//# sourceMappingURL=subProblemRootCausesReport.d.ts.map