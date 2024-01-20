import { PsBaseValidationAgent } from "./baseValidationAgent.js";
export class PsParallelValidationAgent extends PsBaseValidationAgent {
    agents;
    constructor(name, options = {}, agents) {
        super(name, options);
        this.agents = agents;
    }
    async execute() {
        await this.beforeExecute();
        // Execute all agents in parallel
        const results = await Promise.all(this.agents.map(agent => agent.execute()));
        // Aggregate results
        const aggregatedResult = this.aggregateResults(results);
        console.log(`Aggregated Results: ${aggregatedResult.isValid} ${JSON.stringify(aggregatedResult.validationErrors)}`);
        aggregatedResult.nextAgent = this.options.nextAgent;
        await this.afterExecute(aggregatedResult);
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
