interface PsAgentMemory {
  set(key: string, value: any): void;
  get(key: string): any;
  structuredAnswerOverrides?: Record<string, any>;
}

interface PsValidationAgentResult {
  isValid: boolean;
  validationErrors?: string[];
  nextAgent?: PsValidationAgent;
  lastAgent?: boolean;
}

interface PsValidationAgent {
  name: string;
  execute(input: string): Promise<PsValidationAgentResult>;
}

interface PsClassificationAgentResult extends PsValidationAgentResult {
  classification: string;
}

interface PsMetricClassificationAgentResult extends PsClassificationAgentResult {
  moreThanOneCause: boolean;
  classification: "direct" | "derived" | "nometric";
}

//TODO: Import real types for Callbacks from langchain and WebSockets
interface PsBaseValidationAgentOptions {
  agentMemory?: PsAgentMemory;
  nextAgent?: PsValidationAgent;
  validationErrors?: string[];
  systemMessage?: string;
  userMessage?: string;
  streamingCallbacks?: any;
  webSocket?: any;
  disableStreaming?: boolean;
  hasNoStreaming?: boolean;
}

interface PsAgentStartWsOptions {
  name: string;
  noStreaming?: boolean;
}

interface PsAgentCompletedWsOptions {
  name: string;
  results: PsValidationAgentResult;
}
