export class ParallelAgent extends PsBaseValidationAgent {
    agents;
    constructor(name, agents, agentMemory, systemMessage, userMessage, streamingCallbacks, nextAgent) {
        super(name, agentMemory, systemMessage, userMessage, streamingCallbacks, nextAgent);
        this.agents = agents;
    }
    async execute(input) {
        await this.beforeExecute(input);
        // Execute all agents in parallel
        const results = await Promise.all(this.agents.map(agent => agent.execute(input)));
        // Aggregate results
        const aggregatedResult = this.aggregateResults(results);
        console.log(`Aggregated Results: ${aggregatedResult.isValid} ${JSON.stringify(aggregatedResult.validationErrors)}`);
        aggregatedResult.nextAgent = this.nextAgent;
        await this.afterExecute(input, aggregatedResult);
        return aggregatedResult;
    }
    aggregateResults(results) {
        let isValid = true;
        let validationErrors = [];
        for (const result of results) {
            if (!result.isValid) {
                isValid = false;
            }
            if (result.validationErrors) {
                validationErrors = [...validationErrors, ...result.validationErrors];
            }
        }
        return { isValid, validationErrors, nextAgent: undefined };
    }
}
