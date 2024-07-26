import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { BaseSmarterCrowdsourcingAgent } from "../../base/scBaseAgent.js";
export class CreateEvidenceSearchQueriesAgent extends BaseSmarterCrowdsourcingAgent {
    static evidenceWebPageTypesArray = [
        "positiveEvidence",
        "negativeEvidence",
        "neutralEvidence",
        "economicEvidence",
        "scientificEvidence",
        "culturalEvidence",
        "environmentalEvidence",
        "legalEvidence",
        "technologicalEvidence",
        "geopoliticalEvidence",
        "caseStudies",
        "stakeholderOpinions",
        "expertOpinions",
        "publicOpinions",
        "historicalContext",
        "ethicalConsiderations",
        "longTermImpact",
        "shortTermImpact",
        "localPerspective",
        "globalPerspective",
        "costAnalysis",
        "implementationFeasibility",
    ];
    filterPolicyParameters(policy) {
        const { imageUrl, imagePrompt, solutionIndex, ...filteredPolicy } = policy;
        return filteredPolicy;
    }
    async renderCreatePrompt(subProblemIndex, policy, searchResultType) {
        return [
            this.createSystemMessage(`Adhere to the following guidelines:
        1. You generate high quality search queries based on a Problem statement and Policy Proposal.
        2. Always focus your search queries on the policy proposal and it's core ideas.
        3. Use your knowledge and experience to create the best possible search queries.
        4. Search queries should be concise, consistent, short, and succinct. They will be used to search on Google or Bing.
        5. You will be provided with a Search query type, use this to guide your creation
        6. Create 10 high quality search queries
        7. All search queries should be evidence focused, let's find evidence for the policy proposal.
        8. Never output in markdown format.
        9. Provide an output in the following JSON string array: [ searchQuery ]
        10. Never explain, just output JSON.

        Let's think step by step.

        `),
            this.createHumanMessage(`
         ${this.renderSubProblem(subProblemIndex, true)}

         Policy Proposal:
         ${JSON.stringify(this.filterPolicyParameters(policy), null, 2)}

         Search Query Type: ${searchResultType}

         Your high quality search queries in JSON string array:
       `),
        ];
    }
    async renderRefinePrompt(subProblemIndex, policy, searchResultType, searchResultsToRefine) {
        return [
            this.createSystemMessage(`
        Adhere to the following guidelines:
        1. You are an expert in refining search queries based on a Problem statement and Policy Proposal.
        2. Always focus your search queries on the policy proposal and it's core ideas.
        3. Use your knowledge and experience to refine the best possible search queries.
        4. Search queries should be concise, consistent, short, and succinct. They will be used to search on Google or Bing.
        5. You will be provided with a Search query type, use this to guide your refinement
        7. All search queries should be evidence focused, let's find evidence for the policy proposal.
        8. Never output in markdown format.
        9. Provide an output in the following JSON string array: [ searchQuery ]

        Let's think step by step.

        `),
            this.createHumanMessage(`
        ${this.renderSubProblem(subProblemIndex, true)}

         Policy Proposal:
         ${JSON.stringify(this.filterPolicyParameters(policy), null, 2)}

         Search Query Type: ${searchResultType}

         Search queries to refine:
         ${JSON.stringify(searchResultsToRefine, null, 2)}

         Your refined search queries in JSON string array:
       `),
        ];
    }
    async renderRankPrompt(subProblemIndex, policy, searchResultType, searchResultsToRank) {
        return [
            this.createSystemMessage(`
        Adhere to the following guidelines:
        1. You are an expert in ranking the most important search queries based on a Problem statement and Policy Proposal.
        2. Use your knowledge and experience to rank the search queries.
        3. Search queries should be concise, consistent, short, and succinct. They will be used to search on Google or Bing.
        4. You will be provided with a Search query type, use this to guide your refinement
        5. All search queries should be evidence focused, let's find evidence for the policy proposal.
        6. Never output in markdown format.
        7. Provide an output in the following JSON string array: [ searchQuery ]

        Let's think step by step.
        `),
            this.createHumanMessage(`
        ${this.renderSubProblem(subProblemIndex, true)}

         Policy Proposal:
         ${JSON.stringify(this.filterPolicyParameters(policy), null, 2)}

         Search Query Type: ${searchResultType}

         Search queries to rank:
         ${JSON.stringify(searchResultsToRank, null, 2)}

         Your ranked search queries in JSON string array:
       `),
        ];
    }
    lastPopulationIndex(subProblemIndex) {
        return (this.memory.subProblems[subProblemIndex].policies.populations.length - 1);
    }
    async createEvidenceSearchQueries(policy, subProblemIndex, policyIndex) {
        if (!policy.evidenceSearchQueries) {
            //@ts-ignore
            policy.evidenceSearchQueries = {};
        }
        for (const searchResultType of CreateEvidenceSearchQueriesAgent.evidenceWebPageTypesArray) {
            if (!policy.evidenceSearchQueries[searchResultType]) {
                this.logger.info(`Creating evidence search queries for ${subProblemIndex}/${policyIndex}: ${searchResultType} search results`);
                // create search queries for each type
                let searchResults = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, await this.renderCreatePrompt(subProblemIndex, policy, searchResultType)));
                this.logger.info(`Refine evidence search queries for ${subProblemIndex}/${policyIndex}: ${searchResultType} search results`);
                searchResults = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, await this.renderRefinePrompt(subProblemIndex, policy, searchResultType, searchResults)));
                this.logger.info(`Ranking evidence search queries for ${subProblemIndex}/${policyIndex}: ${searchResultType} search results`);
                searchResults = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, await this.renderRankPrompt(subProblemIndex, policy, searchResultType, searchResults)));
                this.logger.debug(`Search query type: ${searchResultType} ${JSON.stringify(searchResults, null, 2)}`);
                policy.evidenceSearchQueries[searchResultType] = searchResults;
            }
            else {
                this.logger.info(`Evidence search queries for ${subProblemIndex}/${policyIndex}: ${searchResultType} search results already exist`);
            }
        }
    }
    async process() {
        this.logger.info("Create Evidence Search Queries Agent");
        super.process();
        const subProblemsLimit = Math.min(this.memory.subProblems.length, this.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const subProblem = this.memory.subProblems[subProblemIndex];
            const policies = subProblem.policies?.populations[subProblem.policies.populations.length - 1];
            if (policies) {
                for (let policyIndex = 0; policyIndex < policies.length; policyIndex++) {
                    this.logger.info(`Creating evidence search queries for policy ${policyIndex}/${policies.length} of sub problem ${subProblemIndex} (${this.lastPopulationIndex(subProblemIndex)})`);
                    const policy = policies[policyIndex];
                    await this.createEvidenceSearchQueries(policy, subProblemIndex, policyIndex);
                    await this.saveMemory();
                }
            }
            else {
                this.logger.debug(`Sub problem ${subProblemIndex} already has ${subProblem.policies?.populations.length} populations`);
            }
            await this.saveMemory();
        });
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished creating policies evidence search queries for all subproblems");
    }
}
//# sourceMappingURL=createEvidenceSearchQueries.js.map