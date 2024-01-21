import { BaseProcessor } from "../../baseProcessor.js";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanMessage, SystemMessage } from "langchain/schema";
import { IEngineConstants } from "../../../constants.js";
export class ReduceSubProblemsProcessor extends BaseProcessor {
    async renderSelectPrompt(problemStatement, subProblemsToConsider) {
        const messages = [
            new SystemMessage(`
        You are an expert in analyzing sub problems.

        You should choose 21 sub problems, from the top, that are
        not duplicates and copy them out in this JSON format [ title, description, whyIsSubProblemImportant, fromSearchType ]

        Only output items that are pure sub problems and filter out any solutions.

        There should be no duplicate or similar sub problems in the output, we want the final 21 chosen ones to represent a wide range of top sub problems.

        Offer no explanations.
        `),
            new HumanMessage(`
        Problem statement:
        ${problemStatement}

        Sub Problems to review and choose from:
        ${JSON.stringify(subProblemsToConsider, null, 2)}

        JSON Output:
        `),
        ];
        return messages;
    }
    async reduceSubProblems(subProblemsToConsider) {
        subProblemsToConsider.forEach((sp) => {
            delete sp.solutions;
            delete sp.entities;
            delete sp.searchQueries;
            delete sp.searchResults;
            delete sp.eloRating;
            delete sp.fromUrl;
        });
        const reducedSubProblems = (await this.callLLM("reduce-sub-problems", IEngineConstants.reduceSubProblemsModel, await this.renderSelectPrompt(this.memory.problemStatement.description, subProblemsToConsider)));
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
        this.logger.info("Reduce Sub Problems Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: IEngineConstants.reduceSubProblemsModel.temperature,
            maxTokens: IEngineConstants.reduceSubProblemsModel.maxOutputTokens,
            modelName: IEngineConstants.reduceSubProblemsModel.name,
            verbose: IEngineConstants.reduceSubProblemsModel.verbose,
        });
        const subProblemsToConsider = this.memory.subProblems.filter((sp) => sp.eloRating && sp.eloRating > 1100);
        await this.reduceSubProblems(subProblemsToConsider);
        this.logger.info("Reduce Sub Problems Processor Completed");
    }
}
//# sourceMappingURL=reduceSubProblems.js.map