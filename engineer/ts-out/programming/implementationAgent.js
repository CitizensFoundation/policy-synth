import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { IEngineConstants } from "@policysynth/agents/constants.js";
import fs from "fs";
import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
export class PsEngineerProgrammingImplementationAgent extends PsEngineerBaseProgrammingAgent {
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

    ${this.documentationFilesInContextContent
            ? `Local documentation:\n${this.documentationFilesInContextContent}`
            : ``}

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
    async implementCodingPlan(fileName, codingPlan, otherFilesToKeepInContextContent, documentationFilesInContextContent, tsMorphProject) {
        this.tsMorphProject = tsMorphProject;
        this.currentFileContents = this.loadFileContents(fileName);
        this.otherLikelyToChangeFilesContents = otherFilesToKeepInContextContent;
        this.documentationFilesInContextContent =
            documentationFilesInContextContent;
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
            fs.copyFileSync(fileName, backupFileName);
            file.saveSync();
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
}
//# sourceMappingURL=implementationAgent.js.map