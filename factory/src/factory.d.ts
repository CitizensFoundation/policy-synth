type PsAgentFactoryAgentTypes =
  | "planner"
  | "webDocResearcher"
  | "webExamplesResearcher"
  | "typescriptCoder"
  | "typescriptCompiler"
  | "codeReviewer"
  | "testWriter"
  | "testWriterReviewer"
  | "tester";

interface PsAgentFactoryProject {
  id?: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
  projectPlan: PsAgentFactoryTask[];
}

interface PsAgentFactoryTask {
  id?: number;
  description: string;
  startDate: string;
  endDate: string;
  status: "completed" | "inProgress" | "notStarted" | "error";
  assignedAgent: PsAgentFactoryAgentTypes;
}

interface PsAgentFactoryAgent {
  systemMessage: string;
  contexts: string[];
  type: PsAgentFactoryAgentTypes;
}

interface PsAgentFactoryContextItem {
  type: "code" | "documentation" | "example";
  title: string;
  content: string;
}

interface PsAgentFactoryPlanningResults {

  existingTypeScriptFilesLikelyToChange: string[];
  existingOtherTypescriptFilesToKeepInContext: string[];
  documentationFilesToKeepInContext: string[];
  likelyRelevantNpmPackageDependencies: string[];
  needsDocumentionsAndExamples: boolean;
}

interface PsAgentFactoryDocsResearch {
  documentPartTitle: string;
  documentPartContent: string;
  possiblyRelevantForNpmModules: string[];
  possiblyRelevantForTypescriptFiles: string[];
  whyIsThisRelevant: string;
}

interface PsAgentFactoryExampleResearch {
  sourceCodeExamplePartTitle: string;
  sourceCodeExamplePartContent: string;
  possiblyRelevantForNpmModules: string[];
  possiblyRelevantForTypescriptFiles: string[];
  whyIsThisRelevant: string;
}

interface PsAgentFactoryFileData {
  fileName: string;
  content: string;
}

interface PsAgentFactoryMemoryData extends PSMemoryData {
  workspaceFolder: string;
  taskDescription: string;
  taskTitle: string;
  taskInstructions: string;
  actionLog: string[];
  docsSiteToScan?: string[];
  currentTask?: {
    filesCompleted?: PsAgentFactoryFileData[];
    originalFiles?: PsAgentFactoryFileData[];
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

type PsAgentFactoryFileActions = "add" | "change" | "delete";

interface PsAgentFactoryCodingActionPlanItem {
  fullPathToNewOrUpdatedFile: string;
  codingTaskTitle: string;
  codingTaskFullDescription: string;
  status?: "completed" | "inProgress" | "notStarted" | "error";
  fileAction: PsAgentFactoryFileActions;
}

type PsAgentFactoryWebResearchTypes = "documentation" | "codeExamples" | "solutionsForErrors";

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

interface PsAgentFactoryCodeChange {
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
