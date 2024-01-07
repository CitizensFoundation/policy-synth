declare module 'vectorizer';
declare module 'dagre';

type CrtNodeType = 'ude' | 'directCause' | 'assumption' | 'intermediateCause' | 'rootCause';

interface CrtDebugData  {
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
  andChildren?: LtpCurrentRealityTreeNode[];
  orChildren?: LtpCurrentRealityTreeNode[];
}

interface LtpCurrentRealityTreeData {
  id: string | number;
  description?: string;
  context: string;
  undesirableEffects: string[];
  nodes: LtpCurrentRealityTreeNode[];
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

interface LtpAiChatWsMessage {
  sender: string;
  type: 'hello_message' | 'moderation_error' | 'start' | 'message' | 'end' | 'stream' | 'noStreaming' | 'error' | 'info' | 'validationAgentStart' | 'validationAgentCompleted' | 'thinking' | 'start_followup' | 'end_followup' | 'stream_followup';
  message: string;
  rawMessage?: string;
  refinedCausesSuggestions?: string[];
  debug?: CrtDebugData;
  hidden?: boolean;
}

interface LtpSimplifiedChatLog {
  sender: string;
  message: string;
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
  element: LtpCurrentRealityTreeNode;
}
