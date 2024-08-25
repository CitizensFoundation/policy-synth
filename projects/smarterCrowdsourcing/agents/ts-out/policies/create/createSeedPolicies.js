import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { BaseSmarterCrowdsourcingAgent } from "../../base/scBaseAgent.js";
export class CreateSeedPoliciesAgent extends BaseSmarterCrowdsourcingAgent {
    renderCurrentSolution(solution) {
        return `
      Solution Component:

      Title: ${solution.title}

      Description: ${solution.description}

      Main benefit: ${solution.mainBenefitOfSolution}

      Main obstacle: ${solution.mainObstacleToSolutionAdoption}

      Best pros:
      ${this.getProCons(solution.pros).slice(0, this.maxTopProsConsUsedForRating)}

      Best cons:
      ${this.getProCons(solution.cons).slice(0, this.maxTopProsConsUsedForRating)}
    `;
    }
    async renderCreatePrompt(subProblemIndex, solution) {
        const messages = [
            this.createSystemMessage(`
        You are an expert in creating concrete policy proposal from a solution.

        General instructions:
        1. Use the provided solution and problem statement to create 7 variations of how this solution can be turned into a full policy proposal.
        2. Use exactly the core ideas from the provided solution but try out different framing for each of the 7.
        3. The titles should stand alone, be professional and not include "Policy proposal", "Policy action", etc.
        4. The audience for those policy proposal are policymakers so please output in a language they are the most comfortable with.
        5. Never output less than 7 policy proposal variations

        Policy Framing Instructions:
        1. Your are writing policy proposal that a democracy nonprofit will bring to the US government.

        Always output your policy ideas in the following JSON format: [ { title, description, conditionsForSuccess[], mainObstaclesForImplemention[], mainRisks[], policyKPIMetrics[] } ].

        Let's think step by step.
        `),
            this.createHumanMessage(`
         ${this.renderSubProblem(subProblemIndex, true)}

         ${this.renderCurrentSolution(solution)}

         Your innovative policy proposals as a JSON array:
       `),
        ];
        return messages;
    }
    async renderRefinePrompt(subProblemIndex, solution, policyProposalsToRefine) {
        const messages = [
            this.createSystemMessage(`
        You are an expert in refining concrete policy proposals for  solution components.

        General instructions:
        1. Refine the current draft of policy proposals.
        2. Be detailed but also concise but do not change the core ideas.
        3. The titles should stand alone, be professional and not include "Policy proposal", "Policy action", etc.
        4. The audience for those policy proposal are policymakers so please output in a language they are the most comfortable with.

        Policy Framing Instructions:
        1.  Your are writing policy proposal that a democracy nonprofit will bring to the US government.

        Always output your policy ideas in the following JSON format: [ { title, description, conditionsForSuccess[], mainObstaclesForImplemention[], mainRisks[], policyKPIMetrics[] } ].

        Let's think step by step.
        `),
            this.createHumanMessage(`
         ${this.renderSubProblem(subProblemIndex, true)}

         ${this.renderCurrentSolution(solution)}

         Policy proposals to refine:
          ${JSON.stringify(policyProposalsToRefine, null, 2)}

         Refined policy proposals in JSON format.
       `),
        ];
        return messages;
    }
    async renderChoosePrompt(subProblemIndex, solution, policyProposalsToChooseFrom) {
        const messages = [
            this.createSystemMessage(`
        You are an expert in choose the best concrete policy proposals for solution components.

        General instructions:
        1. Choose the the best policy proposal for the solution and output in JSON format.
        2. No explanation is needed just output the JSON object.

        Policy Framing Instructions:
        1.  Your are writing policy proposal that a democracy nonprofit will bring to the US government.

        Always output your policy ideas in the following JSON format: { title, description, whyTheBestChoice, conditionsForSuccess[], mainObstaclesForImplemention[], mainRisks[], policyKPIMetrics[] }.

        `),
            this.createHumanMessage(`
         ${this.renderSubProblem(subProblemIndex, true)}

         ${this.renderCurrentSolution(solution)}

         Policy proposals to choose one best from:
          ${JSON.stringify(policyProposalsToChooseFrom, null, 2)}

          Your choice for the best policy proposal for the solution component and problem.
          Let's think step by step and output in JSON:
       `),
        ];
        return messages;
    }
    async createSeedPolicyForSolution(populationIndex, subProblemIndex, solution, solutionIndex) {
        try {
            let policyOptions = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, await this.renderCreatePrompt(subProblemIndex, solution), true, false, 1500));
            const refinePolicy = false;
            if (refinePolicy) {
                policyOptions = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, await this.renderRefinePrompt(subProblemIndex, solution, policyOptions), true, false, 1500));
            }
            const choosenPolicy = (await this.callModel(PsAiModelType.Text, PsAiModelSize.Medium, await this.renderChoosePrompt(subProblemIndex, solution, policyOptions), true, false, 1500));
            choosenPolicy.solutionIndex = `${populationIndex}:${solutionIndex}`;
            return choosenPolicy;
        }
        catch (error) {
            this.logger.error(error);
            this.logger.error(error.stack);
            throw error;
        }
    }
    async createSeedPolicies() {
        const subProblemsLimit = Math.min(this.memory.subProblems.length, this.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const subProblem = this.memory.subProblems[subProblemIndex];
            const solutions = this.getActiveSolutionsLastPopulation(subProblemIndex);
            this.logger.debug(`Sub Problem ${subProblemIndex} Solution Components length: ${solutions.length}`);
            if (!subProblem.policies) {
                subProblem.policies = {
                    populations: [],
                };
            }
            if (!subProblem.policies.populations ||
                subProblem.policies.populations.length === 0) {
                subProblem.policies.populations = [];
                let newPopulation = [];
                for (let solutionIndex = 0; solutionIndex < this.maxTopSolutionsToCreatePolicies; solutionIndex++) {
                    this.logger.info(`Creating policy for solution ${solutionIndex}/${solutions.length} of sub problem ${subProblemIndex} lastPopulationIndex ${this.lastPopulationIndex(subProblemIndex)}`);
                    const solution = solutions[solutionIndex];
                    const seedPolicy = await this.createSeedPolicyForSolution(this.lastPopulationIndex(subProblemIndex), subProblemIndex, solution, solutionIndex);
                    this.logger.debug(`Adding ${seedPolicy.title} to new population for sub problem ${subProblemIndex}}`);
                    newPopulation.push(seedPolicy);
                    await this.saveMemory();
                }
                this.logger.debug(`New size of ${subProblemIndex} population: ${subProblem.policies.populations.length}`);
                subProblem.policies.populations.push(newPopulation);
            }
            else {
                this.logger.debug(`Sub problem ${subProblemIndex} already has ${subProblem.policies.populations.length} populations`);
            }
        });
        // Wait for all subproblems to finish
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished creating seed policies for all");
    }
    async process() {
        this.logger.info("Create Seed Policies Agent");
        super.process();
        try {
            await this.createSeedPolicies();
        }
        catch (error) {
            this.logger.error(error);
            this.logger.error(error.stack);
            throw error;
        }
    }
}
//# sourceMappingURL=createSeedPolicies.js.map