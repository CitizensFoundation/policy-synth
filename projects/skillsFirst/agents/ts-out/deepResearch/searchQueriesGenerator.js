import { PsAiModelSize, PsAiModelType, } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
export class SearchQueriesGenerator extends PolicySynthAgent {
    systemPrompt;
    userPrompt;
    memory;
    licenseType;
    constructor(agent, memory, numberOfQueriesToGenerate, instructions, startProgress, endProgress, licenseType) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
        this.licenseType = licenseType;
        this.systemPrompt = `Inspired by the instructions below and our deep research plan, generate ${numberOfQueriesToGenerate} high quality search queries that will then be used with Google Search.

      <OurResearchPlan>
      ${this.memory.researchPlan}
      </OurResearchPlan>

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

      Look for licensing requirements for the following license type: ${licenseType}

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
    async generateSearchQueries() {
        this.logger.debug(`User prompt is: ${this.userPrompt}`);
        return await this.callModel(PsAiModelType.Text, PsAiModelSize.Large, await this.renderMessages());
    }
}
//# sourceMappingURL=searchQueriesGenerator.js.map