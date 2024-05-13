import { Project } from "ts-morph";
import path from "path";

import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
import { PsEngineerProgrammingPlanningAgent } from "./planningAgent.js";
import { PsEngineerProgrammingImplementationAgent } from "./implementationAgent.js";
import { PsEngineerProgrammingBuildAgent } from "./buildAgent.js";

export class PsEngineerProgrammingAgent extends PsEngineerBaseProgrammingAgent {
  async implementChanges() {
    console.log(`Implementing changes `);

    let retryCount = 0;
    let hasCompleted = false;
    let currentErrors: string | undefined = undefined;

    while (!hasCompleted && retryCount < this.maxRetries) {
      await this.createAndRunActionPlan(currentErrors);
      const buildAgent = new PsEngineerProgrammingBuildAgent(this.memory);
      currentErrors = await buildAgent.build();
    }
  }

  async createAndRunActionPlan(currentErrors: string | undefined = undefined) {
    const planningAgent = new PsEngineerProgrammingPlanningAgent(
      this.memory,
      this.likelyToChangeFilesContents,
      this.otherFilesToKeepInContextContent,
      this.documentationFilesInContextContent,
      this.tsMorphProject!
    );

    const actionPlan = await planningAgent.getActionPlan(currentErrors);

    console.log(`Coding plan: ${JSON.stringify(actionPlan, null, 2)}`);

    if (actionPlan) {
      const implementationAgent = new PsEngineerProgrammingImplementationAgent(
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
