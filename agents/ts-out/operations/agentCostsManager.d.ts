interface AgentCost {
    agentCosts: object;
    totalCost: string;
}
export declare class AgentCostManager {
    getAgentCosts(agentId: number): Promise<AgentCost>;
    getSingleAgentCosts(agentId: number): Promise<string>;
}
export {};
//# sourceMappingURL=agentCostsManager.d.ts.map