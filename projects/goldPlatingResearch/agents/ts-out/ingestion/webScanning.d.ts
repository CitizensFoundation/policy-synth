import { Page } from "puppeteer";
import { BaseGetWebPagesOperationsAgent } from "@policysynth/agents/webResearch/getWebPagesOperations.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
export declare class WebScanningAgent extends BaseGetWebPagesOperationsAgent {
    memory: GoldPlatingMemoryData;
    modelSize: PsAiModelSize;
    constructor(agent: PsAgent, memory: GoldPlatingMemoryData, startProgress: number, endProgress: number);
    processItem(researchItem: GoldplatingResearchItem): Promise<void>;
    private collectUrls;
    scan(listOfUrls: string[]): Promise<void>;
    getAndProcessPage(subProblemIndex: number | undefined, url: string, browserPage: Page, type: any, entityIndex: number | undefined): Promise<boolean>;
    processPageText(text: string, subProblemIndex: number | undefined, url: string, type: any, entityIndex: number | undefined, policy?: any | undefined): Promise<void>;
    private updateResearchItem;
}
//# sourceMappingURL=webScanning.d.ts.map