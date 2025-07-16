import { BaseDeepResearchAgent } from "../jobDescriptions/deepResearch/baseResearchAgent.js";

export class JobTitleDeepResearchAgent extends BaseDeepResearchAgent {
  override scanType: DeepResearchWebResearchTypes = "jobDescription";

  licenseType: string = ""; // reused for job title

  searchInstructions = `Search for all New Jersey and U.S. laws, including statutes, regulations, administrative code provisions, formal policy documents, court decisions, or similar official legally binding documents
   produced by New Jersey government or the U.S. government that describe or otherwise contain mandatory education requirement for the job title. Include  materials from non-government sources only if they include a citation
   or direct reference to an official government source.`;

  rankingInstructions = `Prioritize results that explicitly mention legal or regulatory education requirements for the job title.`;

  attributeNameToUseForDedup = "url";

  scanningSystemPrompt: string = `Analyze the provided search results snippets for the query "${this.searchInstructions}". Identify the single most promising paragraph detailing
  the education requirements for '${this.licenseType}'.

  Output JSON with: {
    hasDegreeRequirement: boolean;
    textFromParagraphExplainingRequirement: string;
  }`;
}
