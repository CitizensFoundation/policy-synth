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

  async findSources(row: LicenseDegreeRow): Promise<string[] | undefined> {
    const { licenseType } = row;

    this.logger.debug(`Finding authoritative sources for ${JSON.stringify(row, null, 2)}`);

    // 1b. Targeted web search using LicenseWebResearchAgent
    const webResearchCfg: any = {
      numberOfQueriesToGenerate: 6,
      percentOfQueriesToSearch: 0.3,
      percentOfResultsToScan: 0.3,
      maxTopContentResultsToUse: 10,
      maxItemsToAnalyze: 10,
    };

    const researcher = new LicenseDeepResearchAgent(this.agent, this.memory as any, this.startProgress, this.endProgress);
    const query = `${licenseType} license requirements ${row.issuingAuthorityForDeepResearch}`;

    await researcher.updateRangedProgress(0, `Searching authoritative source for ${licenseType}`);

    const results = (await researcher.doWebResearch(licenseType, { ...webResearchCfg, overrideQueries: [query] })) as { url: string }[];

    return results.map((r) => r.url);
  }
}
