import { Project } from "ts-morph";
import path from "path";

import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
import { PsEngineerProgrammingPlanningAgent } from "./planningAgent.js";
import { PsEngineerProgrammingImplementationAgent } from "./implementationAgent.js";

export class PsEngineerProgrammingAgent extends PsEngineerBaseProgrammingAgent {
  async implementChangesToFile(fileName: string) {
    console.log(`Implementing changes to ${fileName}`);

    const planningAgent = new PsEngineerProgrammingPlanningAgent(this.memory);
    const codingPlan = await planningAgent.getCodingPlan(
      fileName,
      this.otherFilesToKeepInContextContent,
      this.documentationFilesInContextContent,
      this.tsMorphProject!
    );

    console.log(`Coding plan: ${codingPlan}`);

    if (codingPlan) {
      const implementationAgents = new PsEngineerProgrammingImplementationAgent(
        this.memory
      );
      await implementationAgents.implementCodingPlan(
        fileName,
        codingPlan,
        this.otherFilesToKeepInContextContent,
        this.documentationFilesInContextContent,
        this.tsMorphProject!
      );
    } else {
      console.error(`No coding plan received for ${fileName}`);
    }
  }

  async implementTask() {
    if (!this.memory.typeScriptFilesLikelyToChange) {
      console.error("No files to change");
      return;
    }

    this.tsMorphProject = new Project({
      tsConfigFilePath: path.join(this.memory.workspaceFolder, "tsconfig.json"),
    });

    this.tsMorphProject.addSourceFilesAtPaths("src/**/*.ts");

    this.otherFilesToKeepInContextContent =
      this.memory.otherTypescriptFilesToKeepInContext
        .map((fileName) => this.loadFileContents(fileName))
        .join("\n");

    this.documentationFilesInContextContent =
      this.memory.documentationFilesToKeepInContext
        .map((fileName) => this.loadFileContents(fileName))
        .join("\n");

    for (let fileNameToChange of this.memory.typeScriptFilesLikelyToChange) {
      await this.implementChangesToFile(fileNameToChange);
      this.memory.actionLog.push(`Implemented changes to ${fileNameToChange}`);
    }

    return;
  }
}
