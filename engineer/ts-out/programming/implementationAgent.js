import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
import path from "path";
import fs from "fs";
export class PsEngineerProgrammingImplementationAgent extends PsEngineerBaseProgrammingAgent {
    havePrintedFirstUserDebugMessage = false;
    get codingSystemPrompt() {
        return `Your are an expert software engineering programmer.

      Instructions:
      1. Review the task name, description and general instructions.
      2. Review the documentation, examples, code and typedefs.
      3. Use the provided coding plan to implement the changes.
      4. You will see a list of actions you should be completing at this point in the action plan, you will also see completed and future actions for your information.
      5. Always output the full new or changed typescript file, do not leave anyything out, otherwise code will get lost.

      Output:
      1. Always output the full changed typescript file, do not leave anyything out.
      2. Output nothing else than the new or changed typescript file.
      3. Use markdown typescript for output.
`;
    }
    codingUserPrompt(fileName, fileAction, currentActions, currentFileToUpdateContents, completedActions, futureActions, reviewLog) {
        return `${this.renderDefaultTaskAndContext()}

    ${completedActions && completedActions.length > 0
            ? `<AlreadyCompletedTasks>${JSON.stringify(completedActions, null, 2)}</AlreadyCompletedTasks>`
            : ``}

    ${futureActions && futureActions.length > 0
            ? `<FutureTasksNotImplementedByYou>${JSON.stringify(futureActions, null, 2)}</FutureTasksNotImplementedByYou>`
            : ``}

    <YourCurrentTask>:
    ${JSON.stringify(currentActions, null, 2)}
    </YourCurrentTask>

    ${reviewLog
            ? `Take note --> <ReviewOnYourLastAttemptAtCreatingCode>${reviewLog}</ReviewOnYourLastAttemptAtCreatingCode>`
            : ``}

    ${currentFileToUpdateContents
            ? `<CurrentFileYouAreChanging>:\n${fileName}:\n${currentFileToUpdateContents}</<CurrentFileYouAreChanging>`
            : ``}

    Output the ${fileAction == "change" ? "changed" : "new"} file ${fileAction == "change" ? "again " : ""}in typescript:
    `;
    }
    reviewSystemPrompt() {
        return `You are an expert software engineering code analyzer.

    Instructions:
    1. Review the proposed code for the given task.
    2. Assess its feasibility, correctness, and completeness.
    3. Provide detailed feedback if you find issues or approve the code if it meets the criteria with the words "Code looks good".
    `;
    }
    getUserReviewPrompt(codeToReview) {
        return `${this.renderDefaultTaskAndContext()}

    Code for your review:
    ${codeToReview}

    Your review: `;
    }
    async implementFileActions(fileName, fileAction, completedActions, currentActions, futureActions) {
        let retryCount = 0;
        let hasPassedReview = false;
        let newCode = "";
        let reviewLog = "";
        console.log(`Working on file: ${fileName}`);
        console.log(JSON.stringify(currentActions, null, 2));
        let currentFileToUpdateContents;
        if (fileAction === "change") {
            currentFileToUpdateContents = this.loadFileContents(fileName);
            if (!currentFileToUpdateContents) {
                console.error(`Error loading file ${fileName}`);
                throw new Error(`Error loading file ${fileName}`);
            }
        }
        if (!this.havePrintedFirstUserDebugMessage) {
            console.log(`Code user prompt:\n${this.codingUserPrompt(fileName, fileAction, currentActions, currentFileToUpdateContents, completedActions, futureActions, reviewLog)}\n\n`);
            this.havePrintedFirstUserDebugMessage = true;
        }
        while (!hasPassedReview && retryCount < this.maxRetries) {
            console.log(`Calling LLM... Attempt ${retryCount + 1}`);
            newCode = await this.callLLM("engineering-agent", IEngineConstants.engineerModel, [
                new SystemMessage(this.codingSystemPrompt),
                new HumanMessage(this.codingUserPrompt(fileName, fileAction, currentActions, currentFileToUpdateContents, completedActions, futureActions, reviewLog)),
            ], false);
            if (newCode) {
                console.log(`Coding received: ${newCode}`);
                const review = await this.callLLM("engineering-agent", IEngineConstants.engineerModel, [
                    new SystemMessage(this.reviewSystemPrompt()),
                    new HumanMessage(this.getUserReviewPrompt(newCode)),
                ], false);
                console.log(`\n\nCode review received: ${review}\n\n`);
                if (review && review.indexOf("Code looks good") > -1) {
                    hasPassedReview = true;
                    console.log("Code approved");
                }
                else {
                    reviewLog = review + `\n`;
                    retryCount++;
                }
            }
            else {
                console.error("No plan received");
                retryCount++;
            }
        }
        console.log(`\n\n\n\n\n-------------------> New code:\n${newCode}\n\n<-------------------\n\n\n\n\n`);
        newCode = newCode.trim();
        newCode.replace(/```typescript/g, "");
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
        return newCode;
    }
    async implementCodingActionPlan(actionPlan) {
        let currentActions = [];
        let completedActions = actionPlan.filter((action) => action.status === "completed");
        let futureActions = [];
        // Determine the first uncompleted action
        const firstUncompletedAction = actionPlan.find((action) => action.status !== "completed");
        if (firstUncompletedAction) {
            // Get all actions for the same file that are not completed
            currentActions = actionPlan.filter((action) => action.fullPathToNewOrUpdatedFile ===
                firstUncompletedAction.fullPathToNewOrUpdatedFile &&
                action.status !== "completed");
            // Mark all current actions as inProgress
            currentActions.forEach((action) => {
                action.status = "inProgress";
            });
            // Update futureActions excluding the current and completed ones
            futureActions = actionPlan.filter((action) => action.fullPathToNewOrUpdatedFile !==
                firstUncompletedAction.fullPathToNewOrUpdatedFile &&
                action.status !== "completed");
            console.log(`Implementing action: ${JSON.stringify(currentActions, null, 2)}`);
            await this.implementFileActions(firstUncompletedAction.fullPathToNewOrUpdatedFile, firstUncompletedAction.fileAction, completedActions, currentActions, futureActions);
            // Process all current actions
            for (const action of currentActions) {
                action.status = "completed";
            }
        }
        console.log(`Completed Actions: ${JSON.stringify(completedActions, null, 2)}`);
        console.log(`Future Actions: ${JSON.stringify(futureActions, null, 2)}`);
    }
    deleteDependency(dependencyName) {
        console.log(`NOT IMPLEMENTED: Deleted dependency: ${dependencyName}`);
    }
    changeDependency(dependencyName, version) {
        console.log(`NOT IMPLEMENTED: Changed dependency ${dependencyName} to version ${version}`);
    }
}
//# sourceMappingURL=implementationAgent.js.map