import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PolicySynthAgentBase } from "@policysynth/agents/baseAgent.js";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import { ChatOpenAI } from "@langchain/openai";
import { Project, } from "ts-morph";
import fs from "fs";
import path from "path";
export class PsEngineerProgrammingAgent extends PolicySynthAgentBase {
    memory;
    otherFilesToKeepInContextContent;
    documentationFilesInContextContent;
    maxPlanRetries = 7;
    maxCodingRetries = 7;
    tsMorphProject;
    currentFileContents;
    otherLikelyToChangeFilesContents;
    constructor(memory) {
        super(memory);
        this.memory = memory;
        this.chat = new ChatOpenAI({
            temperature: 0.0,
            maxTokens: 4000,
            modelName: IEngineConstants.engineerModel.name,
            verbose: false
        });
    }
    async implementChangesToFile(fileName) {
        console.log(`Implementing changes to ${fileName}`);
        const codingPlan = await this.getCodingPlan(fileName);
        console.log(`Coding plan: ${codingPlan}`);
        if (codingPlan) {
            await this.implementCodingPlan(fileName, codingPlan);
        }
        else {
            console.error(`No coding plan received for ${fileName}`);
        }
    }
    get codingSystemPrompt() {
        return `Your are an expert software engineering analyzer.

      Instructions:
      1. Review the task name, description and general instructions.
      2. Review the documentation, examples, code and typedefs.
      3. Use the provided coding plan to implement the changes.
      4. Only add new files if you really must and can't change the existing ones without bloat.

      interface PsTsMorphNewOrUpdatedFunction
      {
        name: string;
        parameters: { name: string; type: string }[];
        returnType: string;
        statements: string;
      }

      interface PsTsMorphNewOrUpdatedProperty
      {
        name: string;
        type: string;
        className: string; // The name of the main class in the file
      }

      JSON Array Output Schema:
      [
        {
          action: "changeFunction" | "addFunction" | "deleteFunction" | "addProperty" | "deleteProperty" | "changeProperty" | "addFile" | "deleteFile" | "addImport" | "deleteImport" | "changeImport" | "addDependency" | "deleteDependency" | "changeDependency";
          functionOrPropertyImportDependencyName: string;
          fullCodeToInsertOrChange: PsTsMorphNewOrUpdatedFunction | PsTsMorphNewOrUpdatedProperty | string | undefined;
        }
      ]
    `;
    }
    codingUserPrompt(codingPlan, currentFileName, currentFileContents, otherFilesContents) {
        return `${this.memory.exampleContextItems &&
            this.memory.exampleContextItems.length > 0
            ? `Potentally relevant code examples:
    ${this.memory.exampleContextItems.map((i) => i)}`
            : ``}
    ${this.memory.docsContextItems && this.memory.docsContextItems.length > 0
            ? `Potentally relevant documentation from a web search:
    ${this.memory.docsContextItems.map((i) => i)}`
            : ``}

    ${otherFilesContents
            ? `Other potentially relevant source code files:\n${otherFilesContents}`
            : ``}

    ${this.documentationFilesInContextContent ? `Local documentation:\n${this.documentationFilesInContextContent}` : ``}

    File we are working on:
    ${currentFileName}

    Current file:
    ${currentFileContents}

    Overall task title:
    ${this.memory.taskTitle}

    Overall task description:
    ${this.memory.taskDescription}

    Overall task instructions: ${this.memory.taskInstructions}

    Coding plan for this current file:
    ${codingPlan}

    Your JSON Output:
    `;
    }
    async getCodeChanges(fileName, codingPlan) {
        const codeChanges = await this.callLLM("engineering-agent", IEngineConstants.engineerModel, [
            new SystemMessage(this.codingSystemPrompt),
            new HumanMessage(this.codingUserPrompt(codingPlan, fileName, this.currentFileContents, this.otherLikelyToChangeFilesContents)),
        ], true);
        return codeChanges;
    }
    async implementCodingPlan(fileName, codingPlan) {
        const file = this.tsMorphProject?.getSourceFileOrThrow(fileName);
        if (file) {
            console.log(`Implementing changes to ${fileName}`);
            const codeChanges = await this.getCodeChanges(fileName, codingPlan);
            console.log(`Code changes: ${JSON.stringify(codeChanges, null, 2)}`);
            for (let codeChange of codeChanges) {
                console.log(`Implementing change: ${codeChange.action}`);
                switch (codeChange.action) {
                    case "addFunction":
                        this.addFunction(file, codeChange.functionOrPropertyImportDependencyName, codeChange.fullCodeToInsertOrChange);
                        break;
                    case "changeFunction":
                        this.changeFunction(file, codeChange.functionOrPropertyImportDependencyName, codeChange.fullCodeToInsertOrChange);
                        break;
                    case "deleteFunction":
                        this.deleteFunction(file, codeChange.functionOrPropertyImportDependencyName);
                        break;
                    case "addProperty":
                        this.addProperty(file, codeChange.fullCodeToInsertOrChange);
                        break;
                    case "changeProperty":
                        this.changeProperty(file, codeChange.fullCodeToInsertOrChange);
                        break;
                    case "deleteProperty":
                        this.deleteProperty(file, codeChange.fullCodeToInsertOrChange);
                        break;
                    case "addFile":
                        this.addFile(codeChange.functionOrPropertyImportDependencyName, codeChange.fullCodeToInsertOrChange);
                        break;
                    case "deleteFile":
                        this.deleteFile(codeChange.functionOrPropertyImportDependencyName);
                        break;
                    case "addImport":
                        this.addImport(file, codeChange.functionOrPropertyImportDependencyName, codeChange.fullCodeToInsertOrChange);
                        break;
                    case "deleteImport":
                        this.deleteImport(file, codeChange.functionOrPropertyImportDependencyName);
                        break;
                    case "changeImport":
                        this.changeImport(file, codeChange.functionOrPropertyImportDependencyName, codeChange.fullCodeToInsertOrChange);
                        break;
                    case "addDependency":
                        this.addDependency(codeChange.functionOrPropertyImportDependencyName);
                        break;
                    case "deleteDependency":
                        this.deleteDependency(codeChange.functionOrPropertyImportDependencyName);
                        break;
                    case "changeDependency":
                        this.changeDependency(codeChange.functionOrPropertyImportDependencyName, codeChange.fullCodeToInsertOrChange);
                        break;
                    default:
                        console.error(`Invalid action: ${codeChange.action}`);
                        break;
                }
            }
            // Make a copy of the current file to the same name but with a .bkc ending and then save the typescript file over the current file
            const backupFileName = fileName + ".bkc";
            fs.copyFileSync(path.join(this.memory.workspaceFolder, fileName), path.join(this.memory.workspaceFolder, backupFileName));
            file.saveSync();
            // Print out the file in text
            console.log(file.getText());
        }
        else {
            console.error(`File not found: ${fileName}`);
        }
    }
    addFunction(file, functionName, functionDetails) {
        const existingFunction = file.getFunction(functionName);
        if (existingFunction) {
            existingFunction.set({
                parameters: functionDetails.parameters,
                returnType: functionDetails.returnType,
                statements: functionDetails.statements,
            });
        }
        else {
            file.addFunction({
                name: functionDetails.name,
                parameters: functionDetails.parameters,
                returnType: functionDetails.returnType,
                statements: functionDetails.statements,
            });
        }
    }
    deleteFunction(file, functionName) {
        const existingFunction = file.getFunction(functionName);
        existingFunction?.remove();
    }
    // Change existing function
    changeFunction(file, functionName, functionDetails) {
        const existingFunction = file.getFunction(functionName);
        if (existingFunction) {
            existingFunction.set({
                parameters: functionDetails.parameters,
                returnType: functionDetails.returnType,
                statements: functionDetails.statements,
            });
        }
    }
    // Add property to a class
    addProperty(file, propertyDetails) {
        const classDeclaration = file.getClass(propertyDetails.className);
        if (classDeclaration) {
            classDeclaration.addProperty({
                name: propertyDetails.name,
                type: propertyDetails.type,
            });
        }
    }
    // Change property in a class
    changeProperty(file, propertyDetails) {
        const classDeclaration = file.getClass(propertyDetails.className);
        if (classDeclaration) {
            const property = classDeclaration.getProperty(propertyDetails.name);
            if (property) {
                property.setType(propertyDetails.type);
            }
        }
    }
    // Delete property from a class
    deleteProperty(file, propertyInfo) {
        const classDeclaration = file.getClass(propertyInfo.className);
        if (classDeclaration) {
            const property = classDeclaration.getProperty(propertyInfo.name);
            property?.remove();
        }
    }
    // Change import
    changeImport(file, originalModuleName, newModuleName) {
        const importDecl = file.getImportDeclaration(originalModuleName);
        if (importDecl) {
            importDecl.setModuleSpecifier(newModuleName);
        }
    }
    // Add dependency
    addDependency(dependancy) {
        console.log(`NOT IMPLEMENTED: Added dependency: ${dependancy}`);
    }
    // File operations
    addFile(filePath, content) {
        fs.writeFileSync(filePath, content, { encoding: "utf8" });
    }
    deleteFile(filePath) {
        fs.unlinkSync(filePath);
    }
    // Import operations
    addImport(file, moduleName, symbols) {
        file.addImportDeclaration({
            moduleSpecifier: moduleName,
            namedImports: symbols.map((symbol) => ({ name: symbol })),
        });
    }
    deleteImport(file, moduleName) {
        const importDecl = file.getImportDeclaration(moduleName);
        importDecl?.remove();
    }
    deleteDependency(dependencyName) {
        console.log(`NOT IMPLEMENTED: Deleted dependency: ${dependencyName}`);
    }
    changeDependency(dependencyName, version) {
        console.log(`NOT IMPLEMENTED: Changed dependency ${dependencyName} to version ${version}`);
    }
    planSystemPrompt() {
        return `You are an expert software engineering analyzer.

    Instructions:
    1. Review the file name and its current contents.
    2. Consider the overall task title, description, and instructions.
    3. Create a detailed, step-by-step coding plan that specifies the code changes needed to accomplish the task.
    4. Do not include documentation tasks, that is already done automatically, focus on the programming changes.

    Expected Output:
    Provide a detailed step-by-step plan in natural language or pseudo-code, explaining the changes to be made, why they are necessary, and how they should be implemented.
    `;
    }
    getUserPlanPrompt(fileName, reviewLog) {
        return `File to plan changes for:
    ${fileName}

    Current file contents:
    ${this.currentFileContents}

    Overall task title:
    ${this.memory.taskTitle}

    Overall task description:
    ${this.memory.taskDescription}

    Overall task instructions:
    ${this.memory.taskInstructions}

    ${this.documentationFilesInContextContent ? `Local documentation:\n${this.documentationFilesInContextContent}` : ``}

    ${reviewLog ? `<LastReviewOnThisPlan>${reviewLog}</LastReviewOnThisPlan>` : ``}

    Please provide a detailed, step-by-step coding plan based on the information above. Include rationale for each change and suggestions on how to implement them.
    `;
    }
    reviewSystemPrompt() {
        return `You are an expert software engineering analyzer.

    Instructions:
    1. Review the proposed coding plan.
    2. Assess its feasibility, correctness, and completeness.
    3. Provide detailed feedback if you find issues or approve the plan if it meets the criteria with the words "Coding plan looks good".
    4. Plan should not include documentation tasks, that is already done automatically, focus on the programming changes.
    5. If the plan is good only output "Coding plan looks good" or "No changes needed to this code".

    Expected Output:
    Provide feedback on the coding plan. If the plan is not suitable, suggest necessary adjustments. If the plan is acceptable, confirm that it is ready for implementation.
    `;
    }
    getUserReviewPrompt(fileName, codingPlan, reviewLog) {
        return `File to review:
    ${fileName}

    Current file contents:
    ${this.currentFileContents}

    Overall task title:
    ${this.memory.taskTitle}

    Overall task description:
    ${this.memory.taskDescription}

    Overall task instructions:
    ${this.memory.taskInstructions}

    ${this.documentationFilesInContextContent ? `Local documentation:\n${this.documentationFilesInContextContent}` : ``}

    Proposed coding plan:
    ${codingPlan}

    Please review the coding plan for feasibility, correctness, and completeness. Provide detailed feedback on each step of the plan or confirm its readiness for implementation. Mention specific areas for improvement if any.
    `;
    }
    async getCodingPlan(fileName) {
        let planReady = false;
        let planRetries = 0;
        let reviewLog = "";
        let codingPlan;
        this.currentFileContents = this.loadFileContents(fileName);
        this.otherLikelyToChangeFilesContents =
            this.memory.typeScriptFilesLikelyToChange
                .filter((file) => file !== fileName)
                .map((file) => this.loadFileContents(file))
                .join("\n");
        while (!planReady && planRetries < this.maxPlanRetries) {
            console.log(`Getting coding plan for ${fileName} attempt ${planRetries + 1}`);
            codingPlan = await this.callLLM("engineering-agent", IEngineConstants.engineerModel, [
                new SystemMessage(this.planSystemPrompt()),
                new HumanMessage(this.getUserPlanPrompt(fileName, reviewLog)),
            ], false);
            if (codingPlan) {
                console.log(`Coding plan received: ${codingPlan}`);
                const review = await this.callLLM("engineering-agent", IEngineConstants.engineerModel, [
                    new SystemMessage(this.reviewSystemPrompt()),
                    new HumanMessage(this.getUserReviewPrompt(fileName, codingPlan, reviewLog)),
                ], false);
                if ((review && review.indexOf("Coding plan looks good") > -1) ||
                    review.indexOf("No changes needed to this code") > -1) {
                    planReady = true;
                    console.log("Coding plan approved");
                }
                else {
                    reviewLog = review + `\n`;
                    planRetries++;
                }
            }
            else {
                console.error("No plan received");
                planRetries++;
            }
        }
        return codingPlan;
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
    loadFileContents(fileName) {
        try {
            const content = fs.readFileSync(fileName, "utf-8");
            return content;
        }
        catch (error) {
            console.error(`Error reading file ${fileName}: ${error}`);
            return null;
        }
    }
}
//# sourceMappingURL=programmingAgent.js.map