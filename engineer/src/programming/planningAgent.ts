import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";

/* ------------------------------------------------------------------------
   Planning Agent
------------------------------------------------------------------------- */
export class PsEngineerProgrammingPlanningAgent extends PsEngineerBaseProgrammingAgent {
  havePrintedDebugPrompt = false;

  planningModelSize = PsAiModelSize.Medium;

  override get maxThinkingTokens(): number {
    return 63999;
  }

  /**
   * System prompt for generating a coding plan (no actual code).
   * Consolidates repeated instructions into global constraints and success criteria.
   */
  planSystemPrompt() {
    return `
<ImportantInstructions>
${this.renderGlobalConstraints()}
Always output the full paths of files as provided to you.

<Goal>
Create a clear, high-level coding plan that details which files need changes.
Do not write actual code—only a bullet-point outline of the programming strategy.
</Goal>

${
  this.currentErrors
    ? `<KeyErrorsFocus>You have built the project but it's not compiling due to errors from recent changes. Focus on those errors and do not fix unrelated items.</KeyErrorsFocus>`
    : ``
}

${this.renderSuccessCriteria("plan")}
</ImportantInstructions>
`;
  }

  /**
   * User prompt that provides context for generating the coding plan.
   */
  getUserPlanPrompt(reviewLog: string) {
    return `
${this.renderDefaultTaskAndContext()}
${this.renderCurrentErrorsAndOriginalFiles()}

${
  reviewLog
    ? `<ReviewOnYourLastAttemptAtCreatingPlan>${reviewLog}</ReviewOnYourLastAttemptAtCreatingPlan>`
    : ""
}

${this.renderCodingRules()}

TASK: Use the available context to create a concise, bullet-point plan of changes (no code).
If there are errors, focus solely on fixing those. Otherwise, keep your plan minimal.

Plan your approach here:
`;
  }

  /**
   * System prompt for reviewing the proposed coding plan.
   */
  reviewSystemPrompt() {
    return `
<Instructions>
${this.renderGlobalConstraints()}

1. Review the proposed coding plan for feasibility and completeness.
2. If it's acceptable, respond with "Coding plan looks good" (or "No changes needed to this code").
3. If not acceptable, provide concise feedback or corrections.
${this.renderSuccessCriteria("review")}

${
  this.currentErrors
    ? `<CurrentErrors>These errors must be addressed: ${this.currentErrors}</CurrentErrors>`
    : ``
}

${
  this.memory.allTypescriptSrcFiles
    ? `<AllTypescriptFilesInProject>${this.memory.allTypescriptSrcFiles.join(
        "\n"
      )}</AllTypescriptFilesInProject>`
    : ""
}
</Instructions>
`;
  }

  /**
   * User prompt providing the plan for the model to review.
   */
  getUserReviewPrompt(codingPlan: string) {
    return `
${this.renderDefaultTaskAndContext()}
${this.renderCurrentErrorsAndOriginalFiles()}

Proposed coding plan:
${codingPlan}

Review the plan:
`;
  }

  /**
   * System prompt for reviewing the action plan.
   */
  actionPlanReviewSystemPrompt() {
    return `
<Instructions>
${this.renderGlobalConstraints()}

1. Review the proposed action plan in JSON for correctness.
2. If it meets requirements, respond "Action plan looks good".
3. Otherwise, provide corrections or feedback.
${this.renderSuccessCriteria("actionReview")}

${
  this.memory.allTypescriptSrcFiles
    ? `<AllTypescriptFilesInProject>${this.memory.allTypescriptSrcFiles.join(
        "\n"
      )}</AllTypescriptFilesInProject>`
    : ""
}
</Instructions>
`;
  }

  /**
   * User prompt for the action plan review step.
   */
  getUserActionPlanReviewPrompt(actionPlan: PsEngineerCodingActionPlanItem[]) {
    return `
${this.renderDefaultTaskAndContext()}

Proposed coding action plan:
${JSON.stringify(actionPlan, null, 2)}

Review the plan:
`;
  }

  /**
   * System prompt for generating the action plan (JSON array).
   */
  getActionPlanSystemPrompt() {
    return `
<Instructions>
${this.renderGlobalConstraints()}

Review the <Context> and <Task> details.

Always output the full paths of files as provided to you.

Provide a JSON array describing the code changes:
{
  fileAction: "add" | "change" | "delete",
  fullPathToNewOrUpdatedFile: string,
  codingTaskTitle: string,
  codingTaskStepsWithDetailedDescription: string[]
}

${
  this.currentErrors
    ? `Focus on recent errors if any. Keep changes minimal and do not fix unrelated items.`
    : ``
}

${this.renderSuccessCriteria("actionPlan")}
</Instructions>
`;
  }

  /**
   * User prompt that triggers creation of an action plan in JSON format
   * following the coding plan that was already approved or generated.
   */
  getUserActionPlanPrompt(codingPlan: string, reviewLog: string) {
    return `
${this.renderDefaultTaskAndContext()}

${
  reviewLog
    ? `<ReviewOnYourLastAttemptAtCreatingCodingActionPlan>${reviewLog}</ReviewOnYourLastAttemptAtCreatingCodingActionPlan>`
    : ``
}

<PlanToImplement>
${codingPlan}
</PlanToImplement>

Now provide your action plan as a JSON array:
`;
  }

  /**
   * Orchestrates retrieval + review of the coding plan.
   */
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

      this.startTiming();

      // Call the model with the new approach
      const planResponse = await this.callModel(
        PsAiModelType.TextReasoning,
        this.planningModelSize,
        [
          this.createSystemMessage(this.planSystemPrompt()),
          this.createHumanMessage(this.getUserPlanPrompt(reviewLog)),
        ],
        false
      );

      await this.addTimingResult("PlanningAgent Plan");

      // Convert the plan response into a string if needed
      if (planResponse) {
        if (typeof planResponse === "string") {
          codingPlan = planResponse;
        } else {
          // If it came back as JSON, convert to string
          codingPlan = JSON.stringify(planResponse, null, 2);
        }
      }

      if (codingPlan) {
        console.log(`Coding plan received:\n${codingPlan}`);
        this.memory.allCodingPlans.push(codingPlan);
        await this.saveMemory();

        // Now we review the coding plan
        if (reviewRetries < maxReviewsRetries) {
          this.startTiming();
          const reviewResponse = await this.callModel(
            PsAiModelType.TextReasoning,
            this.planningModelSize,
            [
              this.createSystemMessage(this.reviewSystemPrompt()),
              this.createHumanMessage(this.getUserReviewPrompt(codingPlan)),
            ],
            false
          );

          await this.addTimingResult("PlanningAgent Review");

          let review = "";
          if (reviewResponse) {
            if (typeof reviewResponse === "string") {
              review = reviewResponse;
            } else {
              review = JSON.stringify(reviewResponse, null, 2);
            }
          }

          console.log(`\n\nReview received: ${review}\n\n`);

          if (
            review.includes("Coding plan looks good") ||
            review.includes("No changes needed to this code")
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

  /**
   * Orchestrates the retrieval of the action plan (JSON array).
   */
  async getActionPlan(currentErrors: string | undefined = undefined) {
    let planReady = false;
    let planRetries = 0;
    let reviewLog = "";
    let actionPlan: PsEngineerCodingActionPlanItem[] | undefined;
    this.setCurrentErrors(currentErrors);

    const codingPlan = await this.getCodingPlan();
    if (!codingPlan) {
      console.error("No coding plan received; cannot produce action plan.");
      return;
    }

    while (!planReady && planRetries < this.maxRetries) {
      console.log(`Getting action plan attempt ${planRetries + 1}`);

      this.startTiming();

      const actionPlanResponse = await this.callModel(
        PsAiModelType.TextReasoning,
        PsAiModelSize.Small,
        [
          this.createSystemMessage(this.getActionPlanSystemPrompt()),
          this.createHumanMessage(
            this.getUserActionPlanPrompt(codingPlan, reviewLog)
          ),
        ],
        false
      );

      await this.addTimingResult("PlanningAgent Action Plan");

      // Parse the action plan response into PsEngineerCodingActionPlanItem[]
      if (actionPlanResponse) {
        let planStr = "";
        if (typeof actionPlanResponse === "string") {
          planStr = actionPlanResponse;
        } else {
          planStr = JSON.stringify(actionPlanResponse, null, 2);
        }

        try {
          actionPlan = JSON.parse(planStr) as PsEngineerCodingActionPlanItem[];
        } catch (err) {
          console.error("Error parsing action plan JSON:", err);
        }

        if (actionPlan) {
          console.log(
            `Action plan received: ${JSON.stringify(actionPlan, null, 2)}`
          );

          this.memory.latestActionItemPlan = actionPlan;

          await this.saveMemory();

          // Option to skip review if needed:
          const skipReview = true;
          let review = "";

          if (skipReview) {
            review = "Action plan looks good";
          } else {
            // If not skipping review, we'd call the model again
            this.startTiming();
            const actionPlanReviewResponse = await this.callModel(
              PsAiModelType.TextReasoning,
              PsAiModelSize.Small,
              [
                this.createSystemMessage(this.actionPlanReviewSystemPrompt()),
                this.createHumanMessage(
                  this.getUserActionPlanReviewPrompt(actionPlan)
                ),
              ],
              false
            );
            await this.addTimingResult("PlanningAgent Action Plan Review");

            if (actionPlanReviewResponse) {
              if (typeof actionPlanReviewResponse === "string") {
                review = actionPlanReviewResponse;
              } else {
                review = JSON.stringify(actionPlanReviewResponse, null, 2);
              }
            }
          }

          console.log(`\n\nCoding Action Plan Review received: ${review}\n\n`);

          if (review.includes("Action plan looks good")) {
            planReady = true;
            console.log("Action plan approved");
          } else {
            reviewLog = review + `\n`;
            planRetries++;
          }
        } else {
          planRetries++;
        }
      } else {
        console.error("No action plan received");
        planRetries++;
      }
    }

    // If we got a final actionPlan, mark them as notStarted
    actionPlan?.forEach((action) => {
      action.status = "notStarted";
    });

    // Mark newly added files in memory
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

    // If we are changing a file that we previously had as "add", revert to "add"
    actionPlan?.forEach((action) => {
      const shortPath = this.removeWorkspacePathFromFileIfNeeded(
        action.fullPathToNewOrUpdatedFile
      );
      if (action.fileAction === "change") {
        if (this.memory.currentFilesBeingAdded?.includes(shortPath)) {
          action.fileAction = "add";
          console.log(`Changing action back to add: ${shortPath}`);
        }
      }
    });

    return actionPlan;
  }
}
