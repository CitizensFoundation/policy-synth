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
mandatory education requirement for the New Jersey State Government job with the <jobTitle>${jobTitle}</jobTitle> focus on New Jersey official sources.`;

    this.rankingInstructions = `Prioritize results likely to contain legal sources over job descriptions. Statutes, regulations, administrative code provisions, formal policy documents,
court decisions, or similar official legally binding documents produced by New Jersey government that describe or otherwise contain education requirements for the New Jersey State Government job with <jobTitle>${jobTitle}</jobTitle>.
Official and relevant New Jersey government sources are preferred but also law.cornell.edu, justia.com & courtlistener.com.`;
  }

  get scanningSystemPrompt(): string {
    return `You are an expert analyst specializing in New Jersey employment degree requirements for state jobs in New Jersey.

<jobTitle>${this.jobTitle}</jobTitle>.

Analyze the <SourceText> for explicit or implicit minimum education requirements for the job title <jobTitle>${this.jobTitle}</jobTitle>.

Determine the minimum degree requirement for the job title based on the following hierarchy and definitions:

1.  **Explicit Graduate/Professional:** Text explicitly requires a Master's, Doctorate, professional degree (JD, MD, PharmD, DVM etc.), or graduation from a specific post-baccalaureate professional school (e.g., "accredited law school", "medical school").
2.  **Explicit Bachelor's:** Text explicitly requires a "bachelor's degree", "baccalaureate degree", "4-year degree", or graduation from a program *typically* requiring a bachelor's (e.g., "ABET-accredited engineering program" often implies a BS).
3.  **Explicit Associate's:** Text explicitly requires an "associate's degree", "2-year degree", or graduation from a program *typically* awarding an associate's (e.g., "accredited associate degree nursing program").
4.  **Implicit Bachelor's:** Text requires a graduate/professional degree (see #1) which inherently presupposes a Bachelor's, *unless* it's explicitly stated an alternative path exists *without* a prior bachelor's (rare). Flag this as "Implicit Bachelor's". Also consider requirements like "graduation from an accredited 4-year [Type] program" if the degree name isn't mentioned but the duration/accreditation implies it.
5.  **Implicit Associate's:** Text requires graduation from a program *clearly* identifiable as associate-level (e.g., "completion of a 2-year registered nursing program") even if the word "associate's" isn't used.

Important: Do not output items into the array if there is no explicit or implicit degree requirement for the job title or if the job title is not found in the <SourceText>.
`;
  }

  async doWebResearch(
    cleanedJobTitle: string,
    fullJobTitle: string,
    config: any
  ) {
    this.updatePrompts(cleanedJobTitle);
    const results = (await super.doWebResearch(
      cleanedJobTitle,
      config
    )) as any[];
    if (Array.isArray(results)) {
      return results.map((r) =>
        typeof r === "object" && r !== null
          ? { jobTitle: fullJobTitle, ...r }
          : r
      );
    }
    return results;
  }
}
