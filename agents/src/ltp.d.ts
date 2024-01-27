type CrtNodeType =
  | "ude"
  | "directCause"
  | "assumption"
  | "intermediateCause"
  | "rootCause";

interface CrtDebugData {
  systemPromptUsedForGeneration?: string;
  firstUserMessageUserForGeneration?: string;
}

interface LtpCurrentRealityTreeDataNode {
  id: string;
  description: string;
  type: CrtNodeType;
  isRootCause?: boolean;
  isLogicValidated?: boolean;
  debug?: CrtDebugData;
  children?: LtpCurrentRealityTreeNode[];
  orChildren?: LtpCurrentRealityTreeNode[];
}

interface LtpCurrentRealityTreeData {
  id: string | number;
  description?: string;
  context: string;
  undesirableEffects: string[];
  nodes: LtpCurrentRealityTreeNode[];
  prompts?: Record<number, string>;
}

interface LtpCrtSimplifiedForAI {
  effect: string;
  causes: LtpCrtSimplifiedForAI[];
  isCurrentlyLookingForCausesToThisEffect?: boolean;
}

interface CrtPromptJson {
  directCauseDescription: string;
  isDirectCause: boolean;
  type: CrtNodeType;
  isLikelyARootCauseOfUDE: boolean;
  confidenceLevel: number;
}

interface CrtResponse {
  crt: LtpCurrentRealityTreeData;
}

interface LtpChatBotCrtMessage {
  message: string;
  rawMessage: string;
  refinedCausesSuggestions?: string[];
  debug?: CrtDebugData;
}

interface CrtRefinedCausesReply {
  suggestedCauses?: string[];
  suggestedAssumptions?: string[];
}

interface CrtEditNodeInfo {
  nodeId: string;
  //@ts-ignore
  element: LtpCurrentRealityTreeNode;
}
