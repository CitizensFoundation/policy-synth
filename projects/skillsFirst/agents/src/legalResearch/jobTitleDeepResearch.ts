import { BaseDeepResearchAgent } from "./deepResearch/baseResearchAgent.js";

export class JobTitleDeepResearchAgent extends BaseDeepResearchAgent {
  override scanType: DeepResearchWebResearchTypes = "jobDescription";

  jobTitle = "";

  searchInstructions = "";
  rankingInstructions = "";

  attributeNameToUseForDedup = "url";

  private updatePrompts(jobTitle: string) {
    this.jobTitle = jobTitle;
    this.jobTitle = jobTitle;
    this.searchInstructions = `Search for all New Jersey and U.S. laws, including statutes, regulations, administrative code provisions, formal policy documents, court decisions, or similar official legally binding documents produced by New Jersey government or the U.S. government that describe or otherwise contain mandatory education requirement for '${jobTitle}'. Include  materials from non-government sources only if they include a citation or direct reference to an official government source.`;
    this.rankingInstructions = `Prioritize results that explicitly mention legal or regulatory education requirements for '${jobTitle}'.`;
  }

  get scanningSystemPrompt(): string {
    return `Analyze the provided search results snippets for the query "${this.searchInstructions}". Identify the single most promising paragraph detailing
    the education requirements for '${this.jobTitle}'.

    Output JSON with: {
      requirementSummary: string;
      reasoning: string;
      confidenceScore: number;
      hasDegreeRequirement: boolean;
    }`;
  }

  async doWebResearch(jobTitle: string, config: any) {
    this.updatePrompts(jobTitle);
    const results = (await super.doWebResearch(jobTitle, config)) as any[];
    if (Array.isArray(results)) {
      return results.map((r) =>
        typeof r === "object" && r !== null ? { jobTitle, ...r } : r
      );
    }
    return results;
  }
}
