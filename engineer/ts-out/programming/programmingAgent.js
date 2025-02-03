import { Project } from "ts-morph";
import path from "path";
import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
import { PsEngineerProgrammingPlanningAgent } from "./planningAgent.js";
import { PsEngineerProgrammingImplementationAgent } from "./implementationAgent.js";
import { PsEngineerProgrammingBuildAgent } from "./buildAgent.js";
import { PsEngineerErrorWebResearchAgent } from "../webResearch/errorsWebResearch.js";
export class PsEngineerProgrammingAgent extends PsEngineerBaseProgrammingAgent {
    async implementChanges() {
        console.log(`Implementing changes `);
        let retryCount = 0;
        const retriesUntilWebResearch = 3;
        let hasCompleted = false;
        let currentErrors = undefined;
        const buildAgent = new PsEngineerProgrammingBuildAgent(this.agent, this.memory, 0, 100, {
            likelyToChangeFilesContents: this.likelyToChangeFilesContents,
            typeDefFilesToKeepInContextContent: this.typeDefFilesToKeepInContextContent,
            documentationFilesInContextContent: this.documentationFilesInContextContent,
            codeFilesToKeepInContextContent: this.codeFilesToKeepInContextContent,
            tsMorphProject: this.tsMorphProject,
        });
        while (!hasCompleted && retryCount < this.maxRetries) {
            await this.updateRangedProgress(undefined, "Creating action plan...");
            await this.createAndRunActionPlan(currentErrors);
            await this.updateRangedProgress(undefined, "Building code...");
            currentErrors = await buildAgent.build();
            if (currentErrors && retryCount >= retriesUntilWebResearch) {
                await this.updateRangedProgress(undefined, "Searching for solutions to errors...");
                await this.searchForSolutionsToErrors(currentErrors);
            }
            if (!currentErrors) {
                hasCompleted = true;
                await this.updateRangedProgress(undefined, "Implementing changes completed");
            }
        }
    }
    async searchForSolutionsToErrors(currentErrors) {
        const docsResearcher = new PsEngineerErrorWebResearchAgent(this.agent, this.memory, 0, 100);
    }
    async createAndRunActionPlan(currentErrors = undefined) {
        await this.updateRangedProgress(undefined, "Creating action plan...");
        const planningAgent = new PsEngineerProgrammingPlanningAgent(this.agent, this.memory, 0, 100, {
            likelyToChangeFilesContents: this.likelyToChangeFilesContents,
            typeDefFilesToKeepInContextContent: this.typeDefFilesToKeepInContextContent,
            documentationFilesInContextContent: this.documentationFilesInContextContent,
            codeFilesToKeepInContextContent: this.codeFilesToKeepInContextContent,
            tsMorphProject: this.tsMorphProject,
        });
        const actionPlan = await planningAgent.getActionPlan(currentErrors);
        await this.updateRangedProgress(undefined, "Creating action plan completed");
        console.log(`Coding plan: ${JSON.stringify(actionPlan, null, 2)}`);
        if (actionPlan) {
            const implementationAgent = new PsEngineerProgrammingImplementationAgent(this.agent, this.memory, 0, 100, {
                likelyToChangeFilesContents: this.likelyToChangeFilesContents,
                typeDefFilesToKeepInContextContent: this.typeDefFilesToKeepInContextContent,
                documentationFilesInContextContent: this.documentationFilesInContextContent,
                codeFilesToKeepInContextContent: this.codeFilesToKeepInContextContent,
                tsMorphProject: this.tsMorphProject,
            });
            await this.updateRangedProgress(undefined, "Implementing changes...");
            // Loop until all actions are completed
            let allCompleted = false;
            while (!allCompleted) {
                await this.updateRangedProgress(undefined, `Implementing changes... ${actionPlan.filter((action) => action.status === "completed")
                    .length + 1} / ${actionPlan.length}`);
                await implementationAgent.implementCodingActionPlan(actionPlan, currentErrors);
                // Check if all actions are completed
                allCompleted = actionPlan.every((action) => action.status === "completed");
                if (!allCompleted) {
                    console.log("Not all actions completed, running again...");
                }
            }
        }
        else {
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
        this.typeDefFilesToKeepInContextContent = this.getFileContentsWithFileName(this.memory.usefulTypescriptDefinitionFilesToKeepInContext, "TypeDefForContext");
        this.codeFilesToKeepInContextContent = this.getFileContentsWithFileName(this.memory.usefulTypescriptCodeFilesToKeepInContext, "CodeForContext");
        this.likelyToChangeFilesContents = this.getFileContentsWithFileName(this.memory.existingTypeScriptFilesLikelyToChange, "CodeLikelyToChange");
        if (this.memory.documentationFilesToKeepInContext) {
            this.documentationFilesInContextContent =
                this.getFileContentsWithFileName(this.memory.documentationFilesToKeepInContext, "DocumentationForContext");
        }
        await this.updateRangedProgress(undefined, "Implementing changes...");
        await this.saveMemory();
        await this.implementChanges();
        await this.updateRangedProgress(undefined, "Implementing changes completed");
        this.memory.actionLog.push(`Implemented changes`);
        return;
    }
}
//# sourceMappingURL=programmingAgent.js.map