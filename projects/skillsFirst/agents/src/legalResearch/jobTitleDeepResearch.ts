import { BaseDeepResearchAgent } from "./deepResearch/baseResearchAgent.js";

export class JobTitleDeepResearchAgent extends BaseDeepResearchAgent {
  override scanType: DeepResearchWebResearchTypes = "jobDescription";

  jobTitle = "";

  searchInstructions = "";
  rankingInstructions = "";

  attributeNameToUseForDedup = "url";

  private updatePrompts(jobTitle: string) {
    this.jobTitle = jobTitle;
    this.searchInstructions = `Search for New Jersey laws, statutes, regulations, administrative code provisions, formal policy documents,
    court decisions, or similar official legally binding documents produced by New Jersey government that describe or otherwise contain
    mandatory education requirement for the New Jersey State Government job with the <jobTitle>${jobTitle}</jobTitle> focus on New Jersey sources but also sources like law.cornell.edu, courtlistener.com are acceptable that have actual NJ laws.`;
    this.rankingInstructions = `Prioritize results likely to contain legal or regulatory education requirements for the New Jersey State Government job with <jobTitle>${jobTitle}</jobTitle>.
    Official and relevant New Jersey government sources are preferred but also websites like law.cornell.edu, courtlistener.com are acceptable that have actual NJ laws.`;
  }

  get scanningSystemPrompt(): string {
    return `You are an expert analyst specializing in New Jersey employment degree requirements for state jobs in New Jersey. Your task is to determine if the <jobTitle>${this.jobTitle}</jobTitle> for a job at the State of New Jersey requires a college degree or higher based *only* on the provided <SourceText> for that job title.

Analyze the <SourceText> provided below for the job title: <jobTitle>${this.jobTitle}</jobTitle>.

Focus solely on *educational prerequisites* for the job title: <jobTitle>${this.jobTitle}</jobTitle>.

Do not consider experience substitutions unless they explicitly replace the *entire* educational requirement.

Determine the minimum degree requirement based on the following hierarchy and definitions:

1.  **Explicit Graduate/Professional:** Text explicitly requires a Master's, Doctorate, professional degree (JD, MD, PharmD, DVM etc.), or graduation from a specific post-baccalaureate professional school (e.g., "accredited law school", "medical school").
2.  **Explicit Bachelor's:** Text explicitly requires a "bachelor's degree", "baccalaureate degree", "4-year degree", or graduation from a program *typically* requiring a bachelor's (e.g., "ABET-accredited engineering program" often implies a BS).
3.  **Explicit Associate's:** Text explicitly requires an "associate's degree", "2-year degree", or graduation from a program *typically* awarding an associate's (e.g., "accredited associate degree nursing program").
4.  **Implicit Bachelor's:** Text requires a graduate/professional degree (see #1) which inherently presupposes a Bachelor's, *unless* it's explicitly stated an alternative path exists *without* a prior bachelor's (rare). Flag this as "Implicit Bachelor's". Also consider requirements like "graduation from an accredited 4-year [Type] program" if the degree name isn't mentioned but the duration/accreditation implies it.
5.  **Implicit Associate's:** Text requires graduation from a program *clearly* identifiable as associate-level (e.g., "completion of a 2-year registered nursing program") even if the word "associate's" isn't used.
6.  **No Degree Found:** The text details requirements (like high school diploma, specific training courses, experience, exams) but mentions *no* requirement for an Associate's, Bachelor's, or Graduate/Professional degree, either explicitly or implicitly through program descriptions. High school diploma or GED requirements fall into this category. Specific non-degree training hours (e.g., 1500 hours of cosmetology training) also fall here.
7.  **Could Not Determine:** The text is ambiguous, contradictory, or lacks sufficient detail about educational requirements to make a confident determination.
`;
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
