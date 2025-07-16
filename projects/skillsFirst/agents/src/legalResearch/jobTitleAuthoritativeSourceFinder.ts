import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { JobTitleDeepResearchAgent } from "./jobTitleDeepResearch.js";

export class JobTitleAuthoritativeSourceFinderAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    start: number,
    end: number
  ) {
    super(agent, memory, start, end);
  }

  async findSources(jobTitle: string): Promise<string[]> {
    this.logger.debug(`Finding authoritative sources for ${jobTitle}`);

    const webResearchCfg: any = {
      numberOfQueriesToGenerate: 4,
      percentOfQueriesToSearch: 0.5,
      percentOfResultsToScan: 0.5,
      maxTopContentResultsToUse: 5,
      maxItemsToAnalyze: 5,
    };

    const researcher = new JobTitleDeepResearchAgent(
      this.agent,
      this.memory,
      this.startProgress,
      this.endProgress
    );
    const query = `${jobTitle} education requirements New Jersey`;

    await researcher.updateRangedProgress(
      0,
      `Searching authoritative source for ${jobTitle}`
    );

    const results = (await researcher.doWebResearch(jobTitle, {
      ...webResearchCfg,
      overrideQueries: [query],
    })) as { url: string }[];

    return results.map((r) => r.url);
  }
}
