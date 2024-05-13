import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { IEngineConstants } from "@policysynth/agents/constants.js";

import { Project, StringLiteralLike } from "ts-morph";

import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";

export class PsEngineerProgrammingPlanningAgent extends PsEngineerBaseProgrammingAgent {
  havePrintedDebugPrompt = false;

  planSystemPrompt() {
    return `You are an expert software engineering analyzer.

    Instructions:
    1. Review the provided <Context> and <Task> information.
    2. Consider the overall task title, description, and instructions.
    3. Create a detailed, step-by-step coding plan that specifies the code changes needed to accomplish the task.
    4. Do not include test or documentation tasks, we do that seperatly, focus on the programming changes.
    5. We always create and modify typescript .ts files.
    ${
      this.currentErrors
        ? `6. You have already build the project and now you need a new coding plan to fix errors provided by the user, the coding plan should focus on fixing the errors in the files you have been changing nothing else and don't try to fix other files. The project is not compiling because of those recent changes you've made.`
        : ``
    }
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

    Your coding plan:
    `;
  }

  reviewSystemPrompt() {
    return `You are an expert software engineering analyzer.

    Instructions:
    1. Review the proposed coding plan.
    2. Assess its feasibility, correctness, and completeness.
    3. Provide feedback if you find critical issues or approve the plan if it meets the criteria with the words "Coding plan looks good".
    4. Plan should not include documentation tasks, that is already done automatically, focus on the programming changes.
    5. We always create and modify typescript .ts files.
    6. The coding plan does not have to include every detail, the goal is to provide a high-level plan for the changes needed for each file and each task.
    7. If the plan is good only output "Coding plan looks good" or "No changes needed to this code".
    ${
      this.currentErrors
        ? `8.  You have already build the project and now you need a new coding plan to fix errors provided by the user, the coding plan should focus on fixing the errors in the files you have been changing nothing else and don't try to fix other files. The project is not compiling because of those recent changes you've made.`
        : ``
    }
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
    4. Plan should not include documentation tasks, that is already done automatically, focus on the programming changes.
    5. For new files you are adding output "add" in the fileAction field.
    6. For files you are changing there should be "change" in the fileAction JSON field.
    7. If you are deleting a file there should be "delete" in the fileAction JSON field.
    ${
      this.currentErrors
        ? `8.  You have already build the project and now you need a new coding plan to fix errors provided by the user
           9. The fileAction files you have already implemented should now be "change" not "add", as you already added them last time around.`
        : ``
    }
    Important: If the action plan is good, with no major issues, only output "Action plan looks good", nothing else.
    `;
  }

  getUserActionPlanReviewPrompt(actionPlan: PsEngineerCodingActionPlanItem[]) {
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
    4. For new files you are adding output "add" in the fileAction field.
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
        IEngineConstants.engineerModel,
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
            IEngineConstants.engineerModel,
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
    let actionPlan: PsEngineerCodingActionPlanItem[] | undefined;
    this.setCurrentErrors(currentErrors);

    const codingPlan = await this.getCodingPlan();

    if (codingPlan) {
      while (!planReady && planRetries < this.maxRetries) {
        console.log(`Getting action plan attempt ${planRetries + 1}`);
        actionPlan = await this.callLLM(
          "engineering-agent",
          IEngineConstants.engineerModel,
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
            IEngineConstants.engineerModel,
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

      return actionPlan;
    } else {
      console.error("No coding plan received");
      return;
    }
  }
}
