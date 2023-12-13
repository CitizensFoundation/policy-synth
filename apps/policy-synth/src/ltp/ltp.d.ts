declare module 'vectorizer';

type CrtNodeType = 'ude' | 'directCause' | 'intermediateCause' | 'rootCause';

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
  id: string;
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
  type: 'hello_message' | 'moderation_error' | 'start' | 'message' | 'end' | 'stream' | 'error' | 'info' | 'thinking' | 'start_followup' | 'end_followup' | 'stream_followup';
  message: string;
  rawMessage?: string;
  refinedCausesSuggestions?: string[];
  debug?: CrtDebugData;
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
  feedback: string;
  refinedCauses: string[];
}
