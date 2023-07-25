import { BaseProcessor } from "../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, SystemChatMessage, } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
export class CreateSubProblemsProcessor extends BaseProcessor {
    async renderRefinePrompt(results) {
        const messages = [
            new SystemChatMessage(`
            As an AI expert, your role involves the analysis and refinement of problem statements, along with the creation of sub-problems.

            Please keep these guidelines in mind:
            1. Refine all the 21 sub-problems and output them all again as an JSON array with refined text.
            2. Output a short title, two or three sentence description and two or three sentence explanation of why the sub-problem is important.
            3. Use your extensive knowledge to enrich the details about the sub-problems but never introduce solutions.
            4. Elaborate on the impact of these sub-problems, if necessary, to provide better context.
            5. Never provide solutions; your focus should be on outlining the problems, we'll find the solutions later.
            6. Avoid suggesting tasks or actions; your task is to explain the problems.
            7. Do not provide output in markdown format.
            8. Always output in the follwing JSON format: [ { title, description, whyIsSubProblemImportant }  ]
            9. Adopt a systematic and detailed approach for this task and thinking step-by-step manner.`),
            new HumanChatMessage(`
           Problem Statement:
           "${this.memory.problemStatement.description}"

           Review and Refine the Following Sub-Problems (in JSON format):
           ${JSON.stringify(results, null, 2)}

           Refined Sub-Problems (in JSON format):
         `),
        ];
        return messages;
    }
    async renderCreatePrompt() {
        //TODO: Human review and improvements of those GPT-4 generated few-shots
        const messages = [
            new SystemChatMessage(`
            As an AI expert, you are tasked with the analysis of problem statements and generation of sub-problems. Please adhere to the following guidelines:

            1. Break the given problem statement into 21 sub problems and present the sub problems as a JSON array.
            2. Output a short title, two or three sentence description and two or three sentence explanation of why the sub-problem is important.
            3. Never provide solutions; your focus should be on outlining the problems, we'll find the solutions later.
            4. Output a short title, two or three sentence description and two or three sentence explanation of why the sub-problem is important.
            5. Avoid suggesting tasks or actions; your task is to explain the problems.
            6. Never output in markdown format.
            7. Always output 21 sub problems.
            8. Always output in the follwing JSON format: [ { title, description, whyIsSubProblemImportant }  ]
            9. Approach this task in a systematic and detailed manner, thinking step-by-step.
            `),
            new HumanChatMessage(`
           Problem Statement:
           "${this.memory.problemStatement.description}"

           Sub-Problems (in JSON format):
         `),
        ];
        return messages;
    }
    async createSubProblems() {
        let results = (await this.callLLM("create-sub-problems", IEngineConstants.createSubProblemsModel, await this.renderCreatePrompt()));
        if (IEngineConstants.enable.refine.createSubProblems) {
            results = await this.callLLM("create-sub-problems", IEngineConstants.createSubProblemsModel, await this.renderRefinePrompt(results));
        }
        this.memory.subProblems = results;
        await this.saveMemory();
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
