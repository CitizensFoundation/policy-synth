import { BaseDeepResearchAgent } from "../jobDescriptions/deepResearch/baseResearchAgent.js";

export class JobTitleDeepResearchAgent extends BaseDeepResearchAgent {
  override scanType: DeepResearchWebResearchTypes = "jobDescription";

  licenseType: string = ""; // reused for job title

  searchInstructions = `Search for official statutes, regulations, or government job classification documents that describe mandatory education requirements for the job title.`;

  rankingInstructions = `Prioritize results that explicitly mention legal or regulatory education requirements for the job title.`;

  attributeNameToUseForDedup = "url";

  scanningSystemPrompt: string = `Analyze the provided search results snippets for the query "${this.searchInstructions}". Identify the single most promising official source URL detailing the education requirements for '\${this.licenseType}'. Output ONLY the URL. If no authoritative source is found, output "NOT_FOUND".`;
}
