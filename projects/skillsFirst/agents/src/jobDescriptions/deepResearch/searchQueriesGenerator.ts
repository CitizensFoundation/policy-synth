import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

export class SearchQueriesGenerator extends PolicySynthAgent {
  systemPrompt: string;
  userPrompt: string;
  override memory: JobDescriptionMemoryData;
  licenseType: string;

  constructor(
    agent: PsAgent,
    memory: JobDescriptionMemoryData,
    numberOfQueriesToGenerate: number,
    instructions: string,
    startProgress: number,
    endProgress: number,
    licenseType: string
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;
    this.licenseType = licenseType;
    this.systemPrompt = `Inspired by the instructions below and our deep research plan, generate ${numberOfQueriesToGenerate} high quality search queries that will then be used with Google Search.

      <ProfessionalLicenseType>
      ${this.licenseType}
      </ProfessionalLicenseType>

      ${this.memory.additionalGeneralContext ? this.memory.additionalGeneralContext : ""}

      <CurrentDate>
      ${new Date().getDate()}. ${new Date().toLocaleString("en-US", {
      month: "long",
    })} ${new Date().getFullYear()}
      </CurrentDate>

      Always output as a JSON array of strings, where each string is a high quality search query:
        [searchQuery1, searchQuery2, ...]

      Only output the JSON array with no explainations.
    `;
    this.userPrompt = `User instructions: ${instructions}

      Look for degree requirements for the following license type: ${licenseType}

      Your JSON array output:
    `;

    console.log(`User prompt is: ${this.userPrompt}`);
  }

  async renderMessages() {
    return [
      this.createSystemMessage(this.systemPrompt),
      this.createHumanMessage(this.userPrompt),
    ];
  }

  async generateSearchQueries(): Promise<string[]> {
    this.logger.debug(`User prompt is: ${this.userPrompt}`);
    return await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Large,
      await this.renderMessages()
    );
  }
}
