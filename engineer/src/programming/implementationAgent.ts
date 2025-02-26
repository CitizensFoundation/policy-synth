import path from "path";
import fs from "fs";
import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
import {
  PsAiModelType,
  PsAiModelSize,
} from "@policysynth/agents/aiModelTypes.js";

import { PsConstants } from "@policysynth/agents/constants.js";

/**
 * Upgraded to use the new `callModel` approach with reasoning.
 * Retains the same functionality and logic as before.
 */
export class PsEngineerProgrammingImplementationAgent extends PsEngineerBaseProgrammingAgent {
  havePrintedFirstUserDebugMessage = true;

  codingSystemPrompt(currentErrors: string | undefined) {
    return `Your are an expert software engineering programmer.

      <GeneralInstructions>
      1. Look at the the task name, description and general instructions.
      2. Review the documentation, examples, code and typedefs.
      3. Use the provided coding plan to implement the changes.
      4. You will see a list of actions you should be completing at this point in the action plan, you will also see completed and future actions for your information.
      5. Always output the full new or changed typescript file, do not leave anything out, otherwise code will get lost.
      6. Never remove any logging from the code except if that is a part of the task explicitly, even when refactoring.
      7. Only output code no comments or explanations before or after the code.
      ${
        currentErrors
          ? `11. You have already build the project and now you need to fix errors provided in <ErrorsOnYourLastAttemptAtCreatingCode>.
             12. If you are changing a file pay attention to <OriginalCodefilesBeforeYourChanges> where you can see the original for reference.`
          : ``
      }</GeneralInstructions>

      ${this.renderCodingRules()}

      <SpecialAttention>
        Pay special attention to <YourCurrentTask> and for support <OverAllTaskInstructions> in your coding efforts
      </SpecialAttention>
`;
  }

  renderTaskContext(
    fileName: string,
    currentActions: PsEngineerCodingActionPlanItem[],
    completedActions: PsEngineerCodingActionPlanItem[],
    futureActions: PsEngineerCodingActionPlanItem[],
    currentFileToUpdateContents: string | undefined | null,
    reviewCount: number,
    reviewLog: string
  ) {
    return `${
      completedActions && completedActions.length > 0
        ? `<AlreadyCompletedTasks>\n${JSON.stringify(
            completedActions,
            null,
            2
          )}</AlreadyCompletedTasks>`
        : ``
    }

    ${
      futureActions && futureActions.length > 0
        ? `<FutureTasksNotImplementedByYouYet>\n${JSON.stringify(
            futureActions,
            null,
            2
          )}</FutureTasksNotImplementedByYouYet>`
        : ``
    }

    <YourCurrentTask>:
      ${JSON.stringify(currentActions, null, 2)}
    </YourCurrentTask>

    ${
      currentFileToUpdateContents
        ? `<CurrentFileYouAreChanging filename="${fileName}">\n${currentFileToUpdateContents}\n</CurrentFileYouAreChanging>`
        : ``
    }

    ${this.renderCurrentErrorsAndOriginalFiles()}

    ${
      reviewLog
        ? `IMPORTANT: This is your ${
            reviewCount + 1
          }. round of improvements after reviews\n<ReviewsOnYourLastAttemptAtCreatingCode>${reviewLog}</ReviewsOnYourLastAttemptAtCreatingCode>`
        : ``
    }
    `;
  }

  codingUserPrompt(
    fileName: string,
    fileAction: PsEngineerFileActions,
    currentActions: PsEngineerCodingActionPlanItem[],
    currentFileToUpdateContents: string | undefined | null,
    completedActions: PsEngineerCodingActionPlanItem[],
    futureActions: PsEngineerCodingActionPlanItem[],
    reviewCount: number,
    reviewLog: string
  ) {
    return `${this.renderDefaultTaskAndContext(true)}

    ${this.renderTaskContext(
      fileName,
      currentActions,
      completedActions,
      futureActions,
      currentFileToUpdateContents,
      reviewCount,
      reviewLog
    )}

    Output only the ${fileAction == "change" ? "changed" : "new"} file ${
      fileAction == "change" ? "again " : ""
    }in full in typescript:
    `;
  }

  reviewSystemPrompt() {
    return `<Instructions>
    1. Review the proposed code for the given task.
    2. Assess its feasibility, correctness, and completeness.
    3. Never ask for documentation, we generate those seperatly for everything that changes.
    4. Provide feedback only if you find critical issues with the code.
    5. You will see previous reviews, we are in a loop until the code is good.
    6. There should never be any explanations or comments before or after the code.
    7. If you have gone over 3 reviews of the code already make sure only to comment on the most critical issues otherwise just output: Code looks good.
    </Instructions>
    ${this.renderCodingRules()}

    <OutputFormat>
      If there are no critical issues with the code only output: Code looks good.
    </OutputFormat>
    `;
  }

  getUserReviewPrompt(
    codeToReview: string,
    fileName: string,
    currentActions: PsEngineerCodingActionPlanItem[],
    currentFileToUpdateContents: string | undefined | null,
    completedActions: PsEngineerCodingActionPlanItem[],
    futureActions: PsEngineerCodingActionPlanItem[],
    reviewCount: number,
    reviewLog: string
  ) {
    return `${this.renderDefaultTaskAndContext(true)}

      ${this.renderTaskContext(
        fileName,
        currentActions,
        completedActions,
        futureActions,
        currentFileToUpdateContents,
        reviewCount,
        "" // Leave review empty to avoid infinite loop
      )}

      <CodeForYourReview>
        ${codeToReview}
      </CodeForYourReview>

      Your review of <CodeForYourReview>: `;
  }

  async implementFileActions(
    fileName: string,
    fileAction: PsEngineerFileActions,
    completedActions: PsEngineerCodingActionPlanItem[],
    currentActions: PsEngineerCodingActionPlanItem[],
    futureActions: PsEngineerCodingActionPlanItem[],
    currentErrors: string | undefined
  ) {
    let retryCount = 0;
    let hasPassedReview = false;
    let newCode = "";
    let reviewLog = "";

    console.log(`Working on file: ${fileName}`);
    console.log(JSON.stringify(currentActions, null, 2));

    let currentFileToUpdateContents: string | undefined | null;

    if (fileAction === "change") {
      currentFileToUpdateContents = this.loadFileContents(fileName);
      if (!currentFileToUpdateContents) {
        console.error(`Error loading file ${fileName}`);
      } else {
        this.setOriginalFileIfNeeded(fileName, currentFileToUpdateContents);
      }
    }

    if (!this.havePrintedFirstUserDebugMessage) {
      console.log(
        `\n\n\n\n\n\n\n\n\n===============X============> Code user prompt:\n${this.codingUserPrompt(
          fileName,
          fileAction,
          currentActions,
          currentFileToUpdateContents,
          completedActions,
          futureActions,
          retryCount,
          reviewLog
        )}\n\n\n\n\n\n\n\n`
      );
      this.havePrintedFirstUserDebugMessage = true;
    }

    while (!hasPassedReview && retryCount < this.maxRetries) {
      console.log(`Calling LLM... Attempt ${retryCount + 1}`);

      // Use the new callModel approach:
      const messagesForCoding = [
        this.createSystemMessage(this.codingSystemPrompt(currentErrors)),
        this.createHumanMessage(
          this.codingUserPrompt(
            fileName,
            fileAction,
            currentActions,
            currentFileToUpdateContents,
            completedActions,
            futureActions,
            retryCount,
            reviewLog
          )
        ),
      ];

      try {
        this.startTiming();
        newCode = await this.callModel(
          PsAiModelType.TextReasoning,
          PsAiModelSize.Small,
          messagesForCoding,
          false
        );
        await this.addTimingResult("ImplementationAgent");
      } catch (error: any) {
        console.error("Error calling the model for new code:", error.message);
        retryCount++;
        continue;
      }

      if (newCode) {
        console.log(`Coding received: ${newCode}`);

        const messagesForReview = [
          this.createSystemMessage(this.reviewSystemPrompt()),
          this.createHumanMessage(
            this.getUserReviewPrompt(
              newCode,
              fileName,
              currentActions,
              currentFileToUpdateContents,
              completedActions,
              futureActions,
              retryCount,
              reviewLog
            )
          ),
        ];

        let review = "";
        const skipReview = true;

        if (skipReview) {
          review = "Code looks good";
        } else {
          try {
            this.startTiming();
            review = await this.callModel(
            PsAiModelType.TextReasoning,
            PsAiModelSize.Small,
            messagesForReview,
              false
            );
            await this.addTimingResult("ImplementationAgentReview");
          } catch (error: any) {
            console.error("Error calling the model for review:", error.message);
            retryCount++;
            continue;
          }
        }

        console.log(`\n\nCode review received: ${review}\n\n`);

        if (review && review.indexOf("Code looks good") > -1) {
          hasPassedReview = true;
          console.log("Code approved");
        } else {
          reviewLog = `\h${reviewLog}\nReview number: ${
            retryCount + 1
          }:\n${review}`;
            retryCount++;
        }
      } else {
        console.error("No code response received from model.");
        retryCount++;
      }
    }

    console.log(
      `\n\n\n\n\n\n\n\n\n\n-------------------> New code:\n${newCode}\n\n<-------------------\n\n\n\n\n\n\n\n\n\n`
    );

    newCode = newCode.trim();
    newCode = newCode.replace(/```typescript/g, "");
    if (newCode.endsWith("```")) {
      newCode = newCode.slice(0, -3);
    }

    let fullFileName = fileName;
    if (
      !fileName.startsWith(this.memory.workspaceFolder) &&
      (!this.memory.outsideTypedefPath ||
        (this.memory.outsideTypedefPath &&
          !fileName.startsWith(this.memory.outsideTypedefPath)))
    ) {
      fullFileName = path.join(this.memory.workspaceFolder, fileName);
    }
    fullFileName = path.resolve(fullFileName);

    const allowedPaths = [path.resolve(this.memory.workspaceFolder)];
    if (this.memory.outsideTypedefPath) {
      allowedPaths.push(path.resolve(this.memory.outsideTypedefPath));
    }

    const isAllowed = allowedPaths.some(
      (allowedPath) =>
        fullFileName === allowedPath ||
        fullFileName.startsWith(allowedPath + path.sep)
    );

    if (!isAllowed) {
      throw new Error(
        `Attempt to write file outside allowed directories: ${fullFileName}`
      );
    }

    const directory = path.dirname(fullFileName);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(fullFileName, newCode);
    this.updateMemoryWithFileContents(fullFileName, newCode);

    return newCode as string;
  }

  async implementCodingActionPlan(
    actionPlan: PsEngineerCodingActionPlanItem[],
    currentErrors: string | undefined
  ) {
    this.setCurrentErrors(currentErrors);
    let currentActions: PsEngineerCodingActionPlanItem[] = [];
    let completedActions: PsEngineerCodingActionPlanItem[] = actionPlan.filter(
      (action) => action.status === "completed"
    );
    let futureActions: PsEngineerCodingActionPlanItem[] = [];

    // Determine the first uncompleted action
    const firstUncompletedAction = actionPlan.find(
      (action) => action.status !== "completed"
    );
    if (firstUncompletedAction) {
      // Get all actions for the same file that are not completed
      currentActions = actionPlan.filter(
        (action) =>
          action.fullPathToNewOrUpdatedFile ===
            firstUncompletedAction.fullPathToNewOrUpdatedFile &&
          action.status !== "completed"
      );

      // Mark all current actions as inProgress
      currentActions.forEach((action) => {
        action.status = "inProgress";
      });

      // Update futureActions excluding the current and completed ones
      futureActions = actionPlan.filter(
        (action) =>
          action.fullPathToNewOrUpdatedFile !==
            firstUncompletedAction.fullPathToNewOrUpdatedFile &&
          action.status !== "completed"
      );

      console.log(
        `Implementing action: ${JSON.stringify(currentActions, null, 2)}`
      );
      await this.implementFileActions(
        firstUncompletedAction.fullPathToNewOrUpdatedFile,
        firstUncompletedAction.fileAction,
        completedActions,
        currentActions,
        futureActions,
        currentErrors
      );

      // Process all current actions
      for (const action of currentActions) {
        action.status = "completed";
      }
    }

    console.log(
      `Completed Actions: ${JSON.stringify(completedActions, null, 2)}`
    );
    console.log(`Future Actions: ${JSON.stringify(futureActions, null, 2)}`);
  }

  deleteDependency(dependencyName: string) {
    console.log(`NOT IMPLEMENTED: Deleted dependency: ${dependencyName}`);
  }

  changeDependency(dependencyName: string, version: string) {
    console.log(
      `NOT IMPLEMENTED: Changed dependency ${dependencyName} to version ${version}`
    );
  }
}
