import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
import path from "path";
import fs from "fs";

export class PsEngineerProgrammingImplementationAgent extends PsEngineerBaseProgrammingAgent {
  havePrintedFirstUserDebugMessage = false;

  codingSystemPrompt(currentErrors: string | undefined) {
    return `Your are an expert software engineering programmer.

      Instructions:
      1. Look at the the task name, description and general instructions.
      2. Review the documentation, examples, code and typedefs.
      3. Use the provided coding plan to implement the changes.
      4. You will see a list of actions you should be completing at this point in the action plan, you will also see completed and future actions for your information.
      5. Always output the full new or changed typescript file, do not leave anything out, otherwise code will get lost.
      6. Make sure to output all functions and classes in the file, do not leave anything out.
      ${
        currentErrors
          ? `7. You have already build the project and now you need to fix errors provided by the user.`
          : ``
      }
`;
  }

  renderTaskContext(
    fileName: string,
    currentActions: PsEngineerCodingActionPlanItem[],
    completedActions: PsEngineerCodingActionPlanItem[],
    futureActions: PsEngineerCodingActionPlanItem[],
    currentFileToUpdateContents: string | undefined | null,
    reviewCount: number,
    reviewLog: string,
    currentErrors: string | undefined
  ) {
    return `${
      completedActions && completedActions.length > 0
        ? `<AlreadyCompletedTasks>${JSON.stringify(
            completedActions,
            null,
            2
          )}</AlreadyCompletedTasks>`
        : ``
    }

    ${
      futureActions && futureActions.length > 0
        ? `<FutureTasksNotImplementedByYou>${JSON.stringify(
            futureActions,
            null,
            2
          )}</FutureTasksNotImplementedByYou>`
        : ``
    }

    <YourCurrentTask>:
    ${JSON.stringify(currentActions, null, 2)}
    </YourCurrentTask>

    ${
      currentFileToUpdateContents
        ? `<CurrentFileYouAreChanging>:\n${fileName}:\n${currentFileToUpdateContents}</<CurrentFileYouAreChanging>`
        : ``
    }

    ${
      currentErrors
        ? `${this.renderOriginalFiles()}\n<ErrorsOnYourLastAttemptAtCreatingCode>${currentErrors}</ErrorsOnYourLastAttemptAtCreatingCode>`
        : ``
    }

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
    reviewLog: string,
    currentErrors: string | undefined
  ) {
    return `${this.renderDefaultTaskAndContext()}

    ${this.renderTaskContext(
      fileName,
      currentActions,
      completedActions,
      futureActions,
      currentFileToUpdateContents,
      reviewCount,
      reviewLog,
      currentErrors
    )}

    Output the ${fileAction == "change" ? "changed" : "new"} file ${
      fileAction == "change" ? "again " : ""
    }in full in typescript:
    `;
  }

  reviewSystemPrompt() {
    return `You are an expert software engineering code analyzer.

    Instructions:
    1. Review the proposed code for the given task.
    2. Assess its feasibility, correctness, and completeness.
    3. Never ask for documentation, we generate those with GPT-4 seperatly for everything that changes or is new.
    4. Provide feedback only if you find critical issues with the code.
    5. You will see previous reviews, we are in a loop until the code is good.
    6. If you have gone over 3 reviews of the code already make sure only to comment on the most critical issues otherwise just output: Code looks good.
    7. If there are no critical issues with the code only output: Code looks good.
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
    reviewLog: string,
    currentErrors: string | undefined
  ) {
    return `${this.renderDefaultTaskAndContext()}

      ${this.renderTaskContext(
        fileName,
        currentActions,
        completedActions,
        futureActions,
        currentFileToUpdateContents,
        reviewCount,
        "", // Leave review empty to avoid infinite loop
        currentErrors
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
        throw new Error(`Error loading file ${fileName}`);
      }

      this.setOriginalFileIfNeeded(fileName, currentFileToUpdateContents);
    }

    if (!this.havePrintedFirstUserDebugMessage) {
      this.havePrintedFirstUserDebugMessage = true;
    }

    console.log(
      `\n\n\n\n\n\n\n\n\n===============X============> Code user prompt:\n${this.codingUserPrompt(
        fileName,
        fileAction,
        currentActions,
        currentFileToUpdateContents,
        completedActions,
        futureActions,
        retryCount,
        reviewLog,
        currentErrors
      )}\n\n\n\n\n\n\n\n`
    );

    while (!hasPassedReview && retryCount < this.maxRetries) {
      console.log(`Calling LLM... Attempt ${retryCount + 1}`);
      newCode = await this.callLLM(
        "engineering-agent",
        IEngineConstants.engineerModel,
        [
          new SystemMessage(this.codingSystemPrompt(currentErrors)),
          new HumanMessage(
            this.codingUserPrompt(
              fileName,
              fileAction,
              currentActions,
              currentFileToUpdateContents,
              completedActions,
              futureActions,
              retryCount,
              reviewLog,
              currentErrors
            )
          ),
        ],
        false
      );

      if (newCode) {
        console.log(`Coding received: ${newCode}`);
        const review = await this.callLLM(
          "engineering-agent",
          IEngineConstants.engineerModel,
          [
            new SystemMessage(this.reviewSystemPrompt()),
            new HumanMessage(
              this.getUserReviewPrompt(
                newCode,
                fileName,
                currentActions,
                currentFileToUpdateContents,
                completedActions,
                futureActions,
                retryCount,
                reviewLog,
                currentErrors
              )
            ),
          ],
          false
        );

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
        console.error("No plan received");
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

    if (fullFileName.indexOf(this.memory.workspaceFolder) === -1) {
      fullFileName = path.join(this.memory.workspaceFolder, fileName);
    }

    const directory = path.dirname(fullFileName);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    if (fileAction === "change" && currentFileToUpdateContents) {
      fs.writeFileSync(`${fullFileName}.bkc`, currentFileToUpdateContents);
    }

    fs.writeFileSync(fullFileName, newCode);

    this.updateMemoryWithFileContents(fullFileName, newCode);

    return newCode as string;
  }

  async implementCodingActionPlan(
    actionPlan: PsEngineerCodingActionPlanItem[],
    currentErrors: string | undefined
  ) {
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