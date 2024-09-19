import { Project } from "ts-morph";
import path from "path";

import { PsAgentFactoryBaseProgrammingAgent } from "./baseAgent.js";
import { PsAgentFactoryProgrammingPlanningAgent } from "./planningAgent.js";
import { PsAgentFactoryProgrammingImplementationAgent } from "./implementationAgent.js";
import { PsAgentFactoryProgrammingBuildAgent } from "./buildAgent.js";
import { PsAgentFactoryErrorWebResearchAgent } from "../webResearch/errorsWebResearch.js";

export class PsAgentFactoryProgrammingAgent extends PsAgentFactoryBaseProgrammingAgent {
  async implementChanges() {
    console.log(`Implementing changes `);

    let retryCount = 0;
    const retriesUntilWebResearch = 3;
    let hasCompleted = false;
    let currentErrors: string | undefined = undefined;

    const buildAgent = new PsAgentFactoryProgrammingBuildAgent(this.memory);

    while (!hasCompleted && retryCount < this.maxRetries) {
      await this.createAndRunActionPlan(currentErrors);
      currentErrors = await buildAgent.build();
      if (currentErrors && retryCount >= retriesUntilWebResearch) {
        await this.searchForSolutionsToErrors(currentErrors);
      }
      if (!currentErrors) {
        hasCompleted = true;
      }
    }
  }

  async searchForSolutionsToErrors(currentErrors: string) {
    const docsResearcher = new PsAgentFactoryErrorWebResearchAgent(this.memory);
  }

  async createAndRunActionPlan(currentErrors: string | undefined = undefined) {
    const planningAgent = new PsAgentFactoryProgrammingPlanningAgent(
      this.memory,
      this.likelyToChangeFilesContents,
      this.otherFilesToKeepInContextContent,
      this.documentationFilesInContextContent,
      this.tsMorphProject!
    );

    const actionPlan = await planningAgent.getActionPlan(currentErrors);

    console.log(`Coding plan: ${JSON.stringify(actionPlan, null, 2)}`);

    if (actionPlan) {
      const implementationAgent = new PsAgentFactoryProgrammingImplementationAgent(
        this.memory,
        this.likelyToChangeFilesContents,
        this.otherFilesToKeepInContextContent,
        this.documentationFilesInContextContent,
        this.tsMorphProject!
      );

      // Loop until all actions are completed
      let allCompleted = false;
      while (!allCompleted) {
        await implementationAgent.implementCodingActionPlan(actionPlan, currentErrors);

        // Check if all actions are completed
        allCompleted = actionPlan.every(action => action.status === "completed");

        if (!allCompleted) {
          console.log("Not all actions completed, running again...");
        }
      }
    } else {
      console.error(`No coding plan received`);
    }
  }

  async implementTask() {
    if (!this.memory.existingTypeScriptFilesLikelyToChange) {
      console.error("No files to change");
      return;
    }

    this.tsMorphProject = new Project({
      tsConfigFilePath: path.join(this.memory.workspaceFolder, "tsconfig.json"),
    });

    this.tsMorphProject.addSourceFilesAtPaths("src/**/*.ts");

    this.otherFilesToKeepInContextContent = this.getFileContentsWithFileName(
      this.memory.existingOtherTypescriptFilesToKeepInContext
    );

    this.likelyToChangeFilesContents = this.getFileContentsWithFileName(
      this.memory.existingTypeScriptFilesLikelyToChange
    );

    this.documentationFilesInContextContent = this.getFileContentsWithFileName(
      this.memory.documentationFilesToKeepInContext
    );

    await this.implementChanges();
    this.memory.actionLog.push(`Implemented changes`);

    return;
  }
}
