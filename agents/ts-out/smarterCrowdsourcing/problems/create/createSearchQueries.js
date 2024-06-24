import { BaseProblemSolvingAgent } from "../../../base/baseProblemSolvingAgent.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PsConstants } from "../../../constants.js";
export class CreateSearchQueriesProcessor extends BaseProblemSolvingAgent {
    //TODO: Maybe add a review and refine stage here as well
    //TODO: Put in memory
    useLanguage = "Norwegian";
    renderCommonPromptSection() {
        return `
      3. Use your knowledge and experience to create the best possible search queries.
      4. Search queries should be concise, consistent, short, and succinct. They will be used to search on Google or Bing.
      5. You create four types of search queries:
      5.1 General
      5.2. Scientific
      5.3. OpenData
      5.4. News
      6. Create 15 search queries for each type.
      7. All search queries should be solution focused, let's find the solution components for those entities.
      8. Never output in markdown format.
      9. Provide an output in the following JSON format:
        { general: [ queries ], scientific: [ queries ], openData: [ queries ], news: [ queries ] }.
      10. Ensure a methodical, step-by-step approach to create the best possible search queries.
      11. Never offer explanations, just output JSON.
      ${this.useLanguage ? `12. Use ${this.useLanguage} language to create the search queries, we are searching for solutions in that language to our sub problems.
      13. Do not include any Icelandic or the words Menntasjóður námsmanna as this will pull in the wrong content in the searches.` : ""}
    `;
    }
    async renderProblemPrompt(problem) {
        return [
            new SystemMessage(`
        You are an expert trained to analyse complex problem statements and create search queries to find solution components to those problems.

        Adhere to the following guidelines:
        1. You generate high quality search queries based on the problem statement.
        2. Always focus your search queries on the problem statement.
        ${this.renderCommonPromptSection()}    `),
            new HumanMessage(`
         Problem Statement:
         ${problem}

         JSON Output:
       `),
        ];
    }
    async renderEntityPrompt(problem, entity) {
        return [
            new SystemMessage(`
        You are an expert trained to analyse complex problem statements for affected entities and create search queries to find solution components for the affected entity.

        Instructions:
        1. You generate high quality search queries based on the affected entity.
        2. Always focus your search queries on the Affected Entity not the problem statement.
        ${this.renderCommonPromptSection()}       `),
            new HumanMessage(`
         Problem Statement:
         ${problem}

         Affected Entity:
         ${entity.name}
         ${this.renderEntityPosNegReasons(entity)}

         JSON Output:
       `),
        ];
    }
    async process() {
        this.logger.info("Create Search Queries Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: PsConstants.createSearchQueriesModel.temperature,
            maxTokens: PsConstants.createSearchQueriesModel.maxOutputTokens,
            modelName: PsConstants.createSearchQueriesModel.name,
            verbose: false,
        });
        this.memory.problemStatement.searchQueries = await this.callLLM("create-search-queries", PsConstants.createSearchQueriesModel, await this.renderProblemPrompt(this.memory.problemStatement.description));
        const subProblemsLimit = Math.min(this.memory.subProblems.length, PsConstants.maxSubProblems);
        const subProblemsPromises = Array.from({ length: subProblemsLimit }, async (_, subProblemIndex) => {
            const problemText = `
          ${this.memory.subProblems[subProblemIndex].title}

          ${this.memory.subProblems[subProblemIndex].description}

          ${this.memory.subProblems[subProblemIndex].whyIsSubProblemImportant}
        `;
            this.memory.subProblems[subProblemIndex].searchQueries =
                await this.callLLM("create-search-queries", PsConstants.createSearchQueriesModel, await this.renderProblemPrompt(problemText));
            await this.saveMemory();
            console.log(JSON.stringify(this.memory.subProblems[subProblemIndex].searchQueries, null, 2));
            for (let e = 0; e <
                Math.min(this.memory.subProblems[subProblemIndex].entities.length, PsConstants.maxTopEntitiesToSearch); e++) {
                this.memory.subProblems[subProblemIndex].entities[e].searchQueries =
                    await this.callLLM("create-search-queries", PsConstants.createSearchQueriesModel, await this.renderEntityPrompt(problemText, this.memory.subProblems[subProblemIndex].entities[e]));
                await this.saveMemory();
                console.log(JSON.stringify(this.memory.subProblems[subProblemIndex].entities[e].searchQueries, null, 2));
            }
        });
        await Promise.all(subProblemsPromises);
        this.logger.info("Finished creating search queries for all subproblems");
    }
}
//# sourceMappingURL=createSearchQueries.js.map