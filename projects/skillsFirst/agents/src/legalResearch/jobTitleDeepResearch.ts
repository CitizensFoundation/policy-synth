import { BaseDeepResearchAgent } from "./deepResearch/baseResearchAgent.js";

export class JobTitleDeepResearchAgent extends BaseDeepResearchAgent {
  override scanType: DeepResearchWebResearchTypes = "jobDescription";

  jobTitle = "";

  searchInstructions = "";
  rankingInstructions = "";

  attributeNameToUseForDedup = "url";

  private updatePrompts(jobTitle: string) {
    this.jobTitle = jobTitle;
    this.searchInstructions = `Search for all New Jersey and U.S. laws, including statutes, regulations, administrative code provisions, formal policy documents, court decisions, or similar official legally binding documents produced by New Jersey government or the U.S. government that describe or otherwise contain mandatory education requirement for '${jobTitle}'. Include  materials from non-government sources only if they include a citation or direct reference to an official government source.`;
    this.rankingInstructions = `Prioritize results that explicitly mention legal or regulatory education requirements for '${jobTitle}'.`;
  }

  get scanningSystemPrompt(): string {
    return `You are an expert analyst specializing in New Jersey employment regulations.
    Your task is to determine if the job title "${this.jobTitle}" requires a college degree based *only* on the provided text from an official source (statute, regulation, classification document, etc.).
    Focus solely on educational prerequisites for holding the job. Summarize any explicit or implicit degree requirement. If none is found, state that no degree requirement is mentioned.
    Return your analysis strictly as JSON in the following format:
    {
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
