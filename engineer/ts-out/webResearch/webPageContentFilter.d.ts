import { PsEngineerBaseProgrammingAgent } from "../programming/baseAgent.js";
export declare class PsEngineerWebContentFilter extends PsEngineerBaseProgrammingAgent {
    memory: PsEngineerMemoryData;
    constructor(memory: PsEngineerMemoryData);
    get filterSystemPrompt(): string;
    filterUserPrompt(contentToEvaluate: string): string;
    filterContent(webContentToFilter: string[]): Promise<string[]>;
}
//# sourceMappingURL=webPageContentFilter.d.ts.map