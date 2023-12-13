declare module 'vectorizer';

type CrtNodeType = 'ude' | 'directCause' | 'intermediateCause' | 'rootCause';

interface LtpCurrentRealityTreeDataNode {
  id: string;
  description: string;
  type: CrtNodeType;
  isRootCause?: boolean;
  isLogicValidated?: boolean;
  andChildren?: LtpCurrentRealityTreeNode[];
  orChildren?: LtpCurrentRealityTreeNode[];
}

interface LtpCurrentRealityTreeData {
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
}

interface LtpSimplifiedChatLog {
  sender: string;
  message: string;
}

interface LtpChatBotCrtMessage {
  message: string;
  rawMessage: string;
  refinedCausesSuggestions?: string[];
}

interface CrtRefinedCausesReply {
  feedback: string;
  refinedCauses: string[];
}
