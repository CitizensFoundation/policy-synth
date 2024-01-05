class AgentOrchestrator {
  async execute(initialAgent: PsValidationAgent, input: string): Promise<PsValidationAgentResult> {
    let currentAgent: PsValidationAgent | undefined = initialAgent;
    let finalResult: PsValidationAgentResult = { isValid: true };

    while (currentAgent) {
      const result = await currentAgent.execute(input);

      if (!result.isValid) {
        return result;
      }

      currentAgent = result.nextAgent;
    }

    return finalResult;
  }
}
