import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { PsConstants } from "@policysynth/agents/constants.js";
import { ChatOpenAI } from "@langchain/openai";

import { PsEngineerBaseProgrammingAgent } from "../programming/baseAgent.js";

export class PsEngineerWebContentFilter extends PsEngineerBaseProgrammingAgent {
  override memory: PsEngineerMemoryData;

  constructor(memory: PsEngineerMemoryData) {
    super(memory);
    this.memory = memory;
    this.chat = new ChatOpenAI({
      temperature: 0.0,
      maxTokens: 3,
      modelName: "gpt-4o",
      verbose: true,
    });
  }

  get filterSystemPrompt() {
    return `Your are an expert software engineering analyzer.

      Instructions:
      1. Review the task name, description and instructions.
      2. You will see content from the web to decide if it's relevant to the task or not, to help inform the programming of this task.
      3. If ther content to evalute is empty just answer No
      4. Only answer with: Yes or No if the content is relevant or not to the task.
    `;
  }

  filterUserPrompt(contentToEvaluate: string) {
    return `Overall task title:
    ${this.memory.taskTitle}

    Overall task description:
    ${this.memory.taskDescription}

    Overall task instructions: ${this.memory.taskInstructions}

    ${
      this.memory.likelyRelevantNpmPackageDependencies?.length > 0
        ? `Likely relevant npm dependencies:\n${this.memory.likelyRelevantNpmPackageDependencies.join(
            `\n`
          )}`
        : ``
    }

    Content to evaluate for relevance to the task:
    ${contentToEvaluate}

    Is the content relvant to the task? Yes or No: `;
  }

  async filterContent(webContentToFilter: string[]) {
    const filteredContent = [];
    for (const content of webContentToFilter) {
      if (content && content.trim().length>70) {
        const analyzisResults = (await this.callLLM(
          "engineering-agent",
          PsConstants.engineerModel,
          [
            new SystemMessage(this.filterSystemPrompt),
            new HumanMessage(this.filterUserPrompt(content)),
          ],
          false
        )) as string;
        if (analyzisResults.trim() === "Yes") {
          filteredContent.push(content);
        } else {
          console.log(`--------!!!!> Content is not relevant to the task: ${content}`);
        }
      } else {
        console.log("Removing empty content from the list of content to filter.")
      }
    }
    return filteredContent;
  }
}
