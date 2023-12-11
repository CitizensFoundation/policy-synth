declare module 'vectorizer';

interface LtpCurrentRealityTreeDataNode {
  id: string;
  cause: string;
  isRootCause?: boolean;
  isLogicValidated?: boolean;
  andChildren?: LtpCurrentRealityTreeNode[];
  orChildren?: LtpCurrentRealityTreeNode[];
}

interface LtpCurrentRealityTreeData {
  description?: string;
  context: string;
  rawPossibleCauses: string;
  undesirableEffects: string[];
  nodes: LtpCurrentRealityTreeNode[];
}

interface CrtPromptJson {
  directCauseDescription: string;
  isDirectCause: boolean;
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
