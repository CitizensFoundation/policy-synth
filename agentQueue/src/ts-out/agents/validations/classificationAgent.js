import { PsBaseValidationAgent } from "./baseAgent.js";
export class PsClassificationAgent extends PsBaseValidationAgent {
    routes;
    constructor(name, agentMemory, systemMessage, userMessage, streamingCallbacks) {
        super(name, agentMemory, systemMessage, userMessage, streamingCallbacks, undefined);
        this.routes = new Map();
    }
    addRoute(classification, agent) {
        this.routes.set(classification, agent);
    }
    async performExecute() {
        const classificationResult = (await this.runValidationLLM());
        const nextAgent = this.routes.get(classificationResult.classification);
        classificationResult.nextAgent = nextAgent;
        console.log(`Classification: ${classificationResult.nextAgent?.name}`);
        return classificationResult;
    }
}
