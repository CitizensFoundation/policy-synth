import { BaseDeepResearchAgent } from "../deepResearch/baseResearchAgent.js";

export class LicenseDeepResearchAgent extends BaseDeepResearchAgent {
  override scanType: DeepResearchWebResearchTypes = "licenseSource";

  licenseType: string = "";

  searchInstructions = `Search for authoritative webpages (statutes, regulations, or New Jersey board pages) that describe licensing requirements.`;

  rankingInstructions = `The most important content we are looking for contains texts connected to professional licensing education requirements.`;

  attributeNameToUseForDedup = "url";

  get scanningSystemPrompt(): string {
    return `Analyze the provided search results snippets for the query "${this.searchInstructions}". \
  Identify the single most promising URL pointing directly to the official New Jersey statute, regulation, or licensing board page detailing \
  the requirements for a '${this.licenseType}'. Output ONLY the URL. If no single authoritative URL is clearly identified, output "NOT_FOUND".`;
  }
}
