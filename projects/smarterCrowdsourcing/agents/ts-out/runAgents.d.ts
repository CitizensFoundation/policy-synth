import { PsBaseAgentRunner } from "@policysynth/agents/base/agentRunner.js";
export declare class SmarterCrowdsourcingAgentRunner extends PsBaseAgentRunner {
    protected agentClasses: PsAgentClassCreationAttributes[];
    protected connectorClasses: PsAgentConnectorClassCreationAttributes[];
    constructor();
    setupAgents(): Promise<void>;
    static runAgentManager(): Promise<void>;
}
//# sourceMappingURL=runAgents.d.ts.map