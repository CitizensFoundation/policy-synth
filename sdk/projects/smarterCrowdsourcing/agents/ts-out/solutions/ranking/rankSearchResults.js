import { BaseSmarterCrowdsourcingPairwiseAgent } from "../../base/scPairwiseAgent.js";
export class RankSearchResultsAgent extends BaseSmarterCrowdsourcingPairwiseAgent {
    subProblemIndex = 0;
    entitiesIndex = 0;
    currentEntity;
    searchResultType;
    searchResultTarget;
    renderProblemDetail() {
        let detail = ``;
        if (this.searchResultTarget === "problemStatement") {
            detail = `
        ${this.renderProblemStatement()}
      `;
        }
        else if (this.searchResultTarget === "subProblem") {
            detail = `
        ${this.renderSubProblem(this.subProblemIndex)}
      `;
        }
        else if (this.searchResultTarget === "entity") {
            detail = `
        ${this.renderSubProblem(this.subProblemIndex)}

        Entity:
        ${this.currentEntity.name}
        ${this.renderEntityPosNegReasons(this.currentEntity)}
      `;
        }
        return detail;
    }
    async voteOnPromptPair(subProblemIndex, promptPair) {
        const itemOneIndex = promptPair[0];
        const itemTwoIndex = promptPair[1];
        const itemOne = this.allItems[subProblemIndex][itemOneIndex];
        const itemTwo = this.allItems[subProblemIndex][itemTwoIndex];
        let itemOneTitle = itemOne.title;
        let itemOneDescription = itemOne.description;
        let itemTwoTitle = itemTwo.title;
        let itemTwoDescription = itemTwo.description;
        const messages = [
            this.createSystemMessage(`You are an expert in assessing relevance of search results.

         Instructions:
         Assess search results "One" and "Two" for problem relevance while searching for solutions to the problem.
         Output your decision as either "One", "Two" or "Neither". No explanation is required.
         Let's think step by step.`),
            this.createHumanMessage(`${this.renderProblemDetail()}

         Search Type: ${this.searchResultType}

         Search Results to assess:

         One:
         ${itemOneTitle}
         ${itemOneDescription}
         ${itemOne.url}

         Two:
         ${itemTwoTitle}
         ${itemTwoDescription}
         ${itemTwo.url}

         The most relevant search result is: `),
        ];
        return await this.getResultsFromLLM(subProblemIndex, messages, itemOneIndex, itemTwoIndex);
    }
    async processSubProblems(searchResultType) {
        for (let s = 0; s <
            Math.min(this.memory.subProblems.length, this.maxSubProblems); s++) {
            this.logger.info(`Ranking Sub Problem ${s} for ${searchResultType} search results`);
            let resultsToRank = this.memory.subProblems[s].searchResults.pages[searchResultType];
            this.subProblemIndex = s;
            this.searchResultTarget = "subProblem";
            this.setupRankingPrompts(s, resultsToRank, resultsToRank.length * 10);
            await this.performPairwiseRanking(s);
            this.memory.subProblems[s].searchResults.pages[searchResultType] =
                this.getOrderedListOfItems(s, true);
            await this.saveMemory();
            this.searchResultTarget = "entity";
            await this.processEntities(s, searchResultType);
        }
    }
    async processEntities(subProblemIndex, searchResultType) {
        for (let e = 0; e <
            Math.min(this.memory.subProblems[subProblemIndex].entities.length, this.maxTopEntitiesToSearch); e++) {
            this.logger.info(`Ranking Entity ${subProblemIndex}-${e} for ${searchResultType} search results`);
            this.currentEntity = this.memory.subProblems[subProblemIndex].entities[e];
            let resultsToRank = this.memory.subProblems[subProblemIndex].entities[e].searchResults.pages[searchResultType];
            this.setupRankingPrompts(subProblemIndex * e, resultsToRank, resultsToRank.length * 7);
            await this.performPairwiseRanking(subProblemIndex * e);
            this.memory.subProblems[subProblemIndex].entities[e].searchResults.pages[searchResultType] =
                this.getOrderedListOfItems(subProblemIndex * e, true);
        }
    }
    async process() {
        this.logger.info("Rank Search Results Agent");
        super.process();
        for (const searchResultType of [
            "general",
            "scientific",
            "openData",
            "news",
        ]) {
            this.searchResultType = searchResultType;
            let resultsToRank = this.memory.problemStatement.searchResults.pages[searchResultType];
            this.searchResultTarget = "problemStatement";
            this.logger.info(`Ranking Main Problem statement for ${searchResultType} search results`);
            this.setupRankingPrompts(-1, resultsToRank, resultsToRank.length * 10);
            await this.performPairwiseRanking(-1);
            this.memory.problemStatement.searchResults.pages[searchResultType] = this.getOrderedListOfItems(-1, true);
            await this.processSubProblems(searchResultType);
        }
        await this.saveMemory();
    }
}
//# sourceMappingURL=rankSearchResults.js.map