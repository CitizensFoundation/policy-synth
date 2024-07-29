interface AgentCost {
    agentCosts: object;
    totalCost: string;
}
interface DetailedAgentCost {
    createdAt: Date;
    agentName: string;
    aiModelName: string;
    tokenInCount: number;
    tokenOutCount: number;
    costIn: number;
    costOut: number;
    totalCost: number;
}
export declare class AgentCostManager {
    getDetailedAgentCosts(agentId: number): Promise<DetailedAgentCost[]>;
    getAgentCosts(agentId: number): Promise<AgentCost>;
    getSingleAgentCosts(agentId: number): Promise<string>;
}
export {};
//# sourceMappingURL=agentCostsManager.d.ts.map