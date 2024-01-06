import { PsBaseValidationAgent } from "./baseValidationAgent.js";
export class PsClassificationAgent extends PsBaseValidationAgent {
    routes;
    constructor(name, options = {}) {
        super(name, options);
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
