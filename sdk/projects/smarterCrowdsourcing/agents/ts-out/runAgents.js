import { RootCausesAgentQueue } from "./problems/rootCausesAgent.js";
import { SolutionsWebResearchAgentQueue } from "./solutions/solutionsWebResearch.js";
import { SolutionsEvolutionAgentQueue } from "./solutions/solutionsEvolution.js";
import { PoliciesAgentQueue } from "./policies/policies.js";
import { fileURLToPath } from "url";
import { PsBaseAgentRunner } from "@policysynth/agents/base/agentRunner.js";
import { ProblemsAgentQueue } from "./problems/problemsAgent.js";
import { RootCausesSmarterCrowdsourcingAgent } from "./base/scBaseRootCausesAgent.js";
import { PoliciesSmarterCrowdsourcingAgent } from "./base/scBasePoliciesAgent.js";
import { ProblemsSmarterCrowdsourcingAgent } from "./base/scBaseProblemsAgent.js";
import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "./base/scBaseSolutionsEvolutionAgent.js";
import { SolutionsWebResearchSmarterCrowdsourcingAgent } from "./base/scBaseSolutionsWebResearchAgent.js";
import { PsGoogleDocsConnector } from "@policysynth/agents/connectors/documents/googleDocsConnector.js";
import { PsYourPrioritiesConnector } from "@policysynth/agents/connectors/collaboration/yourPrioritiesConnector.js";
export class SmarterCrowdsourcingAgentRunner extends PsBaseAgentRunner {
    agentClasses;
    connectorClasses;
    constructor() {
        super();
        this.agentsToRun = [
            new ProblemsAgentQueue(),
            new RootCausesAgentQueue(),
            new SolutionsWebResearchAgentQueue(),
            new SolutionsEvolutionAgentQueue(),
            new PoliciesAgentQueue(),
        ];
        this.agentClasses = [
            RootCausesSmarterCrowdsourcingAgent.getAgentClass(),
            ProblemsSmarterCrowdsourcingAgent.getAgentClass(),
            SolutionsWebResearchSmarterCrowdsourcingAgent.getAgentClass(),
            SolutionsEvolutionSmarterCrowdsourcingAgent.getAgentClass(),
            PoliciesSmarterCrowdsourcingAgent.getAgentClass(),
        ];
        this.connectorClasses = [
            PsGoogleDocsConnector.getConnectorClass,
            PsYourPrioritiesConnector.getConnectorClass,
        ];
    }
    async setupAgents() {
        // Any additional setup specific to SmarterCrowdsourcing can be done here
        // The base class will handle creating agent and connector classes
        this.logger.info("Setting up Smarter Crowdsourcing agents");
    }
    static async runAgentManager() {
        const agentRunner = new SmarterCrowdsourcingAgentRunner();
        await agentRunner.run();
    }
}
const __filename = fileURLToPath(import.meta.url);
if (import.meta.url === `file://${__filename}`) {
    SmarterCrowdsourcingAgentRunner.runAgentManager().catch((error) => {
        console.error("Error running Smarter Crowdsourcing Agent Manager:", error);
        process.exit(1);
    });
}
//# sourceMappingURL=runAgents.js.map