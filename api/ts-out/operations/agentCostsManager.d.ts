import express from "express";
interface AgentCost {
    agentCosts: object;
    totalCost: string;
}
export declare class AgentCostManager {
    getAgentCosts(req: express.Request, res: express.Response): Promise<AgentCost>;
    getSingleAgentCosts(req: express.Request, res: express.Response): Promise<string>;
}
export {};
//# sourceMappingURL=agentCostsManager.d.ts.map