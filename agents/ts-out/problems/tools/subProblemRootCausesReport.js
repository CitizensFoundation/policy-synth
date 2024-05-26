import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import { BaseProblemSolvingAgent } from "../../baseProblemSolvingAgent.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { IEngineConstants } from "../../constants.js";
export class PsSubProblemsReportGenerator extends BaseProblemSolvingAgent {
    constructor(memoryData) {
        super(undefined, memoryData);
    }
    async renderPairwiseChoicesPrompt(items, previousSummary) {
        const messages = [
            new SystemMessage(`You are an expert in creating a list of choices to vote in on a pairwise ranking project.

        Instructions:
        1. You will receive an array of root causes in JSON format to create a list of choices.
        2. You are to output a detailed summary in Markdown format.
        3. Never lose any important detail from the previous summary.
        4. Markdown output format:
          # Policy Synth Root Causes Report

          ## Problem Statement
          <Problem Statement>

          ## Likely Root Causes Summaries
          <List of All Likely Root Causes in concise format>

          ## Additional Novel/Unexpected Root Causes For Further Investigation
          <List of additional Novel/Unexpected Root Causes in concise format>

          ## Conclusion summary on the root causes

          ## Recommendations going into searching for solutions

        ${previousSummary
                ? `         5. Refine the previous summary presented by the user with the new root causes. We are looping through hundreds of root causes, so it is important to keep the summary updated.`
                : ""}`),
            new HumanMessage(`${this.renderProblemStatement()}
        ${previousSummary ? `Previous Summary: ${previousSummary}` : ""}

        ${previousSummary
                ? `New root causes add to previous summary and reporting as needed`
                : "Root causes to summarize and report on"} : ${JSON.stringify(items, null, 2)}

        Take a deep breath and think step by step and output Markdown Summary:
        `),
        ];
        return messages;
    }
    async renderSummaryPrompt(items, previousSummary) {
        const messages = [
            new SystemMessage(`You are an expert in summarizing and reporting on root causes.

        Instructions:
        1. You will receive an array of root causes in JSON format to review, summarize and report on.
        2. You are to output a detailed summary in Markdown format.
        3. Never lose any important detail from the previous summary.
        4. Join very similar root causes together into the summaries
        5. Markdown output format:
          # Policy Synth Root Causes Report <Problem Title>

          ## Problem Statement
          <Problem Statement>

          ## Likely Root Causes Summaries
          <List of All Likely Root Causes in concise format>

          ## Additional Novel/Unexpected Root Causes For Further Investigation
          <List of additional Novel/Unexpected Root Causes in concise format>

          ## Conclusion big picture summary

         6. For conclusion not suggest any solutions to the problem, do not talk specifically about the root causes but the big picture inspired by the root causes.
         7. Do not include the publishedYear in the summaries but keep it in mind while writing or refining summaries or the conclusion

 ${previousSummary
                ? `
         Important Refine Instructions:
         1. Refine all aspects of <PreviousVersionOfReportToRefine> with the new root causes
         2. Look at the new root causes and see which ones are already there, you can either skip it or refine the curren one
         3. If any of the new root causes is not at all represented in the current root causes in the report you can add it but we don't want hundreds of root causes in the report.
         4. Never include duplicates or very similar root causes in the report.
            `
                : ""}`),
            new HumanMessage(`${this.renderProblemStatement()}
        ${previousSummary ? `<PreviousVersionOfReportToRefine>
        ${previousSummary}
        </PreviousVersionOfReportToRefine>` : ""}

        ${previousSummary
                ? `New root causes to refine the <PreviousVersionOfReportToRefine> with`
                : "Root causes to report on"}: ${JSON.stringify(items, null, 2)}

        Take a deep breath and think step by step and output Markdown Summary:
        `),
        ];
        return messages;
    }
    async summarizeItems(items, previousSummary) {
        try {
            this.logger.info(`Summarizing ${items.length} items`);
            const summary = await this.callLLM("web-search-root-causes", IEngineConstants.getRefinedRootCausesModel, await this.renderSummaryPrompt(items, previousSummary), false);
            this.logger.debug(`Summary coming out of LLM ${summary}`);
            return summary;
        }
        catch (error) {
            this.logger.error(`Error during summarization: ${error}`);
            throw error;
        }
    }
    async processCSV(filePath) {
        this.logger.info(`Processing CSV file: ${filePath}`);
        const items = [];
        let summary = "";
        return new Promise((resolve, reject) => {
            createReadStream(filePath)
                .pipe(csv(['Title', 'Description', 'WhyIsSubProblemImportant', 'YearPublished']))
                .on("data", (data) => {
                const item = {
                    title: data['Title'],
                    description: data['Description'],
                    whyIsSubProblemImportant: data['WhyIsSubProblemImportant'],
                    yearPublished: parseInt(data['YearPublished'])
                };
                items.push(item);
            })
                .on("end", async () => {
                this.logger.info(`Loaded ${items.length} items from CSV`);
                this.logger.debug(`Items: ${JSON.stringify(items, null, 2)}`);
                try {
                    summary = await this.processItemsInBatches(items);
                    resolve(summary);
                }
                catch (error) {
                    this.logger.error(`Error processing items in batches: ${error}`);
                    reject(error);
                }
            })
                .on("error", (error) => {
                this.logger.error(`Error processing CSV file: ${error}`);
                reject(error);
            });
        });
    }
    async processItemsInBatches(items) {
        let previousSummary;
        for (let i = 0; i < items.length; i += 20) {
            const batch = items.slice(i, i + 20).map((item, index) => ({
                title: item.title,
                description: item.description,
                whyIsSubProblemImportant: item.whyIsSubProblemImportant,
                yearPublished: item.yearPublished,
            }));
            previousSummary = await this.summarizeItems(batch, previousSummary);
        }
        return previousSummary;
    }
    async process() {
        this.logger.info("Summarization Agent Processor");
        super.process();
        this.chat = new ChatOpenAI({
            temperature: 0.0,
            maxTokens: 4096,
            modelName: "gpt-4o",
            verbose: true
        });
        const filePath = process.argv[3]; // Path to the CSV file is passed as a command-line argument
        if (!filePath) {
            this.logger.error("No CSV file path provided. Please provide the path as a command-line argument.");
            return;
        }
        try {
            const finalSummary = await this.processCSV(filePath);
            console.log("Final Summary in Markdown:");
            console.log(finalSummary);
        }
        catch (error) {
            this.logger.error(`Error in process method: ${error}`);
            throw error;
        }
    }
}
// Execute the process if this script is run directly
if (import.meta.url === new URL(import.meta.url).href) {
    const main = async () => {
        try {
            const projectId = process.argv[2];
            const fileName = `currentProject${projectId}.json`;
            // Load memory data from local file
            const fileData = await fs.readFile(fileName, 'utf-8');
            const memoryData = JSON.parse(fileData);
            const agent = new PsSubProblemsReportGenerator(memoryData);
            await agent.process();
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`Error during execution: ${error.message}`);
            }
            else {
                console.error('Unknown error during execution');
            }
        }
    };
    main();
}
//# sourceMappingURL=subProblemRootCausesReport.js.map