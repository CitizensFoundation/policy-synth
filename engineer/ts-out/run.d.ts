import { PsBaseAgentRunner } from "@policysynth/agents/base/agentRunner.js";
export declare class EngineerAgentRunner extends PsBaseAgentRunner {
    protected agentClasses: PsAgentClassCreationAttributes[];
    protected connectorClasses: PsAgentConnectorClassCreationAttributes[];
    constructor();
    setupAgents(): Promise<void>;
    static runAgentManager(): Promise<void>;
}
//# sourceMappingURL=run.d.ts.map