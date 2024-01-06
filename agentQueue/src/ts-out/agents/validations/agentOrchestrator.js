export class AgentOrchestrator {
    async execute(initialAgent, input) {
        let currentAgent = initialAgent;
        let finalResult = { isValid: true };
        while (currentAgent) {
            console.log(`Current agent: ${currentAgent.name}`);
            const result = await currentAgent.execute(input);
            if (!result.isValid ||
                (result.validationErrors && result.validationErrors.length > 0)) {
                return result;
            }
            currentAgent = result.nextAgent;
        }
        return finalResult;
    }
}
