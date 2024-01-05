interface PsAgentMemory {
  set(key: string, value: any): void;
  get(key: string): any;
}

interface PsValidationAgentResult {
  isValid: boolean;
  validationErrors?: string[];
  nextAgent?: PsValidationAgent;
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