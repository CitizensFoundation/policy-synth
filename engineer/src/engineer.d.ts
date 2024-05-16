type PsEngineerAgentTypes =
  | "planner"
  | "webDocResearcher"
  | "webExamplesResearcher"
  | "typescriptCoder"
  | "typescriptCompiler"
  | "codeReviewer"
  | "testWriter"
  | "testWriterReviewer"
  | "tester";

interface PsEngineerProject {
  id?: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
  projectPlan: PsEngineerTask[];
}

interface PsEngineerTask {
  id?: number;
  description: string;
  startDate: string;
  endDate: string;
  status: "completed" | "inProgress" | "notStarted" | "error";
  assignedAgent: PsEngineerAgentTypes;
}

interface PsEngineerAgent {
  systemMessage: string;
  contexts: string[];
  type: PsEngineerAgentTypes;
}

interface PsEngineerContextItem {
  type: "code" | "documentation" | "example";
  title: string;
  content: string;
}

interface PsEngineerPlanningResults {

  existingTypeScriptFilesLikelyToChange: string[];
  existingOtherTypescriptFilesToKeepInContext: string[];
  documentationFilesToKeepInContext: string[];
  likelyRelevantNpmPackageDependencies: string[];
  needsDocumentionsAndExamples: boolean;
}

interface PsEngineerDocsResearch {
  documentPartTitle: string;
  documentPartContent: string;
  possiblyRelevantForNpmModules: string[];
  possiblyRelevantForTypescriptFiles: string[];
  whyIsThisRelevant: string;
}

interface PsEngineerExampleResearch {
  sourceCodeExamplePartTitle: string;
  sourceCodeExamplePartContent: string;
  possiblyRelevantForNpmModules: string[];
  possiblyRelevantForTypescriptFiles: string[];
  whyIsThisRelevant: string;
}

interface PsEngineerFileData {
  fileName: string;
  content: string;
}

interface PsEngineerMemoryData extends PSMemoryData {
  workspaceFolder: string;
  taskDescription: string;
  taskTitle: string;
  taskInstructions: string;
  actionLog: string[];
  docsSiteToScan?: string[];
  currentTask?: {
    filesCompleted?: PsEngineerFileData[];
    originalFiles?: PsEngineerFileData[];
  }
  solutionsToErrorsSearchResults?: string;
  allTypescriptSrcFiles?: string[];
  currentFilesBeingAdded?: string[];
  existingTypeScriptFilesLikelyToChange: string[];
  existingOtherTypescriptFilesToKeepInContext: string[];
  documentationFilesToKeepInContext: string[];
  needsDocumentionsAndExamples?: boolean;
  allTypeDefsContents?: string;
  likelyRelevantNpmPackageDependencies: string[];
  docsContextItems?: string[];
  exampleContextItems?: string[];
}

type PsEngineerFileActions = "add" | "change" | "delete";

interface PsEngineerCodingActionPlanItem {
  fullPathToNewOrUpdatedFile: string;
  codingTaskTitle: string;
  codingTaskFullDescription: string;
  status?: "completed" | "inProgress" | "notStarted" | "error";
  fileAction: PsEngineerFileActions;
}

type PsEngineerWebResearchTypes = "documentation" | "codeExamples" | "solutionsForErrors";

interface PsTsMorphNewOrUpdatedFunction {
  name: string;
  parameters: { name: string; type: string }[];
  returnType: string;
  statements: string;
}

interface PsTsMorphNewOrUpdatedProperty {
  name: string;
  type: string;
  className: string;
}

interface PsEngineerCodeChange {
  action:
    | "changeFunction"
    | "addFunction"
    | "deleteFunction"
    | "addProperty"
    | "deleteProperty"
    | "changeProperty"
    | "addFile"
    | "deleteFile"
    | "addImport"
    | "deleteImport"
    | "changeImport"
    | "addDependency"
    | "deleteDependency"
    | "changeDependency";
  functionOrPropertyImportDependencyName: string;
  fullCodeToInsertOrChange: PsTsMorphNewFunction | string | undefined;
}
