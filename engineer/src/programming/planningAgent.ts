import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { IEngineConstants } from "@policysynth/agents/constants.js";

import { Project } from "ts-morph";

import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";

export class PsEngineerProgrammingPlanningAgent extends PsEngineerBaseProgrammingAgent {
  planSystemPrompt() {
    return `You are an expert software engineering analyzer.

    Instructions:
    1. Review the file name and its current contents.
    2. Consider the overall task title, description, and instructions.
    3. Create a detailed, step-by-step coding plan that specifies the code changes needed to accomplish the task.
    4. Do not include documentation tasks, that is already done automatically, focus on the programming changes.

    Expected Output:
    Provide a detailed step-by-step plan in natural language or pseudo-code, explaining the changes to be made, why they are necessary, and how they should be implemented.
    `;
  }

  getUserPlanPrompt(fileName: string, reviewLog: string) {
    return `File to plan changes for:
    ${fileName}

    Current file contents:
    ${this.currentFileContents}

    Overall task title:
    ${this.memory.taskTitle}

    Overall task description:
    ${this.memory.taskDescription}

    Overall task instructions:
    ${this.memory.taskInstructions}

    ${
      this.documentationFilesInContextContent
        ? `Local documentation:\n${this.documentationFilesInContextContent}`
        : ``
    }

    ${
      reviewLog
        ? `<LastReviewOnThisPlan>${reviewLog}</LastReviewOnThisPlan>`
        : ``
    }

    Please provide a detailed, step-by-step coding plan based on the information above. Include rationale for each change and suggestions on how to implement them.
    `;
  }

  reviewSystemPrompt() {
    return `You are an expert software engineering analyzer.

    Instructions:
    1. Review the proposed coding plan.
    2. Assess its feasibility, correctness, and completeness.
    3. Provide detailed feedback if you find issues or approve the plan if it meets the criteria with the words "Coding plan looks good".
    4. Plan should not include documentation tasks, that is already done automatically, focus on the programming changes.
    5. If the plan is good only output "Coding plan looks good" or "No changes needed to this code".

    Expected Output:
    Provide feedback on the coding plan. If the plan is not suitable, suggest necessary adjustments. If the plan is acceptable, confirm that it is ready for implementation.
    `;
  }

  getUserReviewPrompt(fileName: string, codingPlan: string, reviewLog: string) {
    return `File to review:
    ${fileName}

    Current file contents:
    ${this.currentFileContents}

    Overall task title:
    ${this.memory.taskTitle}

    Overall task description:
    ${this.memory.taskDescription}

    Overall task instructions:
    ${this.memory.taskInstructions}

    ${
      this.documentationFilesInContextContent
        ? `Local documentation:\n${this.documentationFilesInContextContent}`
        : ``
    }

    Proposed coding plan:
    ${codingPlan}

    Please review the coding plan for feasibility, correctness, and completeness. Provide detailed feedback on each step of the plan or confirm its readiness for implementation. Mention specific areas for improvement if any.
    `;
  }

  async getCodingPlan(
    fileName: string,
    otherFilesToKeepInContextContent: string | undefined,
    documentationFilesInContextContent: string | undefined,
    tsMorphProject: Project
  ) {
    this.otherFilesToKeepInContextContent = otherFilesToKeepInContextContent;
    this.documentationFilesInContextContent =
      documentationFilesInContextContent;
    this.tsMorphProject = tsMorphProject;

    let planReady = false;
    let planRetries = 0;
    let reviewLog = "";
    let codingPlan: string | undefined;
    this.currentFileContents = this.loadFileContents(fileName);
    this.otherLikelyToChangeFilesContents =
      this.memory.typeScriptFilesLikelyToChange
        .filter((file) => file !== fileName)
        .map((file) => this.loadFileContents(file))
        .join("\n");

    while (!planReady && planRetries < this.maxRetries) {
      console.log(
        `Getting coding plan for ${fileName} attempt ${planRetries + 1}`
      );
      codingPlan = await this.callLLM(
        "engineering-agent",
        IEngineConstants.engineerModel,
        [
          new SystemMessage(this.planSystemPrompt()),
          new HumanMessage(this.getUserPlanPrompt(fileName, reviewLog)),
        ],
        false
      );

      if (codingPlan) {
        console.log(`Coding plan received: ${codingPlan}`);
        const review = await this.callLLM(
          "engineering-agent",
          IEngineConstants.engineerModel,
          [
            new SystemMessage(this.reviewSystemPrompt()),
            new HumanMessage(
              this.getUserReviewPrompt(fileName, codingPlan, reviewLog)
            ),
          ],
          false
        );

        if (
          (review && review.indexOf("Coding plan looks good") > -1) ||
          review.indexOf("No changes needed to this code") > -1
        ) {
          planReady = true;
          console.log("Coding plan approved");
        } else {
          reviewLog = review + `\n`;
          planRetries++;
        }
      } else {
        console.error("No plan received");
        planRetries++;
      }
    }

    return codingPlan;
  }
}
