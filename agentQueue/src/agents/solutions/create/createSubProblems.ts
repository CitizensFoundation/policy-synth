import { BaseProcessor } from "../../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  AIChatMessage,
  BaseChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";

import { IEngineConstants } from "../../../constants.js";

export class CreateSubProblemsProcessor extends BaseProcessor {
  async renderRefinePrompt(results: IEngineSubProblem[]) {
    const messages: BaseChatMessage[] = [
      new SystemChatMessage(
        `
            As an AI expert, your role involves the analysis and refinement of problem statements, along with the creation of sub-problems.

            Instructions:
            1. Refine all the 21 sub-problems and output them all again as an JSON array with refined text.
            2. Output a short title, two or three sentence description and two or three sentence explanation of why the sub-problem is important.
            3. Use your extensive knowledge to enrich the details about the sub-problems but never introduce solutions.
            4. Elaborate on the impact of these sub-problems, if necessary, to provide better context.
            5. Never provide solutions; your focus should be on outlining the problems, we'll find the solutions later.
            6. Do not suggest tasks or actions; your task is to explain the problems.
            8. Do not provide output in markdown format.
            9. Always output in the follwing JSON format: [ { title, description, whyIsSubProblemImportant }  ]
            10. Let's think step by step.`
      ),
      new HumanChatMessage(
        `
           Problem Statement:
           "${this.memory.problemStatement.description}"

           Review and Refine the Following Sub-Problems (in JSON format):
           ${JSON.stringify(results, null, 2)}

           Refined Sub-Problems (in JSON format):
         `
      ),
    ];

    return messages;
  }

  async renderCreatePrompt() {
    //TODO: Human review and improvements of those GPT-4 generated few-shots
    const messages: BaseChatMessage[] = [
      new SystemChatMessage(
        `
            As an AI expert, you are tasked with the analysis of problem statements and generation of sub-problems.

            Instructions:
            1. Break the given problem statement into 21 sub problems and present the sub problems as a JSON array.
            2. Output a short title, two or three sentence description and two or three sentence explanation of why the sub-problem is important.
            3. Never provide solutions; your focus should be on outlining the problems, we'll find the solutions later.
            4. Do not suggest tasks or actions; your task is to explain the problems.
            5. Never output in markdown format.
            6. Always output 21 sub problems.
            7. Always output in the follwing JSON format: [ { title, description, whyIsSubProblemImportant }  ]
            8. Let's think step by step.
            `
      ),
      new HumanChatMessage(
        `
           Problem Statement:
           "${this.memory.problemStatement.description}"

           Sub-Problems (in JSON format):
         `
      ),
    ];

    return messages;
  }

  async createSubProblems() {
    let results = (await this.callLLM(
      "create-sub-problems",
      IEngineConstants.createSubProblemsModel,
      await this.renderCreatePrompt()
    )) as IEngineSubProblem[];

    if (IEngineConstants.enable.refine.createSubProblems) {
      results = await this.callLLM(
        "create-sub-problems",
        IEngineConstants.createSubProblemsModel,
        await this.renderRefinePrompt(results)
      );
    }

    this.memory.subProblems = results;

    await this.saveMemory();

    this.logger.info("Sub Problems Created")
  }

  async process() {
    this.logger.info("Sub Problems Processor");
    super.process();
    this.chat = new ChatOpenAI({
      temperature: IEngineConstants.createSubProblemsModel.temperature,
      maxTokens: IEngineConstants.createSubProblemsModel.maxOutputTokens,
      modelName: IEngineConstants.createSubProblemsModel.name,
      verbose: IEngineConstants.createSubProblemsModel.verbose,
    });

    await this.createSubProblems();
  }
}
