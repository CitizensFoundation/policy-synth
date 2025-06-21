import { PolicySynthAgentBase } from "../base/agentBase.js";

export class PsAgentOrchestrator {
  async execute(
    initialAgent: PsValidationAgent,
    input: string
  ): Promise<PsValidationAgentResult> {
    let currentAgent: PsValidationAgent | undefined = initialAgent;
    let finalResult: PsValidationAgentResult = { isValid: true };

    while (currentAgent) {
      PolicySynthAgentBase.logger.info(`Current agent: ${currentAgent.name}`)
      const result = await currentAgent.execute(input);

      if (
        !result.isValid ||
        (result.validationErrors && result.validationErrors.length > 0)
      ) {
        return result;
      }

      currentAgent = result.nextAgent;
    }

    return finalResult;
  }
}
