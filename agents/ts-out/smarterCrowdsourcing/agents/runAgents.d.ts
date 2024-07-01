import { PsBaseAgentRunner } from "../../base/agentRunner.js";
export declare class SmarterCrowdsourcingAgentRunner extends PsBaseAgentRunner {
    protected agentClasses: PsAgentClassCreationAttributes[];
    protected connectorClasses: PsConnectorClassCreationAttributes[];
    constructor();
    setupAgents(): Promise<void>;
    static runAgentManager(): Promise<void>;
}
//# sourceMappingURL=runAgents.d.ts.map