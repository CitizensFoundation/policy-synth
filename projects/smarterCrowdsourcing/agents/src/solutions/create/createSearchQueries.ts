import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { SolutionsWebResearchSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsWebResearchAgent.js";

export class CreateSearchQueriesAgent extends SolutionsWebResearchSmarterCrowdsourcingAgent {
  //TODO: Maybe add a review and refine stage here as well

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
      ${this.generationLanguage ? `12. Use ${this.generationLanguage} language to create the search queries, we are searching for solutions in that language to our sub problems.
      13. Do not include any Icelandic or the words Menntasjóður námsmanna as this will pull in the wrong content in the searches.` : ""}
    `;
  }

  async renderProblemPrompt(problem: string) {
    return [
      this.createSystemMessage(
        `
        You are an expert trained to analyse complex problem statements and create search queries to find solution components to those problems.

        Adhere to the following guidelines:
        1. You generate high quality search queries based on the problem statement.
        2. Always focus your search queries on the problem statement.
        ${this.renderCommonPromptSection()}    `
      ),
      this.createHumanMessage(
        `
         Problem Statement:
         ${problem}

         JSON Output:
       `
      ),
    ];
  }

  async renderEntityPrompt(problem: string, entity: PsAffectedEntity) {
    return [
      this.createSystemMessage(
        `
        You are an expert trained to analyse complex problem statements for affected entities and create search queries to find solution components for the affected entity.

        Instructions:
        1. You generate high quality search queries based on the affected entity.
        2. Always focus your search queries on the Affected Entity not the problem statement.
        ${this.renderCommonPromptSection()}       `
      ),
      this.createHumanMessage(
        `
         Problem Statement:
         ${problem}

         Affected Entity:
         ${entity.name}
         ${this.renderEntityPosNegReasons(entity)}

         JSON Output:
       `
      ),
    ];
  }

  async process() {
    this.logger.info("Create Search Queries Agent");
    super.process();

    this.memory.problemStatement.searchQueries = await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Medium,
      await this.renderProblemPrompt(this.problemStatementDescription)
    );

    const subProblemsLimit = Math.min(
      this.memory.subProblems.length,
      this.maxSubProblems
    );

    const subProblemsPromises = Array.from(
      { length: subProblemsLimit },
      async (_, subProblemIndex) => {
        const problemText = `
          ${this.memory.subProblems[subProblemIndex].title}

          ${this.memory.subProblems[subProblemIndex].description}

          ${this.memory.subProblems[subProblemIndex].whyIsSubProblemImportant}
        `;

        this.memory.subProblems[subProblemIndex].searchQueries =
          await this.callModel(
            PsAiModelType.Text,
            PsAiModelSize.Medium,
            await this.renderProblemPrompt(problemText)
          );
        await this.saveMemory();

        console.log(JSON.stringify(this.memory.subProblems[subProblemIndex].searchQueries, null, 2));

        for (
          let e = 0;
          e <
          Math.min(
            this.memory.subProblems[subProblemIndex].entities.length,
            this.maxTopEntitiesToSearch
          );
          e++
        ) {
          this.memory.subProblems[subProblemIndex].entities[e].searchQueries =
            await this.callModel(
              PsAiModelType.Text,
              PsAiModelSize.Medium,
              await this.renderEntityPrompt(
                problemText,
                this.memory.subProblems[subProblemIndex].entities[e]
              )
            );
          await this.saveMemory();
          console.log(JSON.stringify(this.memory.subProblems[subProblemIndex].entities[e].searchQueries, null, 2));
        }
      }
    );

    await Promise.all(subProblemsPromises);
    this.logger.info("Finished creating search queries for all subproblems");
  }
}
