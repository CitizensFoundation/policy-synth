import { PsBaseAgentRunner } from "@policysynth/agents/base/agentRunner.js";
export declare class JobDescriptionAgentRunner extends PsBaseAgentRunner {
    protected agentClasses: PsAgentClassCreationAttributes[];
    protected connectorClasses: PsAgentConnectorClassAttributes[];
    constructor();
    setupAgents(): Promise<void>;
    static runAgentManager(): Promise<void>;
}
//# sourceMappingURL=runAgents.d.ts.map