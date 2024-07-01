import { PolicySynthOperationsAgent } from "./operationsAgent.js";
import { PsAgentRegistry } from "../dbModels/agentRegistry.js";
import { PolicySynthAgentQueue } from "./operationsAgentQueue.js";
export declare abstract class PsBaseAgentRunner extends PolicySynthOperationsAgent {
    protected agentsToRun: PolicySynthAgentQueue[];
    protected agentRegistry: PsAgentRegistry | null;
    protected abstract agentClasses: PsAgentClassCreationAttributes[];
    protected abstract connectorClasses: PsConnectorClassCreationAttributes[];
    constructor();
    abstract setupAgents(): Promise<void>;
    setupAndRunAgents(): Promise<void>;
    inspectDynamicMethods(obj: any, className: string): void;
    private registerAgent;
    private getOrCreateAgentRegistry;
    private startRenewalProcess;
    private renewRegistration;
    protected createAgentClassesIfNeeded(): Promise<void>;
    protected createConnectorClassesIfNeeded(): Promise<void>;
    run(): Promise<void>;
    setupGracefulShutdown(): void;
}
//# sourceMappingURL=agentRunner.d.ts.map