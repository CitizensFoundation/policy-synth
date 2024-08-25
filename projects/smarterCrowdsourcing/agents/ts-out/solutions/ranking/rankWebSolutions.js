import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../base/scPairwiseAgent.js";
export class RankWebSolutionsAgent extends BaseSmarterCrowdsourcingPairwiseAgent {
    async voteOnPromptPair(subProblemIndex, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const solutionOne = this.allItems[subProblemIndex][itemOneIndex];
        const solutionTwo = this.allItems[subProblemIndex][itemTwoIndex];
        const messages = [
            this.createSystemMessage(`You're an expert in evaluating and ranking solutions to problems.

         Instructions:
         1. Analyze a problem and two solutions, labeled "Solution One" and "Solution Two"
         2. Determine which is more important and practical.
         ${this.customInstructionsRankSolutions
                ? `
           Important Instructions:\n${this.customInstructionsRankSolutions}
           `
                : ""}

         Always output your decision as "One", "Two" or "Neither". No explanation is necessary.

        `),
            this.createHumanMessage(`
        ${subProblemIndex == -1
                ? this.renderProblemStatement()
                : this.renderSubProblem(subProblemIndex, true)}

        Solutions to assess:

        Solution One:
        ${solutionOne.title}
        ${solutionOne.description}

        Solution Two:
        ${solutionTwo.title}
        ${solutionTwo.description}

        The more important and practial solution component is:
        `),
        ];
        return await this.getResultsFromLLM(subProblemIndex, messages, itemOneIndex, itemTwoIndex);
    }
    async rankSubProblemEntities(subProblemIndex) {
        const subProblem = this.memory.subProblems[subProblemIndex];
        if (!subProblem || !subProblem.entities || subProblem.entities.length === 0) {
            this.logger.info(`No entities to rank for sub problem ${subProblemIndex}`);
            return;
        }
        this.logger.info(`Ranking solutions for entities in sub problem ${subProblemIndex}`);
        for (let entityIndex = 0; entityIndex < subProblem.entities.length; entityIndex++) {
            const entity = subProblem.entities[entityIndex];
            if (!entity.solutionsFromSearch || entity.solutionsFromSearch.length === 0) {
                this.logger.info(`No solutions to rank for entity ${entityIndex} in sub problem ${subProblemIndex}`);
                continue;
            }
            if (entity.solutionsFromSearch[0].eloRating) {
                this.logger.info(`Solutions for entity ${entityIndex} in sub problem ${subProblemIndex} already ranked, skipping`);
                continue;
            }
            this.logger.info(`Ranking solutions for entity ${entityIndex} in sub problem ${subProblemIndex}`);
            this.setupRankingPrompts(subProblemIndex, entity.solutionsFromSearch, entity.solutionsFromSearch.length * 10);
            await this.performPairwiseRanking(subProblemIndex);
            entity.solutionsFromSearch = this.getOrderedListOfItems(subProblemIndex, true);
            this.logger.info(`Finished ranking solutions for entity ${entityIndex} in sub problem ${subProblemIndex}`);
        }
        this.logger.info(`Completed ranking solutions for all entities in sub problem ${subProblemIndex}`);
    }
    async processSubProblem(subProblemIndex) {
        this.logger.info(`Ranking web solution for sub problem ${subProblemIndex} population`);
        if (!this.memory.subProblems[subProblemIndex].solutionsFromSearch[0]
            .eloRating) {
            this.setupRankingPrompts(subProblemIndex, this.memory.subProblems[subProblemIndex].solutionsFromSearch, this.memory.subProblems[subProblemIndex].solutionsFromSearch.length *
                10);
            await this.performPairwiseRanking(subProblemIndex);
            this.memory.subProblems[subProblemIndex].solutionsFromSearch =
                this.getOrderedListOfItems(subProblemIndex, true);
            if (this.memory.subProblems[subProblemIndex].entities[0] &&
                this.memory.subProblems[subProblemIndex].entities[0].solutionsFromSearch[0] &&
                !this.memory.subProblems[subProblemIndex].entities[0].solutionsFromSearch[0].eloRating) {
                await this.rankSubProblemEntities(subProblemIndex);
            }
            else {
                this.logger.info(`Sub problem entities ${subProblemIndex} already ranked, skipping`);
            }
        }
        else {
            this.logger.info(`Sub problem ${subProblemIndex} already ranked, skipping`);
        }
        await this.saveMemory();
    }
    async process() {
        this.logger.info("Rank Web Solutions Agent");
        super.process();
        try {
            if (!this.memory.problemStatement.solutionsFromSearch[0].eloRating) {
                this.setupRankingPrompts(-1, this.memory.problemStatement.solutionsFromSearch, this.memory.problemStatement.solutionsFromSearch.length * 10);
                await this.performPairwiseRanking(-1);
                this.memory.problemStatement.solutionsFromSearch =
                    this.getOrderedListOfItems(-1, true);
            }
            else {
                this.logger.info("Problem statement already ranked");
            }
            const subProblemsPromises = Array.from({
                length: Math.min(this.memory.subProblems.length, this.maxSubProblems),
            }, async (_, subProblemIndex) => this.processSubProblem(subProblemIndex));
            await Promise.all(subProblemsPromises);
            await this.saveMemory();
            this.logger.info("Rank Web Solutions Agent Completed");
        }
        catch (error) {
            this.logger.error("Error in Rank Web Solutions Agent");
            this.logger.error(error);
            throw error;
        }
    }
}
//# sourceMappingURL=rankWebSolutions.js.map