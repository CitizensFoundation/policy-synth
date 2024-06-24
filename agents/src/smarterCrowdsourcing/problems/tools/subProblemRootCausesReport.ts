import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import { BaseProblemSolvingAgent } from "../../../base/smarterCrowdsourcingAgent.js";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PsConstants } from "../../../constants.js";

interface Item {
  title: string;
  description: string;
  whyIsSubProblemImportant: string;
  yearPublished?: number;
}

export class PsSubProblemsReportGenerator extends BaseProblemSolvingAgent {
  private summaryCount: number;

  constructor(memoryData: PSMemoryData) {
    super(undefined as any, memoryData);
    this.summaryCount = 0;
  }

  async renderPairwiseChoicesPrompt(
    items: Item[],
    previousSummary: string | undefined
  ): Promise<Array<HumanMessage | SystemMessage>> {
    const messages = [
      this.createSystemMessage(
        `You are an expert in creating a list of choices to vote in on a pairwise ranking project.

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

        ${
          previousSummary
            ? `         5. Refine the previous summary presented by the user with the new root causes. We are looping through hundreds of root causes, so it is important to keep the summary updated.`
            : ""
        }`
      ),
      this.createHumanMessage(
        `${this.renderProblemStatement()}
        ${previousSummary ? `Previous Summary: ${previousSummary}` : ""}

        ${
          previousSummary
            ? `New root causes add to previous summary and reporting as needed`
            : "Root causes to summarize and report on"
        } : ${JSON.stringify(items, null, 2)}

        Take a deep breath and think step by step and output Markdown Summary:
        `
      ),
    ];
    return messages;
  }

  async renderSummaryPrompt50(
    items: Item[],
    previousSummary: string | undefined
  ): Promise<Array<HumanMessage | SystemMessage>> {
    const messages = [
      this.createSystemMessage(
        `You are an expert in summarizing and reporting on root causes.

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

 ${
          previousSummary
            ? `
         Important Refine Instructions for <PreviousVersionOfReportToRefine>:
         1. If any of the new root causes is not at all represented in "## Likely Root Causes Summaries" you can add a new root cause.
         2. There can be a maximum of 50 best root causes in the "## Likely Root Causes Summaries", never include more, only include the most important ones, replace less imporant ones with new ones if needed.
         3. Refine if the current root causes with the new root causes if important details are missing.
         5. There can be a maximum of 7 best novel root causes in the "## Additional Novel/Unexpected Root Causes For Further Investigation", never include more, only include the most important ones, replace less imporant ones with new ones if needed.
         6. NEVER include duplicate or similar root causes summaries in the "## Likely Root Causes Summaries", pay special attention to this.
            `
            : ""
        }`
      ),
      this.createHumanMessage(
        `${this.renderProblemStatement()}
        ${previousSummary ? `<PreviousVersionOfReportToRefine>
        ${previousSummary}
        </PreviousVersionOfReportToRefine>` : ""}

        ${
          previousSummary
            ? `New root causes to refine the <PreviousVersionOfReportToRefine> with`
            : "Root causes to report on"
        }: ${JSON.stringify(items, null, 2)}

        Take a deep breath and output your Markdown report:
        `
      ),
    ];
    return messages;
  }

  async renderSummaryPrompt(
    items: Item[],
    previousSummary: string | undefined
  ): Promise<Array<HumanMessage | SystemMessage>> {
    const messages = [
      this.createSystemMessage(
        `You are an expert in summarizing and reporting on root causes.

        Instructions:
        1. You will receive an array of root causes in JSON format to review, summarize and report on.
        2. You are to output a detailed summary in Markdown format.
        3. Never lose any important detail from the previous summary.
        4. Join very similar root causes together in the summaries
        5. Markdown output format:
          # Policy Synth Root Causes Report <Problem Title>

          ## Problem Statement
          <Problem Statement>

          ## Likely Root Causes Summaries
          <List of All Likely Root Causes in concise format>

          ## Conclusion big picture summary

         6. For conclusion not suggest any solutions to the problem, do not talk specifically about the root causes but the big picture inspired by the root causes.
         7. Do not include the publishedYear in the summaries but keep it in mind while writing or refining summaries or the conclusion

 ${
          previousSummary
            ? `
         Important Refine Instructions for <PreviousVersionOfReportToRefine>:
         1. If any of the <NewRootCauses> is not at all represented in "## Likely Root Causes Summaries" you can add a new root cause.
         2. There can be a maximum of 25 best root causes in the "## Likely Root Causes Summaries", never include more, only include the most important ones, replace less imporant ones with new ones if needed from <NewRootCauses>.
         3. Refine if the current root causes in <PreviousVersionOfReportToRefine> with information from any duplicate <NewRootCauses> if important details are missing it's ok if the summaries get a little longer.
         4. NEVER include duplicate or similar root causes summaries in the "## Likely Root Causes Summaries", pay special attention to this.
            `
            : ""
        }`
      ),
      this.createHumanMessage(
        `${this.renderProblemStatement()}
        ${previousSummary ? `<PreviousVersionOfReportToRefine>
        ${previousSummary}
        </PreviousVersionOfReportToRefine>` : ""}

        ${
          previousSummary
            ? `<NewRootCauses> to refine the <PreviousVersionOfReportToRefine> with`
            : "Root causes to report on"
        }: ${JSON.stringify(items, null, 2)}
        ${previousSummary ? `</NewRootCauses>` : ``}

        Take a deep breath and output your Markdown report:
        `
      ),
    ];
    return messages;
  }

  async renderSummaryPromptNovel(
    items: Item[],
    previousSummary: string | undefined
  ): Promise<Array<HumanMessage | SystemMessage>> {
    const messages = [
      this.createSystemMessage(
        `You are an expert in summarizing and reporting on novel, unexpected and outying root causes of problems.

        Instructions:
        1. You will receive a problem statement and an array of root causes in JSON format to search for novel, unexpected outlying root causes that need further investigation.
        2. You are to output a detailed summary in Markdown format.
        3. Join very similar root causes together into the summaries.
        4. Do not output root causes that are widely known or expected.
        5. Markdown output format:
          # Policy Synth Novel, Unexpected Root Causes Report <Problem Title>

          ## Problem Statement
          <Problem Statement>

          ## Novel or Unexpected Root Causes Summaries
          <List ofNovel or Unexpected Root Causes in concise format>

          ## Conclusion of novel and unexpected root causes big picture summary

         6. For conclusion not suggest any solutions to the problem, do not talk specifically about the root causes but the big picture inspired by the root causes.
         7. Do not include the publishedYear in the summaries but keep it in mind while writing or refining summaries or the conclusion, ignore it.

 ${
          previousSummary
            ? `
         Important Refine Instructions for <PreviousVersionOfReportToRefine>:
         1. Never lose any important detail from the previous summary.
         2. If any of the <NewRootCauses> is not at all represented in "## Novel or Unexpected Root Causes Summaries" you can add a new root cause.
         3. There can be a maximum of 25 best root causes in the "## Novel or Unexpected Root Causes Summaries", never include more, only include the most important ones, replace less imporant ones with new ones if needed from <NewRootCauses>.
         4. Refine if the current root causes in <PreviousVersionOfReportToRefine> with information from any duplicate <NewRootCauses> if important details are missing it's ok if the summaries get a little longer.
         5. NEVER include duplicate or similar root causes summaries in the "## Novel or Unexpected Root Causes Summaries", pay special attention to this.
            `
            : ""
        }`
      ),
      this.createHumanMessage(
        `${this.renderProblemStatement()}
        ${previousSummary ? `<PreviousVersionOfReportToRefine>
        ${previousSummary}
        </PreviousVersionOfReportToRefine>` : ""}

        ${
          previousSummary
            ? `<NewRootCauses> to refine the <PreviousVersionOfReportToRefine> with`
            : "Root causes to report on"
        }: ${JSON.stringify(items, null, 2)}
        ${previousSummary ? `</NewRootCauses>` : ``}

        Take a deep breath and output your Markdown report:
        `
      ),
    ];
    return messages;
  }
  async summarizeItems(
    items: Item[],
    previousSummary: string | undefined
  ): Promise<string> {
    try {
      this.logger.info(`Summarizing ${items.length} items`);
      const summary = await this.callLLM(
        "web-search-root-causes",
        PsConstants.getRefinedRootCausesModel,
        await this.renderSummaryPrompt(items, previousSummary),
        false
      );

      this.logger.debug(`Summary coming out of LLM ${summary}`);
      this.summaryCount++;

      const fileName = `/tmp/subProblemSummary${this.memory.redisKey}Response${this.summaryCount}.md`;
      await fs.writeFile(fileName, summary);
      this.logger.info(`Saved summary to ${fileName}`);

      return summary;
    } catch (error) {
      this.logger.error(`Error during summarization: ${error}`);
      throw error;
    }
  }

  async processCSV(filePath: string): Promise<string> {
    this.logger.info(`Processing CSV file: ${filePath}`);
    const items: Item[] = [];
    let summary = "";

    return new Promise((resolve, reject) => {
      createReadStream(filePath)
        .pipe(csv(['Title', 'Description', 'WhyIsSubProblemImportant', 'YearPublished']))
        .on("data", (data: any) => {
          const item: Item = {
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
            summary = await this.processItemsInBatches(
              items
            );
            resolve(summary);
          } catch (error) {
            this.logger.error(`Error processing items in batches: ${error}`);
            reject(error);
          }
        })
        .on("error", (error: any) => {
          this.logger.error(`Error processing CSV file: ${error}`);
          reject(error);
        });
    });
  }

  async processItemsInBatches(
    items: Item[]
  ): Promise<string> {
    let previousSummary: string | undefined;

    for (let i = 0; i < items.length; i += 20) {
      const batch = items.slice(i, i + 20).map((item, index) => ({
        title: item.title,
        description: item.description,
        whyIsSubProblemImportant: item.whyIsSubProblemImportant,
        yearPublished: item.yearPublished,
      }));

      previousSummary = await this.summarizeItems(batch, previousSummary);
    }

    return previousSummary!;
  }

  async process(): Promise<void> {
    this.logger.info("Summarization Agent Processor");
    super.process();

    this.chat = new ChatOpenAI({
      temperature: 0.0,
      maxTokens: 4096,
      modelName: "gpt-4o",
      verbose: false
    });

    const filePath = process.argv[3]; // Path to the CSV file is passed as a command-line argument

    if (!filePath) {
      this.logger.error(
        "No CSV file path provided. Please provide the path as a command-line argument."
      );
      return;
    }

    try {
      const finalSummary = await this.processCSV(filePath);
      console.log("Final Summary in Markdown:");
      console.log(finalSummary);
    } catch (error) {
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
      const fileData: string = await fs.readFile(fileName, 'utf-8');
      const memoryData = JSON.parse(fileData);

      const agent = new PsSubProblemsReportGenerator(memoryData);
      await agent.process();
      console.log("Process completed successfully");
      process.exit(0);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error during execution: ${error.message}`);
      } else {
        console.error('Unknown error during execution');
      }
    }
  };

  main();
}