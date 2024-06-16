import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PsConstants } from "../../constants.js";
import { BasePairwiseRankingsProcessor } from "../../basePairwiseRanking.js";
export class RankWebSolutionsProcessor extends BasePairwiseRankingsProcessor {
    async voteOnPromptPair(subProblemIndex, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const solutionOne = this.allItems[subProblemIndex][itemOneIndex];
        const solutionTwo = this.allItems[subProblemIndex][itemTwoIndex];
        const messages = [
            new SystemMessage(`You're an expert in evaluating and ranking solutions to problems.

         Instructions:
         1. Analyze a problem and two solutions, labeled "Solution One" and "Solution Two"
         2. Determine which is more important and practical.
         ${this.memory.customInstructions.rankSolutions
                ? `
           Important Instructions:\n${this.memory.customInstructions.rankSolutions}
           `
                : ""}

         Always output your decision as "One", "Two" or "Neither". No explanation is necessary.

        `),
            new HumanMessage(`
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
        return await this.getResultsFromLLM(subProblemIndex, "rank-solutions", PsConstants.solutionsRankingsModel, messages, itemOneIndex, itemTwoIndex);
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
        }
        await this.saveMemory();
    }
    async process() {
        this.logger.info("Rank Web Solutions Processor");
        super.process();
        try {
            this.chat = new ChatOpenAI({
                temperature: PsConstants.solutionsRankingsModel.temperature,
                maxTokens: PsConstants.solutionsRankingsModel.maxOutputTokens,
                modelName: PsConstants.solutionsRankingsModel.name,
                verbose: PsConstants.solutionsRankingsModel.verbose,
            });
            if (!this.memory.problemStatement.solutionsFromSearch[0].eloRating) {
                this.setupRankingPrompts(-1, this.memory.problemStatement.solutionsFromSearch, this.memory.problemStatement.solutionsFromSearch.length * 10);
                await this.performPairwiseRanking(-1);
                this.memory.problemStatement.solutionsFromSearch =
                    this.getOrderedListOfItems(-1, true);
            }
            const subProblemsPromises = Array.from({
                length: Math.min(this.memory.subProblems.length, PsConstants.maxSubProblems),
            }, async (_, subProblemIndex) => this.processSubProblem(subProblemIndex));
            await Promise.all(subProblemsPromises);
            await this.saveMemory();
            this.logger.info("Rank Web Solutions Processor Completed");
        }
        catch (error) {
            this.logger.error("Error in Rank Web Solutions Processor");
            this.logger.error(error);
            throw error;
        }
    }
}
//# sourceMappingURL=rankWebSolutions.js.map