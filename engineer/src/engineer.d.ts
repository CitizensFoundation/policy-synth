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
  existingTypeScriptFilesThatCouldPossiblyChangeForFurtherInvestigation: string[];
  otherUsefulTypescriptCodeFilesThatCouldBeRelevant: string[];
  usefulTypescriptDefinitionFilesThatCouldBeRelevant: string[];
  documentationFilesThatCouldBeRelevant: string[];
  likelyRelevantNpmPackageDependencies: string[];
  needsDocumentationAndExamples: boolean;
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

interface PsCodeAnalyzeResults {
  filePath: string;
  relevantFor:
    | "likelyToChangeToImplementTask"
    | "goodReferenceCodeForTask"
    | "goodReferenceTypeDefinition"
    | "goodReferenceDocumentation"
    | "notRelevant";
  detailedCodeAnalysisForRelevanceToTask: string;
}

interface PsEngineerMemoryData extends PsAgentMemoryData {
  workspaceFolder: string;
  taskDescription: string;
  taskTitle: string;
  taskInstructions: string;
  actionLog: string[];
  outsideTypedefPath?: string;
  docsSitesToScan?: string[];
  currentTask?: {
    filesCompleted?: PsEngineerFileData[];
    originalFiles?: PsEngineerFileData[];
  };
  solutionsToErrorsSearchResults?: string;
  allTypescriptSrcFiles?: string[];
  currentFilesBeingAdded?: string[];
  existingTypeScriptFilesLikelyToChange: PsCodeAnalyzeResults[];
  existingTypeScriptFilesLikelyToChangeContents?: string;
  usefulTypescriptDefinitionFilesToKeepInContext: PsCodeAnalyzeResults[];
  usefulTypescriptCodeFilesToKeepInContext: PsCodeAnalyzeResults[];
  documentationFilesToKeepInContext: string[];
  needsDocumentationAndExamples?: boolean;
  allTypeDefsContents?: string;
  likelyRelevantNpmPackageDependencies: string[];
  docsContextItems?: string[];
  exampleContextItems?: string[];
  allCodingPlans: string[];
  latestActionItemPlan: PsEngineerCodingActionPlanItem[];
  allBuildErrors: string[];
  analysisResults: PsEngineerPlanningResults;
  timingResults: PsEngineerTimingResults[];
  rejectedFilesForRelevance: string[];
  acceptedFilesForRelevance: string[];
}

interface PsEngineerTimingResults {
  agentName: string;
  totalTimeInSeconds: number;
}

type PsEngineerFileActions = "add" | "change" | "delete";

interface PsEngineerCodingActionPlanItem {
  fullPathToNewOrUpdatedFile: string;
  codingTaskTitle: string;
  codingTaskStepsWithDetailedDescription: string[];
  status?: "completed" | "inProgress" | "notStarted" | "error";
  fileAction: PsEngineerFileActions;
}

type PsEngineerWebResearchTypes =
  | "documentation"
  | "codeExamples"
  | "solutionsForErrors";

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
