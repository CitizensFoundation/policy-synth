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