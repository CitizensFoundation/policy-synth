import { PsAgentFactoryBaseWebResearchAgent } from "./baseResearchAgent.js";

export class PsAgentFactoryExamplesWebResearchAgent extends PsAgentFactoryBaseWebResearchAgent {
  searchInstructions = "Extract typescript source code examples from web pages for a the task given by the user and npm modules. Always output with full context or instructions, if any, in markdown.";
  scanType: PsAgentFactoryWebResearchTypes = "codeExamples";
}