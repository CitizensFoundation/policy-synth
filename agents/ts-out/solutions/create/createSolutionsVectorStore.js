import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PsConstants } from "../../constants.js";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";
const DISABLE_LLM_FOR_DEBUG = false;
export class CreateSolutionsVectorStoreProcessor extends BaseProblemSolvingAgent {
    webPageVectorStore = new WebPageVectorStore();
    useLanguage = "English";
    async renderRefinePrompt(results, generalTextContext, scientificTextContext, openDataTextContext, newsTextContext, subProblemIndex, alreadyCreatedSolutions = undefined) {
        const messages = [
            new SystemMessage(`As an expert, your task is to refine innovative solution components proposed for problems and associated sub-problems.

        Instructions:
        1. Review and refine the solution components previously generated, do not create new solution components.
        2. Solution Components should be simple, actionable, innovative and equitable. Do not make them more complex though.
        3. Limit solution component descriptions to a maximum of six sentences.
        4. The title and description should be accessible and free of technical jargon.
        5. Do not replicate solution components listed under 'Already Created Solution Components'.
        6. Refer to the relevant entities in your solution components, if mentioned.
        7. Ensure your output is not in markdown format.
        8. Only output JSON and offer no explanations.
        ${this.useLanguage ? `9. Always output in ${this.useLanguage}` : ""}
        ${this.memory.customInstructions.createSolutions
                ? `
          Important Instructions: ${this.memory.customInstructions.createSolutions}

        `
                : ""}

        Always output your solution components in the following JSON format: [ { title, description, mainBenefitOfSolutionComponent, mainObstacleToSolutionComponentAdoption } ].
        Let's think step by step.
        `),
            new HumanMessage(`
        ${this.renderProblemStatementSubProblemsAndEntities(subProblemIndex)}

        ${alreadyCreatedSolutions
                ? `
          Already Created Solution Components:
          ${alreadyCreatedSolutions}
        `
                : ``}

        Previous Solution Components JSON Output to Review and Refine:
        ${JSON.stringify(results, null, 2)}

        Refined Solution Components JSON Output:
       `),
        ];
        return messages;
    }
    renderCreateSystemMessage() {
        return new SystemMessage(`As an expert, you are tasked with creating innovative solution components for sub problems, considering the affected entities.

      Instructions:
      1. Generate four simple solution components inspired by the General, Scientific, Open Data and News Contexts
      2. Solution components should be specific, not just improving this or enhancing that.
      3. Solution components should be actionable, innovative and equitable.
      4. Each solution component should include a short title, description, mainBenefitOfSolutionComponent and mainObstacleToSolutionComponentAdoption.
      5. Limit the description of each solution component to six sentences maximum and the description should be accessible and free of technical jargon.
      6. Never re-create solution components listed under 'Already Created Solution Components'.
      7. The General, Scientific, Open Data and News Contexts should always inform and inspire your solution components.
      8. Do not refer to the Contexts in your solution components, as the contexts won't be visible to the user.
      ${this.useLanguage ? `9. Always output in ${this.useLanguage}` : ""}
      ${this.memory.customInstructions.createSolutions
            ? `
        Important Instructions (override the previous instructions if needed):${this.memory.customInstructions.createSolutions}

    `
            : ""}

      Always output your solution components in the following JSON format: [ { title, description, mainBenefitOfSolutionComponent, mainObstacleToSolutionComponentAdoption } ].
      Let's think step by step.
      `);
    }
    renderCreateForTestTokens(subProblemIndex, alreadyCreatedSolutions = undefined) {
        const messages = [
            this.renderCreateSystemMessage(),
            new HumanMessage(`
            ${this.renderProblemStatementSubProblemsAndEntities(subProblemIndex)}

            General Context:

            Scientific Context:

            Open Data Context:

            News Context:

            ${alreadyCreatedSolutions
                ? `
              Already created solution components:
              ${alreadyCreatedSolutions}
            `
                : ``}

            Solution Components JSON Output:
           `),
        ];
        return messages;
    }
    async renderCreatePrompt(generalTextContext, scientificTextContext, openDataTextContext, newsTextContext, subProblemIndex, alreadyCreatedSolutions = undefined) {
        this.logger.debug(`General Context: ${generalTextContext}`);
        this.logger.debug(`Scientific Context: ${scientificTextContext}`);
        this.logger.debug(`Open Data Context: ${openDataTextContext}`);
        this.logger.debug(`News Context: ${newsTextContext}`);
        const messages = [
            this.renderCreateSystemMessage(),
            new HumanMessage(`
        ${this.renderProblemStatementSubProblemsAndEntities(subProblemIndex)}

        Contexts for new solution components:
        General Context:
        ${generalTextContext}

        Scientific Context:
        ${scientificTextContext}

        Open Data Context:
        ${openDataTextContext}

        News Context:
        ${newsTextContext}

        ${alreadyCreatedSolutions
                ? `
          Previously Created Solution Components:
          ${alreadyCreatedSolutions}
        `
                : ``}

        Output in JSON Format:
       `),
        ];
        return messages;
    }
    async createSolutions(subProblemIndex, generalTextContext, scientificTextContext, openDataTextContext, newsTextContext, alreadyCreatedSolutions = undefined, stageName = "create-seed-solutions") {
        if (DISABLE_LLM_FOR_DEBUG) {
            this.logger.info("DISABLE_LLM_FOR_DEBUG is true, skipping LLM call");
            await this.renderCreatePrompt(generalTextContext, scientificTextContext, openDataTextContext, newsTextContext, subProblemIndex, alreadyCreatedSolutions);
            return [];
        }
        else {
            this.logger.info(`Calling LLM for sub problem ${subProblemIndex}`);
            let results = await this.callLLM(stageName, PsConstants.createSolutionsModel, await this.renderCreatePrompt(generalTextContext, scientificTextContext, openDataTextContext, newsTextContext, subProblemIndex, alreadyCreatedSolutions), true, false, 860);
            if (PsConstants.enable.refine.createSolutions) {
                this.logger.info(`Calling LLM refine for sub problem ${subProblemIndex}`);
                results = await this.callLLM(stageName, PsConstants.createSolutionsModel, await this.renderRefinePrompt(results, generalTextContext, scientificTextContext, openDataTextContext, newsTextContext, subProblemIndex, alreadyCreatedSolutions), true, false, 860);
            }
            return results;
        }
    }
    randomSearchQueryIndex(searchQueries, type) {
        const randomIndex = Math.min(Math.floor(Math.random() *
            (PsConstants.maxTopSearchQueriesForSolutionCreation + 1)), searchQueries[type].length - 1);
        if (Math.random() <
            PsConstants.chances.createSolutions.notUsingTopSearchQueries) {
            this.logger.debug(`Using random search query index ${randomIndex}`);
            return randomIndex;
        }
        else {
            const randomTop = Math.min(Math.floor(Math.random() * (PsConstants.maxTopQueriesToSearchPerType + 1)), searchQueries[type].length - 1);
            this.logger.debug(`Using top search query index ${randomIndex}`);
            return randomTop;
        }
    }
    getAllTypeQueries(searchQueries, subProblemIndex) {
        this.logger.info(`Getting all type queries for sub problem ${subProblemIndex}`);
        const general = searchQueries.general
            ? searchQueries.general[this.randomSearchQueryIndex(searchQueries, "general")]
            : "";
        if (!general) {
            this.logger.error(`No general search queries for sub problem ${subProblemIndex} ${JSON.stringify(searchQueries, null, 2)}`);
        }
        return {
            general: general,
            scientific: searchQueries.scientific[this.randomSearchQueryIndex(searchQueries, "scientific")],
            openData: searchQueries.openData[this.randomSearchQueryIndex(searchQueries, "openData")],
            news: searchQueries.news[this.randomSearchQueryIndex(searchQueries, "news")],
        };
    }
    getRandomSearchQueryForType(type, problemStatementQueries, subProblemQueries, otherSubProblemQueries, randomEntitySearchQueries) {
        let random = Math.random();
        let selectedQuery;
        const mainProblemChance = PsConstants.chances.createSolutions.searchQueries
            .useMainProblemSearchQueries;
        const otherSubProblemChance = mainProblemChance +
            PsConstants.chances.createSolutions.searchQueries
                .useOtherSubProblemSearchQueries;
        const subProblemChance = otherSubProblemChance +
            PsConstants.chances.createSolutions.searchQueries
                .useSubProblemSearchQueries;
        // The remaining probability is assigned to randomEntitySearchQueries
        if (random < mainProblemChance) {
            selectedQuery = problemStatementQueries[type];
            this.logger.debug(`Using main problem search query for type ${type}`);
        }
        else if (random < otherSubProblemChance) {
            selectedQuery = otherSubProblemQueries[type];
            this.logger.debug(`Using other sub problem search query for type ${type}`);
        }
        else if (random < subProblemChance) {
            selectedQuery = subProblemQueries[type];
            this.logger.debug(`Using sub problem search query for type ${type}`);
        }
        else {
            selectedQuery = randomEntitySearchQueries[type];
            this.logger.debug(`Using random entity search query for type ${type}`);
        }
        return selectedQuery;
    }
    getSearchQueries(subProblemIndex) {
        const otherSubProblemIndexes = [];
        this.logger.info(`Getting search queries for sub problem ${subProblemIndex}`);
        for (let i = 0; i <
            Math.min(this.memory.subProblems.length, PsConstants.maxSubProblems); i++) {
            if (i != subProblemIndex) {
                otherSubProblemIndexes.push(i);
            }
        }
        this.logger.debug(`otherSubProblemIndexes: ${otherSubProblemIndexes}`);
        const randomSubProblemIndex = otherSubProblemIndexes[Math.floor(Math.random() * otherSubProblemIndexes.length)];
        const problemStatementQueries = this.getAllTypeQueries(this.memory.problemStatement.searchQueries, undefined);
        const subProblemQueries = this.getAllTypeQueries(this.memory.subProblems[subProblemIndex].searchQueries, subProblemIndex);
        const entities = this.memory.subProblems[subProblemIndex].entities;
        //this.logger.debug(`Entities: ${JSON.stringify(entities, null, 2)}`);
        const chosenEntities = entities.slice(0, this.memory.groupId === 1 ? 3 : PsConstants.maxTopEntitiesToSearch);
        const randomEntity = chosenEntities[Math.floor(Math.random() * chosenEntities.length)];
        this.logger.debug(`Random Entity: ${JSON.stringify(randomEntity.searchQueries, null, 2)}`);
        const randomEntitySearchQueries = this.getAllTypeQueries(randomEntity.searchQueries, subProblemIndex);
        const otherSubProblemQueries = this.getAllTypeQueries(this.memory.subProblems[randomSubProblemIndex].searchQueries, randomSubProblemIndex);
        //TODO: Refactor the types to be an array ["scientific", "general", ...]
        let scientific = this.getRandomSearchQueryForType("scientific", problemStatementQueries, subProblemQueries, otherSubProblemQueries, randomEntitySearchQueries);
        let general = this.getRandomSearchQueryForType("general", problemStatementQueries, subProblemQueries, otherSubProblemQueries, randomEntitySearchQueries);
        let openData = this.getRandomSearchQueryForType("openData", problemStatementQueries, subProblemQueries, otherSubProblemQueries, randomEntitySearchQueries);
        let news = this.getRandomSearchQueryForType("news", problemStatementQueries, subProblemQueries, otherSubProblemQueries, randomEntitySearchQueries);
        return {
            scientific,
            general,
            openData,
            news,
        };
    }
    async getTextContext(subProblemIndex, alreadyCreatedSolutions = undefined) {
        this.logger.info(`Getting text context for sub problem ${subProblemIndex}`);
        const selectedSearchQueries = this.getSearchQueries(subProblemIndex);
        return {
            general: await this.getSearchQueryTextContext(subProblemIndex, selectedSearchQueries["general"], "general", alreadyCreatedSolutions),
            scientific: await this.getSearchQueryTextContext(subProblemIndex, selectedSearchQueries["scientific"], "scientific", alreadyCreatedSolutions),
            openData: await this.getSearchQueryTextContext(subProblemIndex, selectedSearchQueries["openData"], "openData", alreadyCreatedSolutions),
            news: await this.getSearchQueryTextContext(subProblemIndex, selectedSearchQueries["news"], "news", alreadyCreatedSolutions),
        };
    }
    getWeightedRandomSolution(array) {
        if (!array || array.length === 0) {
            return "";
        }
        const randomValue = Math.random(); // Value between 0 and 1
        if (randomValue < PsConstants.chances.createSolutions.webSolutions.top) {
            return array[0];
        }
        else if (randomValue <
            PsConstants.chances.createSolutions.webSolutions.top +
                PsConstants.chances.createSolutions.webSolutions.topThree) {
            return this.getRandomItemFromArray(array.slice(0, 3));
        }
        else if (randomValue <
            PsConstants.chances.createSolutions.webSolutions.top +
                PsConstants.chances.createSolutions.webSolutions.topThree +
                PsConstants.chances.createSolutions.webSolutions.topSeven) {
            return this.getRandomItemFromArray(array.slice(0, 7));
        }
        else {
            return this.getRandomItemFromArray(array);
        }
    }
    async countTokensForString(text) {
        const tokenCountData = await this.chat.getNumTokensFromMessages([
            new HumanMessage(text),
        ]);
        return tokenCountData.totalCount;
    }
    getRandomItemFromArray(array, useTopN = undefined) {
        if (array && array.length > 0) {
            const randomIndex = Math.floor(Math.random() *
                (useTopN ? Math.min(useTopN, array.length) : array.length));
            return array[randomIndex];
        }
        else {
            return "";
        }
    }
    //TODO: Figure out the closest mostRelevantParagraphs from Weaviate
    renderRawSearchResults(rawSearchResults) {
        const results = this.getRandomItemFromArray(rawSearchResults.data.Get.WebPage, PsConstants.limits.useRandomTopFromVectorSearchResults);
        const solutionIdentifiedInTextContext = this.getWeightedRandomSolution(results.solutionsIdentifiedInTextContext);
        const mostRelevantParagraphs = this.getRandomItemFromArray(results.mostRelevantParagraphs);
        this.logger.debug(`Random Solution: ${solutionIdentifiedInTextContext}`);
        this.logger.debug(`Summary: ${results.summary}`);
        this.logger.debug(`Random Most Relevant Paragraph: ${mostRelevantParagraphs}`);
        let searchResults = `
        ${solutionIdentifiedInTextContext
            ? `Potential solution component: ${solutionIdentifiedInTextContext}

        `
            : ""}${results.summary}

        ${mostRelevantParagraphs}
    `;
        return { searchResults, selectedUrl: results.url };
    }
    async searchForType(subProblemIndex, type, searchQuery, tokensLeftForType) {
        this.logger.info(`Searching for type ${type} with query ${searchQuery}`);
        let rawSearchResults;
        const random = Math.random();
        if (random <
            PsConstants.chances.createSolutions.vectorSearchAcrossAllProblems) {
            this.logger.debug("Using vector search across all problems");
            rawSearchResults = await this.webPageVectorStore.searchWebPages(searchQuery, this.memory.groupId, undefined, type);
        }
        else {
            this.logger.debug("Using sub problem vector search");
            rawSearchResults = await this.webPageVectorStore.searchWebPages(searchQuery, this.memory.groupId, subProblemIndex, type);
        }
        this.logger.debug("got raw search results");
        let searchResultsData = this.renderRawSearchResults(rawSearchResults);
        let searchResults = searchResultsData.searchResults;
        //this.logger.debug(`Before token count: ${searchResults}`)
        while ((await this.countTokensForString(searchResults)) > tokensLeftForType) {
            this.logger.debug(`Tokens left for type ${type}: ${tokensLeftForType}`);
            let sentences = searchResults.split(". ");
            sentences.pop();
            searchResults = sentences.join(". ");
        }
        //this.logger.debug(`After token count: ${searchResults}`)
        return { searchResults, selectedUrl: searchResultsData.selectedUrl };
    }
    async getSearchQueryTextContext(subProblemIndex, searchQuery, type, alreadyCreatedSolutions = undefined) {
        //TODO: What about the system prompt?
        const tokenCountData = await this.chat.getNumTokensFromMessages(this.renderCreateForTestTokens(subProblemIndex, alreadyCreatedSolutions));
        const currentTokens = tokenCountData.totalCount;
        const tokensLeft = PsConstants.createSolutionsModel.tokenLimit -
            (currentTokens + PsConstants.createSolutionsModel.maxOutputTokens);
        const tokensLeftForType = Math.floor(tokensLeft / PsConstants.numberOfSearchTypes);
        this.logger.debug(`Tokens left ${tokensLeftForType} for type ${type}`);
        return await this.searchForType(subProblemIndex, type, searchQuery, tokensLeftForType);
    }
    async createAllSeedSolutions() {
        for (let subProblemIndex = 0; subProblemIndex <
            Math.min(this.memory.subProblems.length, PsConstants.maxSubProblems); subProblemIndex++) {
            this.currentSubProblemIndex = subProblemIndex;
            this.logger.info(`Creating solutions for sub problem ${subProblemIndex}`);
            let solutions = [];
            // Create 60 solutions 4*15
            const solutionBatchCount = 15;
            for (let i = 0; i < solutionBatchCount; i++) {
                this.logger.info(`Creating solutions batch ${i + 1}/${solutionBatchCount}`);
                let alreadyCreatedSolutions;
                if (i > 0) {
                    alreadyCreatedSolutions = solutions
                        .map((solution) => solution.title)
                        .join("\n");
                }
                const textContexts = await this.getTextContext(subProblemIndex, alreadyCreatedSolutions);
                const newSolutions = await this.createSolutions(subProblemIndex, textContexts.general.searchResults, textContexts.scientific.searchResults, textContexts.openData.searchResults, textContexts.news.searchResults, alreadyCreatedSolutions);
                this.logger.debug(`New Solution Components: ${JSON.stringify(newSolutions, null, 2)}`);
                solutions = solutions.concat(newSolutions);
                const seedUrls = [
                    textContexts.general.selectedUrl,
                    textContexts.scientific.selectedUrl,
                    textContexts.openData.selectedUrl,
                    textContexts.news.selectedUrl,
                ];
                for (let solution of solutions) {
                    solution.family = {
                        seedUrls,
                        gen: 0,
                    };
                }
            }
            this.logger.debug("Created all solutions batches");
            if (!this.memory.subProblems[subProblemIndex].solutions) {
                this.memory.subProblems[subProblemIndex].solutions = {
                    populations: [],
                };
            }
            this.memory.subProblems[subProblemIndex].solutions.populations.push(solutions);
            await this.saveMemory();
            this.logger.debug(`Saved memory for sub problem ${subProblemIndex}`);
        }
    }
    async process() {
        this.logger.info("Create Seed Solution Components Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: PsConstants.createSolutionsModel.temperature,
            maxTokens: PsConstants.createSolutionsModel.maxOutputTokens,
            modelName: PsConstants.createSolutionsModel.name,
            verbose: PsConstants.createSolutionsModel.verbose,
        });
        try {
            await this.createAllSeedSolutions();
        }
        catch (error) {
            this.logger.error("Error creating solutions");
            this.logger.error(error);
            this.logger.error(error.stack);
            throw error;
        }
    }
}
//# sourceMappingURL=createSolutionsVectorStore.js.map