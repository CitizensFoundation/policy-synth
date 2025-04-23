import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import axios from "axios";
import { LicenseDeepResearchAgent } from "./licenceDeepResearch.js";
export class AuthoritativeSourceFinderAgent extends PolicySynthAgent {
    constructor(agent, memory, start, end) {
        super(agent, memory, start, end);
    }
    async findSource(license) {
        const { link, licenseType } = license;
        this.logger.debug(`Finding authoritative source for ${JSON.stringify(license, null, 2)}`);
        // 1a. Validate provided link (if any)
        if (link) {
            try {
                const headResp = await axios.head(link, { maxRedirects: 5, timeout: 10000 });
                if (headResp.status < 400) {
                    this.logger.debug(`Validated existing link for ${licenseType}: ${link}`);
                    return link;
                }
            }
            catch (_) {
                this.logger.warn(`Existing link failed validation for ${licenseType}: ${link}`);
            }
        }
        // 1b. Targeted web search using LicenseWebResearchAgent
        const webResearchCfg = {
            numberOfQueriesToGenerate: 6,
            percentOfQueriesToSearch: 1,
            percentOfResultsToScan: 0.5,
            maxTopContentResultsToUse: 20,
            maxItemsToAnalyze: 10,
        };
        const researcher = new LicenseDeepResearchAgent(this.agent, this.memory, this.startProgress, this.endProgress);
        const query = `${licenseType} license requirements New Jersey`; // simple seed – in practice generate multiple
        await researcher.updateRangedProgress(0, `Searching authoritative source for ${licenseType}`);
        const results = (await researcher.doWebResearch({ ...webResearchCfg, overrideQueries: [query] }));
        // pick the first .gov result if available
        const authoritative = results.find((r) => /\.nj\.gov|njconsumeraffairs\.gov/.test(r.url)) || results[0];
        await researcher.updateRangedProgress(100, `Found authoritative source for ${licenseType}: ${authoritative?.url}`);
        return authoritative?.url;
    }
}
//# sourceMappingURL=authorativeSourceFinder.js.map