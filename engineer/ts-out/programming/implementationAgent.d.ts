import { Project, SourceFile } from "ts-morph";
import { PsEngineerBaseProgrammingAgent } from "./baseAgent.js";
export declare class PsEngineerProgrammingImplementationAgent extends PsEngineerBaseProgrammingAgent {
    get codingSystemPrompt(): string;
    codingUserPrompt(codingPlan: string, currentFileName: string, currentFileContents: string | null | undefined, otherFilesContents: string | null | undefined): string;
    getCodeChanges(fileName: string, codingPlan: string): Promise<PsEngineerCodeChange[]>;
    implementCodingPlan(fileName: string, codingPlan: string, otherFilesToKeepInContextContent: string | undefined, documentationFilesInContextContent: string | undefined, tsMorphProject: Project): Promise<void>;
    addFunction(file: SourceFile, functionName: string, functionDetails: PsTsMorphNewOrUpdatedFunction): void;
    deleteFunction(file: SourceFile, functionName: string): void;
    changeFunction(file: SourceFile, functionName: string, functionDetails: PsTsMorphNewOrUpdatedFunction): void;
    addProperty(file: SourceFile, propertyDetails: PsTsMorphNewOrUpdatedProperty): void;
    changeProperty(file: SourceFile, propertyDetails: PsTsMorphNewOrUpdatedProperty): void;
    deleteProperty(file: SourceFile, propertyInfo: PsTsMorphNewOrUpdatedProperty): void;
    changeImport(file: SourceFile, originalModuleName: string, newModuleName: string): void;
    addDependency(dependancy: string): void;
    addFile(filePath: string, content: string): void;
    deleteFile(filePath: string): void;
    addImport(file: SourceFile, moduleName: string, symbols: string[]): void;
    deleteImport(file: SourceFile, moduleName: string): void;
    deleteDependency(dependencyName: string): void;
    changeDependency(dependencyName: string, version: string): void;
}
//# sourceMappingURL=implementationAgent.d.ts.map