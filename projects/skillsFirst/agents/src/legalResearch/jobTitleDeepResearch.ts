import { BaseDeepResearchAgent } from "./deepResearch/baseResearchAgent.js";

export class JobTitleDeepResearchAgent extends BaseDeepResearchAgent {
  override scanType: DeepResearchWebResearchTypes = "jobDescription";

  jobTitle = "";

  searchInstructions = "";
  rankingInstructions = "";

  attributeNameToUseForDedup = "url";

  private updatePrompts(jobTitle: string) {
    this.jobTitle = jobTitle;
    this.searchInstructions = `Search for all New Jersey and U.S. laws, including statutes, regulations, administrative code provisions, formal policy documents,
    court decisions, or similar official legally binding documents produced by New Jersey government that describe or otherwise contain
    mandatory education requirement for the New Jersey State Government job with <jobTitle>${jobTitle}</jobTitle>`;
    this.rankingInstructions = `Prioritize results likely to contain legal or regulatory education requirements for the New Jersey State Government job with <jobTitle>${jobTitle}</jobTitle>.`;
  }

  get scanningSystemPrompt(): string {
    return `You are an expert analyst specializing in New Jersey employment degree requirements for state jobs in New Jersey.
    Your task is to determine if the <jobTitle>${this.jobTitle}</jobTitle> for a job at the State of New Jersey requires a college degree or higher based *only* on the provided text context.

    The statedDegreeRequirement should only be related to the <jobTitle>${this.jobTitle}</jobTitle>, a state job, and should be a clear and explicit degree requirement in the text context.

    Only fill out statedDegreeRequirement if there is a clear and explicit degree requirement in the text context for the state job.

    If no stated degree requirement is found anywhere in the text context, return an empty array.

    Return your analysis strictly as JSON in the following format:
    [
     {
      statedDegreeRequirement: string;
      degreeRequirementType: "Associate's degree" | "Bachelor's degree" | "Master's degree" | "Doctoral degree" | "Other";
      typeOfOfficialDocument: "regulation" | "statute" | "classification" | "policy" | "courtDecision" | "other";
      reasoning: string;
     }
    ]`;
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
