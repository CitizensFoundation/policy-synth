import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";

import { IEngineConstants } from "../../../constants.js";

export class CreateEntitiesProcessor extends BaseProcessor {
  async renderRefinePrompt(results: IEngineAffectedEntity[]) {
    const messages = [
      new SystemChatMessage(
        `
        As an AI expert, you're tasked with refining entities affected by complex problem statements and subproblems. Entities can include individuals, groups, systems, the planet, or even inanimate objects.

        Please follow these guidelines:

        1. Refine entities and their positive and negative effects in relation to the problem statement and subproblem.
        2. Ensure entity names are concise and consistent.
        3. Limit the description of positive and negative effects to how the subproblem affects the entity, without suggesting solutions. This should be a brief three to four sentence analysis.
        4. Use JSON output only. Avoid markdown formatting.
        5. Elaborate on the reasons behind the negative and positive effects to enhance clarity.
        6. If important and related negative and positive effects are missing from the entities, please add them if needed.
        7. Only add positive effects if the sub problem really has a positive effect on the entity, that rarely happens in this analysis as we are analysis problems.
        8. If no positive effects are identified leave the positiveEffects array empty.
        9. Always output in exactly this format: [ { name: name, negativeEffects: [ reason ], positiveEffects: [ reason ] } ].
        10. Maintain a methodical, step-by-step approach.
        `
      ),
      new HumanChatMessage(
        `
         ${this.renderProblemStatement()}

         ${this.renderSubProblem(this.currentSubProblemIndex!)}

         Previous Entities JSON Output for Review and Refinement:
         ${JSON.stringify(results, null, 2)}

         New Refined Entities JSON Output:
       `
      ),
    ];
    return messages;
  }

  async renderCreatePrompt() {
    const messages = [
      new SystemChatMessage(
        `
        As an AI expert, your task is to identify entities affected by complex problem statements and subproblems. Entities can range from individuals, groups, systems, to the planet, or even inanimate objects.

        Please adhere to the following guidelines:

        1. Generate and output up to ${IEngineConstants.maxNumberGeneratedOfEntities} affected entities.
        2. Identify all entities impacted by the main problem and its subproblems.
        3. Highlight all direct negative effects, and any positive effects, without suggesting solutions. Multiple effects may be listed in the array.
        4. Use short, concise, and consistent names for entities.
        5. Avoid combining two entities with 'and'.
        6. Limit positive and negative effects to a brief three to four sentence analysis of how the subproblem affects the entity, excluding solution suggestions.
        7. Include Earth's climate and ecology as separate entities, unless irrelevant.
        8. Use JSON output only. Avoid markdown formatting.
        9. Only add positive effects if the sub problem really has a positive effect on the entity, that rarely happens in this analysis.
        9. If no positive effects are identified leave the positiveEffects array empty.
        11. After reviewing the problem statement and subproblem, output in this format: [ { name: name, negativeEffects: [ reason ], positiveEffects: [ reason ] } ].
        12. Follow a methodical, step-by-step approach to identify all affected entities.

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
      new HumanChatMessage(
        `
         ${this.renderProblemStatement()}

         ${this.renderSubProblem(this.currentSubProblemIndex!)}

         Entities JSON Output:
       `
      ),
    ];

    return messages;
  }


  async createEntities() {
    //TODO: Human review and improvements of this partly GPT-4 generated prompt

    this.currentSubProblemIndex = 0;

    for (
      let s = 0;
      s <
      Math.min(this.memory.subProblems.length, IEngineConstants.maxSubProblems);
      s++
    ) {
      this.currentSubProblemIndex = s;

      let results = (await this.callLLM(
        "create-entities",
        IEngineConstants.createEntitiesModel,
        await this.renderCreatePrompt()
      )) as IEngineAffectedEntity[];

      if (IEngineConstants.enable.refine.createEntities) {
        results = (await this.callLLM(
          "create-entities",
          IEngineConstants.createEntitiesModel,
          await this.renderRefinePrompt(results)
        )) as IEngineAffectedEntity[];
      }

      this.memory.subProblems[s].entities = results;

      await this.saveMemory();
    }
  }

  async process() {
    this.logger.info("Create Entities Processor");
    super.process();

    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.createEntitiesModel.temperature,
      maxTokens: IEngineConstants.createEntitiesModel.maxOutputTokens,
      modelName: IEngineConstants.createEntitiesModel.name,
      verbose: IEngineConstants.createEntitiesModel.verbose,
    });

    await this.createEntities();
  }
}
