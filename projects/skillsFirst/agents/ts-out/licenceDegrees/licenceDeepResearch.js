import { BaseDeepResearchAgent } from "../deepResearch/baseResearchAgent.js";
export class LicenseDeepResearchAgent extends BaseDeepResearchAgent {
    scanType = "licenseSource";
    licenseType = "";
    searchInstructions = `Search for authoritative webpages (statutes, regulations, or New Jersey board pages) that describe licensing requirements.`;
    rankingInstructions = `Rank result One higher if it is a .nj.gov or .njconsumeraffairs.gov domain, or if the page contains statutory or regulatory text.`;
    attributeNameToUseForDedup = "url";
    scanningSystemPrompt = `Analyze the provided search results snippets for the query "${this.searchInstructions}". \
  Identify the single most promising URL pointing directly to the official New Jersey statute, regulation, or licensing board page detailing \
  the requirements for a '${this.licenseType}'. Output ONLY the URL. If no single authoritative URL is clearly identified, output "NOT_FOUND".`;
}
//# sourceMappingURL=licenceDeepResearch.js.map