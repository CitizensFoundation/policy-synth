import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { ProblemsSmarterCrowdsourcingAgent } from "../../base/scBaseProblemsAgent.js";

export class ReduceSubProblemsAgent extends ProblemsSmarterCrowdsourcingAgent {
  async renderSelectPrompt(
    problemStatement: string,
    subProblemsToConsider: PsSubProblem[]
  ): Promise<PsModelMessage[]> {
    const messages: PsModelMessage[] = [
      this.createSystemMessage(
        `
        You are an expert in analyzing sub problems.

        You should choose 21 sub problems, from the top, that are
        not duplicates and copy them out in this JSON format [ title, description, whyIsSubProblemImportant, fromSearchType ]

        Only output items that are pure sub problems and filter out any solutions.

        There should be no duplicate or similar sub problems in the output, we want the final 21 chosen ones to represent a wide range of top sub problems.

        Offer no explanations.
        `
      ),
      this.createHumanMessage(
        `
        Problem statement:
        ${problemStatement}

        Sub Problems to review and choose from:
        ${JSON.stringify(subProblemsToConsider, null, 2)}

        JSON Output:
        `
      ),
    ];

    return messages;
  }

  async reduceSubProblems(subProblemsToConsider: PsSubProblem[]) {
    subProblemsToConsider.forEach((sp) => {
      delete (sp as any).solutions;
      delete (sp as any).entities;
      delete (sp as any).searchQueries;
      delete (sp as any).searchResults;
      delete (sp as any).eloRating;
      delete (sp as any).fromUrl;
    });
    const reducedSubProblems = (await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Medium,
      await this.renderSelectPrompt(
        this.problemStatementDescription,
        subProblemsToConsider
      )
    )) as PsSubProblem[];

    // Go through all the reducedSubProblems and add the eloRating at 0
    reducedSubProblems.forEach((sp) => {
      sp.solutions = {
        populations: [],
      };
      sp.entities = [];
      (sp.searchQueries = {
        general: [],
        scientific: [],
        news: [],
        openData: [],
      }),
        (sp.searchResults = {
          pages: {
            general: [],
            scientific: [],
            news: [],
            openData: [],
          },
        });
    });

    this.memory.allSubProblems = this.memory.subProblems;
    this.memory.subProblems = reducedSubProblems;
    await this.saveMemory();
  }

  async process() {
    this.logger.info("Reduce Sub Problems Agent");
    super.process();

    const subProblemsToConsider = this.memory.subProblems.filter(
      (sp) => sp.eloRating && sp.eloRating > 1100
    );
    await this.reduceSubProblems(subProblemsToConsider);

    this.logger.info("Reduce Sub Problems Agent Completed");
  }
}
