import { PsAgentFactoryBaseProgrammingAgent } from "../programming/baseAgent.js";
export declare class PsAgentFactoryWebContentFilter extends PsAgentFactoryBaseProgrammingAgent {
    memory: PsAgentFactoryMemoryData;
    constructor(memory: PsAgentFactoryMemoryData);
    get filterSystemPrompt(): string;
    filterUserPrompt(contentToEvaluate: string): string;
    filterContent(webContentToFilter: string[]): Promise<string[]>;
}
//# sourceMappingURL=webPageContentFilter.d.ts.map