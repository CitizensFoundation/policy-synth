import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
interface Item {
    title: string;
    description: string;
    whyIsSubProblemImportant: string;
    yearPublished?: number;
}
export declare class PsSubProblemsReportGenerator extends BaseProblemSolvingAgent {
    private summaryCount;
    constructor(memoryData: PSMemoryData);
    renderPairwiseChoicesPrompt(items: Item[], previousSummary: string | undefined): Promise<Array<HumanMessage | SystemMessage>>;
    renderSummaryPrompt50(items: Item[], previousSummary: string | undefined): Promise<Array<HumanMessage | SystemMessage>>;
    renderSummaryPrompt25(items: Item[], previousSummary: string | undefined): Promise<Array<HumanMessage | SystemMessage>>;
    renderSummaryPrompt(items: Item[], previousSummary: string | undefined): Promise<Array<HumanMessage | SystemMessage>>;
    summarizeItems(items: Item[], previousSummary: string | undefined): Promise<string>;
    processCSV(filePath: string): Promise<string>;
    processItemsInBatches(items: Item[]): Promise<string>;
    process(): Promise<void>;
}
export {};
//# sourceMappingURL=subProblemRootCausesReport.d.ts.map