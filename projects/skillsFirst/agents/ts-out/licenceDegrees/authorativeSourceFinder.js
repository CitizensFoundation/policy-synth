import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { LicenseDeepResearchAgent } from "./licenceDeepResearch.js";
export class AuthoritativeSourceFinderAgent extends PolicySynthAgent {
    constructor(agent, memory, start, end) {
        super(agent, memory, start, end);
    }
    async findSources(row) {
        const { licenseType } = row;
        this.logger.debug(`Finding authoritative sources for ${JSON.stringify(row, null, 2)}`);
        // 1b. Targeted web search using LicenseWebResearchAgent
        const webResearchCfg = {
            numberOfQueriesToGenerate: 6,
            percentOfQueriesToSearch: 0.3,
            percentOfResultsToScan: 0.3,
            maxTopContentResultsToUse: 10,
            maxItemsToAnalyze: 10,
        };
        const researcher = new LicenseDeepResearchAgent(this.agent, this.memory, this.startProgress, this.endProgress);
        const query = `${licenseType} license requirements ${row.issuingAuthorityForDeepResearch}`;
        await researcher.updateRangedProgress(0, `Searching authoritative source for ${licenseType}`);
        const results = (await researcher.doWebResearch(licenseType, { ...webResearchCfg, overrideQueries: [query] }));
        return results.map((r) => r.url);
    }
}
//# sourceMappingURL=authorativeSourceFinder.js.map