import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { PsConstants } from "@policysynth/agents/constants.js";

import { Project, StringLiteralLike } from "ts-morph";

import { PsAgentFactoryBaseProgrammingAgent } from "./baseAgent.js";

export class PsAgentFactoryProgrammingPlanningAgent extends PsAgentFactoryBaseProgrammingAgent {
  havePrintedDebugPrompt = false;

  planSystemPrompt() {
    return `You are an expert software engineering analyzer.

    <ImportantInstructions>
    1. Review the provided <Context> and <Task> information.
    2. Consider the overall task title, description, and instructions.
    3. Create a detailed, step-by-step explaination of a coding plan that specifies the code changes needed in text to accomplish the overall task.
    4. Do not write code in the plan rather focus on the programming strategy, a high-level plan for the changes needed for each file.
    5. Do not include test or documentation tasks, we do that seperatly, focus on the programming changes.
    6. We always create or modify typescript .ts files no other file types.
    7. Prefer classes rather than exported functions in files.
    8. Never suggesting importing typedefs those are always automatically imported from the d.ts files
    ${
      this.currentErrors
        ? `9. You have already build the project and now you need a new coding plan to fix errors provided by the user, the coding plan should focus on fixing the errors in the files you have been changing. The project is not compiling because of those recent additions or changes you've made.
           10. Do not add new files with errors to the plan but focus on fixing the errors in the code you just did. We don't want to refactor our whole project.`
        : ``
    }</ImportantInstructions>
    `;
  }

  getUserPlanPrompt(reviewLog: string) {
    return `${this.renderDefaultTaskAndContext()}

    ${this.renderCurrentErrorsAndOriginalFiles()}

    ${
      reviewLog
        ? `Take note --> <ReviewOnYourLastAttemptAtCreatingPlan>${reviewLog}</ReviewOnYourLastAttemptAtCreatingPlan>`
        : ``
    }

    ${this.renderCodingRules()}

    Do not output actual code just a detailed plan of the changes needed to the code.

    Let's think step by step.

    Your coding plan:
    `;
  }

  reviewSystemPrompt() {
    return `You are an expert software engineering analyzer.

    Instructions:
    1. Review the proposed coding plan.
    2. Assess its feasibility, correctness, and completeness.
    3. Provide feedback if you find critical issues or approve the plan if it meets the criteria with the words "Coding plan looks good".
    4. Never create any documentation tasks for the code, that is already done automatically through a seperate process.
    5. We always create and modify typescript .ts files.
    6. There should not be much actual code rather a high-level plan for the changes needed for each file and each task.
    7. The coding plan does not have to include every detail, the goal is to provide a high-level plan for the changes needed for each file and each task.
    8. The plan should not suggest importing typedefs from files those are always automatically imported from the d.ts files
    ${
      this.currentErrors
        ? `9. You have already build the project and now you need a new coding plan to fix errors provided by the user, the coding plan should focus on fixing the errors in the files you have been changing nothing else and don't try to fix other files. The project is not compiling because of those recent changes or additions you've made.
           10. Focus on the file or files with errors do not suggest changing other files except absolutely necessary to fix errors.`
        : ``
    }
    Important: If the plan is good only output "Coding plan looks good" or "No changes needed to this code".
    `;
  }

  getUserReviewPrompt(codingPlan: string) {
    return `${this.renderDefaultTaskAndContext()}

    ${this.renderCurrentErrorsAndOriginalFiles()}

  Proposed coding plan:
  ${codingPlan}

  Your text based review:
    `;
  }

  actionPlanReviewSystemPrompt() {
    return `You are an expert software engineering planner.

    Instructions:
    1. Review the proposed action plan.
    2. Assess its feasibility, correctness, and completeness.
    3. Provide detailed feedback if you find issues or approve the plan if it meets the criteria with the words "Action plan looks good".
    4. Plan should not include any code documentation tasks, that is already done automatically, focus on the programming changes.
    5. For new files you are adding or have created, output "add" in the fileAction field.
    6. For files you are changing there should be "change" in the fileAction JSON field.
    7. If you are deleting a file there should be "delete" in the fileAction JSON field.
    ${
      this.currentErrors
        ? `8.  You have already build the project and now you need a new coding plan to fix errors provided by the user.`
        : ``
    }
    Important: If the action plan is good, with no major issues, only output "Action plan looks good", nothing else.
    `;
  }

  getUserActionPlanReviewPrompt(actionPlan: PsAgentFactoryCodingActionPlanItem[]) {
    return `${this.renderDefaultTaskAndContext()}

    Proposed coding action plan:
    ${JSON.stringify(actionPlan, null, 2)}

    Your text based review:
    `;
  }

  getActionPlanSystemPrompt() {
    return `You are an expert software engineering planner that specialises in creating coding action plans.

    Instructions:
    1. Review the provided <Context> and <Task> information.
    2. Review the coding plan and create a detailed coding action plan in JSON for implementing the changes.
    3. We always create and modify typescript .ts files no .js files in the plan.
    4. For new files you are adding or have created, output "add" in the fileAction field.
    5. For files you are changing output "change" in the fileAction JSON field.
    6. If you are deleting a file output "delete" in the fileAction JSON field.
    7. Put a full detailed description from the coding plan in the codingTaskFullDescription field.
    ${
      this.currentErrors
        ? `8.  You have already build the project and now you need a new coding plan to fix errors provided by the user, the file action on already implemented files should be "change" not add, as you already added them last time.`
        : ``
    }
    Expected JSON Array Output:
    [
      {
        fullPathToNewOrUpdatedFile: string;
        codingTaskTitle: string;
        codingTaskFullDescription: string;
        fileAction: "add" | "change" | "delete";
      }
    ]
    `;
  }

  getUserActionPlanPrompt(codingPlan: string, reviewLog: string) {
    return `${this.renderDefaultTaskAndContext()}

      ${
        reviewLog
          ? `Take note --> <ReviewOnYourLastAttemptAtCreatingCodingActionPlan>${reviewLog}</ReviewOnYourLastAttemptAtCreatingCodingActionPlan>`
          : ``
      }

      Coding plan to use for your Coding Action Plan:
      ${codingPlan}

      Let's think step by step.

      Your action plan in JSON array:
    `;
  }

  private async getCodingPlan() {
    let planReady = false;
    let planRetries = 0;
    let reviewRetries = 0;
    const maxReviewsRetries = 10;
    let reviewLog = "";
    let codingPlan: string | undefined;

    while (!planReady && planRetries < this.maxRetries) {
      console.log(`Getting coding plan attempt ${planRetries + 1}`);
      if (!this.havePrintedDebugPrompt) {
        console.log(`PLANNING PROMPT: ${this.getUserPlanPrompt(reviewLog)}`);
        this.havePrintedDebugPrompt = true;
      }
      codingPlan = await this.callLLM(
        "engineering-agent",
        PsConstants.engineerModel,
        [
          new SystemMessage(this.planSystemPrompt()),
          new HumanMessage(this.getUserPlanPrompt(reviewLog)),
        ],
        false
      );

      if (codingPlan) {
        console.log(`Coding plan received: ${codingPlan}`);
        if (reviewRetries < maxReviewsRetries) {
          const review = await this.callLLM(
            "engineering-agent",
            PsConstants.engineerModel,
            [
              new SystemMessage(this.reviewSystemPrompt()),
              new HumanMessage(this.getUserReviewPrompt(codingPlan)),
            ],
            false
          );

          console.log(`\n\nReview received: ${review}\n\n`);

          if (
            (review && review.indexOf("Coding plan looks good") > -1) ||
            review.indexOf("No changes needed to this code") > -1
          ) {
            planReady = true;
            console.log("Coding plan approved");
          } else {
            reviewLog = review + `\n`;
            planRetries++;
            reviewRetries++;
          }
        } else {
          console.warn("Max review retries reached, continuing without review");
          planReady = true;
        }
      } else {
        console.error("No plan received");
        planRetries++;
      }
    }

    return codingPlan;
  }

  async getActionPlan(currentErrors: string | undefined = undefined) {
    let planReady = false;
    let planRetries = 0;
    let reviewLog = "";
    let actionPlan: PsAgentFactoryCodingActionPlanItem[] | undefined;
    this.setCurrentErrors(currentErrors);

    const codingPlan = await this.getCodingPlan();

    if (codingPlan) {
      while (!planReady && planRetries < this.maxRetries) {
        console.log(`Getting action plan attempt ${planRetries + 1}`);
        actionPlan = await this.callLLM(
          "engineering-agent",
          PsConstants.engineerModel,
          [
            new SystemMessage(this.getActionPlanSystemPrompt()),
            new HumanMessage(
              this.getUserActionPlanPrompt(codingPlan, reviewLog)
            ),
          ],
          true
        );

        if (actionPlan) {
          console.log(
            `Action plan received: ${JSON.stringify(actionPlan, null, 2)}`
          );
          const review = await this.callLLM(
            "engineering-agent",
            PsConstants.engineerModel,
            [
              new SystemMessage(this.actionPlanReviewSystemPrompt()),
              new HumanMessage(this.getUserActionPlanReviewPrompt(actionPlan)),
            ],
            false
          );

          console.log(`\n\Coding Action Plan Review received: ${review}\n\n`);

          if (review && review.indexOf("Action plan looks good") > -1) {
            planReady = true;
            console.log("Action plan approved");
          } else {
            reviewLog = review + `\n`;
            planRetries++;
          }
        } else {
          console.error("No action plan received");
          planRetries++;
        }
      }

      actionPlan?.forEach((action) => {
        action.status = "notStarted";
      });

      // Go through actoinplan and add all actions with "add" to filesAdded
      actionPlan?.forEach((action) => {
        if (action.fileAction === "add") {
          if (!this.memory.currentFilesBeingAdded) {
            this.memory.currentFilesBeingAdded = [];
          }

          this.memory.currentFilesBeingAdded.push(
            this.removeWorkspacePathFromFileIfNeeded(
              action.fullPathToNewOrUpdatedFile
            )
          );
        }
      });

      // Go through the action plan and look at all actions with "change", if those are in the filesAdded change them back to "add"
      actionPlan?.forEach((action) => {
        if (action.fileAction === "change") {
          if (
            this.memory.currentFilesBeingAdded?.includes(
              this.removeWorkspacePathFromFileIfNeeded(
                action.fullPathToNewOrUpdatedFile
              )
            )
          ) {
            action.fileAction = "add";
            console.log(
              `Changing action back to add: ${action.fullPathToNewOrUpdatedFile}`
            );
          }
        }
      });

      return actionPlan;
    } else {
      console.error("No coding plan received");
      return;
    }
  }
}
