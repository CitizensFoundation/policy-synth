import { HumanMessage, SystemMessage } from "@langchain/core/messages";

import { IEngineConstants } from "@policysynth/agents/constants.js";

import { Project } from "ts-morph";

import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";

export class PsEngineerProgrammingPlanningAgent extends PsEngineerBaseProgrammingAgent {
  havePrintedDebugPrompt = false;

  planSystemPrompt(currentErrors: string | undefined) {
    return `You are an expert software engineering analyzer.

    Instructions:
    1. Review the provided <Context> and <Task> information.
    2. Consider the overall task title, description, and instructions.
    3. Create a detailed, step-by-step coding plan that specifies the code changes needed to accomplish the task.
    4. Do not include test or documentation tasks, we do that seperatly, focus on the programming changes.
    5. We always create and modify typescript .ts files.
    ${
      currentErrors
        ? `6. You have already build the project and now you need a new coding plan to fix errors provided by the user, the coding plan should focus on fixing the errors in the files you have been changing nothing else and don't try to fix other files. The project is not compiling because of those recent changes you've made.`
        : ``
    }
    `;
  }

  getUserPlanPrompt(reviewLog: string, currentErrors: string | undefined) {
    return `${this.renderDefaultTaskAndContext()}

    ${
      currentErrors
        ? `<CurrentErrorsToFixInYourPlan>${currentErrors}</CurrentErrorsToFixInYourPlan>`
        : ``
    }

    ${
      reviewLog
        ? `Take note --> <ReviewOnYourLastAttemptAtCreatingPlan>${reviewLog}</ReviewOnYourLastAttemptAtCreatingPlan>`
        : ``
    }

    Your coding plan:
    `;
  }

  reviewSystemPrompt(currentErrors: string | undefined) {
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
      currentErrors
        ? `8.  You have already build the project and now you need a new coding plan to fix errors provided by the user, the coding plan should focus on fixing the errors in the files you have been changing nothing else and don't try to fix other files. The project is not compiling because of those recent changes you've made.`
        : ``
    }
    `;
  }

  getUserReviewPrompt(codingPlan: string, currentErrors: string | undefined) {
    return `${this.renderDefaultTaskAndContext()}

    ${
      currentErrors
        ? `<CurrentErrorsToFixInYourPlan>${currentErrors}</CurrentErrorsToFixInYourPlan>`
        : ``
    }

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
    5. If the plan is good only output "Action plan looks good".
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
    4. If you are adding a new file always output "add" in the fileAction field if you are changing an existing file output "change" and if you are deleting a file output "delete" in the fileAction JSON field.

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

  async getCodingPlan(currentErrors: string | undefined = undefined) {
    let planReady = false;
    let planRetries = 0;
    let reviewRetries = 0;
    const maxReviewsRetries = 10;
    let reviewLog = "";
    let codingPlan: string | undefined;

    while (!planReady && planRetries < this.maxRetries) {
      console.log(`Getting coding plan attempt ${planRetries + 1}`);
      if (!this.havePrintedDebugPrompt) {
        console.log(`PLANNING PROMPT: ${this.getUserPlanPrompt(reviewLog, currentErrors)}`);
        this.havePrintedDebugPrompt = true;
      }
      codingPlan = await this.callLLM(
        "engineering-agent",
        IEngineConstants.engineerModel,
        [
          new SystemMessage(this.planSystemPrompt(currentErrors)),
          new HumanMessage(this.getUserPlanPrompt(reviewLog, currentErrors)),
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
              new SystemMessage(this.reviewSystemPrompt(currentErrors)),
              new HumanMessage(this.getUserReviewPrompt(codingPlan, currentErrors)),
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

    const codingPlan = await this.getCodingPlan(currentErrors);

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
