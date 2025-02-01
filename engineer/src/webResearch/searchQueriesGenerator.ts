import { PsAiModelType, PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

export class SearchQueriesGenerator extends PolicySynthAgent {
  systemPrompt: string;
  userPrompt: string;
  override memory: PsEngineerMemoryData;

  constructor(
    memory: PsEngineerMemoryData,
    agent: PsAgent,
    startProgress: number,
    endProgress: number,
    numberOfQueriesToGenerate: number,
    instructions: string
  ) {
    super(agent, memory, startProgress, endProgress);
    this.memory = memory;

    this.systemPrompt = `Inspired by the instructions below and our project details, generate ${numberOfQueriesToGenerate} high quality search queries that will then be used in Google or Bing search.

<OverallProjectDetails>
${this.memory.taskTitle ? `<OverallTaskTitle>
${this.memory.taskTitle}
</OverallTaskTitle>` : ""}

${this.memory.taskDescription ? `<OverallTaskDescription>
${this.memory.taskDescription}
</OverallTaskDescription>` : ""}

${this.memory.taskInstructions ? `<OverallTaskInstructions>
${this.memory.taskInstructions}
</OverallTaskInstructions>` : ""}
${
  this.memory.likelyRelevantNpmPackageDependencies?.length
    ? `Likely relevant npm dependencies:
${this.memory.likelyRelevantNpmPackageDependencies.join('\n')}`
    : ""
}
</OverallProjectDetails>

<CurrentDate>
${new Date().getDate()}. ${new Date().toLocaleString("en-US", { month: "long" })} ${new Date().getFullYear()}
</CurrentDate>

Always output as a JSON array of strings, where each string is a high quality search query:
  [searchQuery1, searchQuery2, ...]
Only output the JSON array with no explanations.
    `;

    this.userPrompt = `User instructions: ${instructions}

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
    return await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Large,
      await this.renderMessages()
    );
  }
}
