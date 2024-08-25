import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { ProblemsSmarterCrowdsourcingAgent } from "../../base/scBaseProblemsAgent.js";

export class CreateEntitiesAgent extends ProblemsSmarterCrowdsourcingAgent {
  async renderRefinePrompt(subProblemIndex: number, results: PsAffectedEntity[]) {
    const messages = [
      this.createSystemMessage(
        `
        As an AI expert, you're tasked with refining entities affected by complex problem statements and subproblems. Entities can include individuals, groups, systems, the planet, or even inanimate objects.

        Instructions:

        1. Refine entities and their positive and negative effects in relation to the problem statement and subproblem.
        2. Ensure entity names are concise and consistent.
        3. Limit the description of positive and negative effects to how the subproblem affects the entity, without suggesting solution components. This should be a brief three to four sentence analysis.
        4. Use JSON output only. Avoid markdown formatting.
        5. Elaborate on the reasons behind the negative and positive effects to enhance clarity.
        6. If important and related negative and positive effects are missing from the entities, please add them if needed.
        7. Only add positive effects if the sub problem really has a positive effect on the entity, that rarely happens in this analysis as we are analysis problems.
        8. If no positive effects are identified leave the positiveEffects array empty.
        9. Always output three negativeEffects but only output any positiveEffects if they are relevant
        10. Always output in exactly this format: [ { name: name, negativeEffects: [ reason ], positiveEffects: [ reason ] } ].
        11. Let's think step by step.
        `
      ),
      this.createHumanMessage(
        `
         ${this.renderProblemStatement()}

         ${this.renderSubProblem(subProblemIndex)}

         Previous Entities JSON Output for Review and Refinement:
         ${JSON.stringify(results, null, 2)}

         New Refined Entities JSON Output:
       `
      ),
    ];
    return messages;
  }

  async renderCreatePrompt(subProblemIndex: number) {
    const messages = [
      this.createSystemMessage(
        `
        As an AI expert, your task is to identify entities affected by complex problem statements and subproblems. Entities can range from individuals, groups, systems, to the planet, or even inanimate objects.

        Instructions:

        1. Generate and output up to ${this.maxNumberGeneratedOfEntities} affected entities.
        2. Identify all entities impacted by the main problem and its subproblems.
        3. Highlight all direct negative effects, and any positive effects, without suggesting solution components. Multiple effects may be listed in the array.
        4. Use short, concise, and consistent names for entities.
        5. Avoid combining two entities with 'and'.
        6. Limit positive and negative effects to a brief three to four sentence analysis of how the subproblem affects the entity.
        7. Include Earth's climate and ecology as separate entities, unless irrelevant.
        8. Use JSON output only. Avoid markdown formatting.
        9. Only add positive effects if the sub problem really has a positive effect on the entity, that rarely happens in this analysis.
        9. If no positive effects are identified leave the positiveEffects array empty.
        11. After reviewing the problem statement and subproblem, output in this format: [ { name: name, negativeEffects: [ reason ], positiveEffects: [ reason ] } ].
        12. Let's think step by step.

        Example:

        Problem Statement:
        Increasing obesity rates in a mid-sized urban population

        Sub Problem:
        Poor Nutritional Awareness
        Many people do not understand the nutritional content of the food they consume.

        Entities JSON Output:
        [
            {
                "name": "Mid-sized urban population",
                "negativeEffects": ["Increased health risks due to obesity such as heart disease, diabetes, and cancer.", "Potential decrease in overall productivity due to health conditions.", "Increased healthcare costs due to obesity-related illnesses."],
                "positiveEffects": []
            },
            {
                "name": "Healthcare system",
                "negativeEffects": ["Increased burden due to higher incidence of obesity-related diseases.", "Increased costs for treating obesity and its related diseases."],
                "positiveEffects": []
            },
            {
                "name": "Local food businesses",
                "negativeEffects": ["Potential decrease in business if consumers become more health-conscious.", "Might face criticism or legal actions for contributing to unhealthy eating habits."],
                "positiveEffects": []
            },
            {
                "name": "Earth's ecology",
                "negativeEffects": ["Increased food production to cater to unhealthy diets can lead to overuse of natural resources, contributing to ecological damage."],
                "positiveEffects": []
            },
            {
                "name": "Earth's climate",
                "negativeEffects": ["Increased food production, especially meat and processed foods, contributes to greenhouse gas emissions."],
                "positiveEffects": []
            }
        ]
        `
      ),
      this.createHumanMessage(
        `
         ${this.renderProblemStatement()}

         ${this.renderSubProblem(subProblemIndex)}

         Entities JSON Output:
       `
      ),
    ];

    return messages;
  }


  async createEntities() {
    const subProblemsLimit = Math.min(this.memory.subProblems.length, this.maxSubProblems);

    const subProblemsPromises = Array.from(
      { length: subProblemsLimit },
      async (_, subProblemIndex) => {
        let results = (await this.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Large,
          await this.renderCreatePrompt(subProblemIndex)
        )) as PsAffectedEntity[];

        if (this.createEntitiesRefinedEnabled) {
          results = (await this.callModel(
            PsAiModelType.Text,
            PsAiModelSize.Large,
            await this.renderRefinePrompt(subProblemIndex, results)
          )) as PsAffectedEntity[];
        }

        this.memory.subProblems[subProblemIndex].entities = results;
        await this.saveMemory();
      }
    );

    await Promise.all(subProblemsPromises);
    this.logger.info("Finished creating entities for all subproblems");
  }


  async process() {
    this.logger.info("Create Entities Agent");
    super.process();

    await this.createEntities();
  }
}
