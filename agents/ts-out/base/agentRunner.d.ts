import { PolicySynthAgent } from "./agent.js";
import { PsAgentRegistry } from "../dbModels/agentRegistry.js";
import { PsAgentClass } from "../dbModels/agentClass.js";
import { PsAgentConnectorClass } from "../dbModels/agentConnectorClass.js";
import { PolicySynthAgentQueue } from "./agentQueue.js";
export declare abstract class PsBaseAgentRunner extends PolicySynthAgent {
    protected agentsToRun: PolicySynthAgentQueue[];
    protected agentRegistry: PsAgentRegistry | null;
    protected registeredAgentClasses: PsAgentClass[];
    protected registeredConnectorClasses: PsAgentConnectorClass[];
    protected abstract agentClasses: PsAgentClassCreationAttributes[];
    protected abstract connectorClasses: PsAgentConnectorClassCreationAttributes[];
    constructor();
    abstract setupAgents(): Promise<void>;
    setupAndRunAgents(): Promise<void>;
    inspectDynamicMethods(obj: any, className: string): void;
    registerAgent(agentQueue: PolicySynthAgentQueue): Promise<void>;
    registerConnectors(): Promise<void>;
    getOrCreateAgentRegistry(): Promise<PsAgentRegistry>;
    protected createAgentClassesIfNeeded(): Promise<void>;
    protected createConnectorClassesIfNeeded(): Promise<void>;
    run(): Promise<void>;
    setupGracefulShutdown(): void;
}
//# sourceMappingURL=agentRunner.d.ts.map