import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import axios from "axios";
import * as cheerio from "cheerio";
import * as xlsx from "xlsx";
import { LicenseDeepResearchAgent } from "./licenceDeepResearch.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

export class AuthoritativeSourceFinderAgent extends PolicySynthAgent {
  declare memory: LicenseDegreeAnalysisMemoryData;

  constructor(agent: PsAgent, memory: LicenseDegreeAnalysisMemoryData, start: number, end: number) {
    super(agent, memory, start, end);
  }

  async findSource(row: LicenseDegreeRow): Promise<string | undefined> {
    const { licenseLink, licenseType } = row;

    this.logger.debug(`Finding authoritative source for ${JSON.stringify(row, null, 2)}`);

    // 1a. Validate provided link (if any)
    if (licenseLink) {
      try {
        const headResp = await axios.head(licenseLink, { maxRedirects: 5, timeout: 10000 });
        if (headResp.status < 400) {
          this.logger.debug(`Validated existing link for ${licenseType}: ${licenseLink}`);
          return licenseLink;
        }
      } catch (_) {
        this.logger.warn(`Existing link failed validation for ${licenseType}: ${licenseLink}`);
      }
    }

    // 1b. Targeted web search using LicenseWebResearchAgent
    const webResearchCfg: any = {
      numberOfQueriesToGenerate: 6,
      percentOfQueriesToSearch: 1,
      percentOfResultsToScan: 0.5,
      maxTopContentResultsToUse: 20,
      maxItemsToAnalyze: 10,
    };

    const researcher = new LicenseDeepResearchAgent(this.agent, this.memory as any, this.startProgress, this.endProgress);
    const query = `${licenseType} license requirements ${row.issuingAuthorityForDeepResearch}`; // simple seed – in practice generate multiple

    await researcher.updateRangedProgress(0, `Searching authoritative source for ${licenseType}`);

    const results = (await researcher.doWebResearch({ ...webResearchCfg, overrideQueries: [query] })) as { url: string }[];

    // pick the first .gov result if available
    const authoritative = results.find((r) => /\.nj\.gov|njconsumeraffairs\.gov/.test(r.url)) || results[0];

    await researcher.updateRangedProgress(100, `Found authoritative source for ${licenseType}: ${authoritative?.url}`);

    return authoritative?.url;
  }
}
