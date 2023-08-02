import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
import { BasePairwiseRankingsProcessor } from "./basePairwiseRanking.js";
export class RankSolutionsProcessor extends BasePairwiseRankingsProcessor {
    async voteOnPromptPair(subProblemIndex, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const solutionOne = this.allItems[subProblemIndex][itemOneIndex];
        const solutionTwo = this.allItems[subProblemIndex][itemTwoIndex];
        const messages = [
            new SystemChatMessage(`You are an expert in comparing and assessing solution components to problems.

         Instructions:
         1. You will be presented with a problem and two corresponding solution components. These will be labelled "Solution Component One" and "Solution Component Two".
         2. Assess which of the two solution component is more important and practical in relation to the problem.
         3. Consider the provided ratings for each solution component also.
         ${this.memory.customInstructions.rankSolutions
                ? `
           Important Instructions: ${this.memory.customInstructions.rankSolutions}
           `
                : ""}

         Always output your decision as "One", "Two" or "Neither. No explanation is necessary.
         Think step by step.
        `),
            new HumanChatMessage(`
        ${this.renderSubProblem(subProblemIndex, true)}

        Solution Components to assess:

        Solution Component One:
        ${solutionOne.title}
        ${solutionOne.description}

        ${solutionOne.ratings
                ? `
        Solution Component One Ratings:
        ${JSON.stringify(solutionOne.ratings, null, 2)}
        `
                : ""}

        Solution Component Two:
        ${solutionTwo.title}
        ${solutionTwo.description}

        ${solutionTwo.ratings
                ? `
        Solution Component Two Ratings:
        ${JSON.stringify(solutionTwo.ratings, null, 2)}
        `
                : ""}

        The more important and practial solution component is:
        `),
        ];
        return await this.getResultsFromLLM(subProblemIndex, "rank-solutions", IEngineConstants.solutionsRankingsModel, messages, itemOneIndex, itemTwoIndex);
    }
    async processSubProblem(subProblemIndex) {
        const lastPopulationIndex = this.lastPopulationIndex(subProblemIndex);
        this.logger.info(`Ranking solution components for sub problem ${subProblemIndex} population ${lastPopulationIndex}`);
        this.setupRankingPrompts(subProblemIndex, this.getActiveSolutionsLastPopulation(subProblemIndex), IEngineConstants.minimumNumberOfPairwiseVotesForPopulation *
            this.getActiveSolutionsLastPopulation(subProblemIndex).length);
        await this.performPairwiseRanking(subProblemIndex);
        this.memory.subProblems[subProblemIndex].solutions.populations[lastPopulationIndex] = this.getOrderedListOfItems(subProblemIndex, true);
        await this.saveMemory();
    }
    async process() {
        this.logger.info("Rank Solution Components Processor");
        super.process();
        try {
            this.chat = new ChatOpenAI({
                temperature: IEngineConstants.solutionsRankingsModel.temperature,
                maxTokens: IEngineConstants.solutionsRankingsModel.maxOutputTokens,
                modelName: IEngineConstants.solutionsRankingsModel.name,
                verbose: IEngineConstants.solutionsRankingsModel.verbose,
            });
            const subProblemsPromises = Array.from({
                length: Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems),
            }, async (_, subProblemIndex) => this.processSubProblem(subProblemIndex));
            await Promise.all(subProblemsPromises);
            this.logger.info("Rank Solution Components Processor Completed");
        }
        catch (error) {
            this.logger.error("Error in Rank Solution Components Processor");
            this.logger.error(error);
            throw error;
        }
    }
}
