import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { GetWebPagesBaseAgent } from "@policysynth/agents/deepResearch/getWebPagesBase.js";
export declare class WebPageScanner extends GetWebPagesBaseAgent {
    memory: JobDescriptionMemoryData;
    scanType?: DeepResearchWebResearchTypes;
    instructions: string;
    systemMessage: string;
    totalPagesSave: number;
    collectedWebPages: any[];
    get modelTemperature(): number;
    urlToCrawl: string | undefined;
    constructor(agent: PsAgent, memory: JobDescriptionMemoryData, startProgress: number, endProgress: number, instructions: string, systemMessage: string);
    sanitizeInput(text: string): string;
    renderDeepScanningPrompt(text: string): PsModelMessage[];
    processPageAnalysis(text: string): Promise<any>;
    scan(listOfUrls: string[], scanType: DeepResearchWebResearchTypes, urlToCrawl?: string | undefined): Promise<any[]>;
}
//# sourceMappingURL=webPageScanner.d.ts.map