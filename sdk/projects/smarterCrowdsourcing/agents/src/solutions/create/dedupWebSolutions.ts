import { SolutionsEvolutionSmarterCrowdsourcingAgent } from "../../base/scBaseSolutionsEvolutionAgent.js";
import { WebPageVectorStore } from "../../vectorstore/webPage.js";
import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";

interface SolutionToRemove {
  titleOfSimilarSolutionToDrop: string;
}

export class RemoveDuplicateWebSolutions extends SolutionsEvolutionSmarterCrowdsourcingAgent {
  webPageVectorStore = new WebPageVectorStore();
  allUrls = new Set<string>();
  duplicateUrls: string[] = [];

  renderMessages(solutions: PsSolution[]) {
    const messages = [
      this.createSystemMessage(
        `Take a deep breath and analyze the array of solution oriented JSON objects provided to you by the user, if some of them are identical, choose the less important ones to drop and output as as JSON array: [
          {
             titleOfSimilarSolutionToDrop: string;
          }
        ]

        If none of the solutions are identical output only an empty JSON array: []

        `
      ),
      this.createHumanMessage(
        `</SolutionsToAnalyzeForIdenticalSimilarities>
          ${JSON.stringify(
            solutions.map(
              ({ fromUrl, contacts, fromSearchType, ...rest }) => rest
            ),
            null,
            2
          )}
        </SolutionsToAnalyzeForIdenticalSimilarities>

        Your JSON Array:
       `
      ),
    ];

    return messages;
  }

  async dedup(solutions: PsSolution[]) {
    const NO_DUPLICATES_THRESHOLD = 20;
    const RANDOM_SAMPLE_SIZE = 20;
    let noDuplicatesCount = 0;

    while (noDuplicatesCount < NO_DUPLICATES_THRESHOLD) {
      // Step 1: Select a random subset of solutions
      const randomSolutions = [];
      const solutionsCopy = [...solutions];

      for (let i = 0; i < RANDOM_SAMPLE_SIZE; i++) {
        if (solutionsCopy.length === 0) break;
        const randomIndex = Math.floor(Math.random() * solutionsCopy.length);
        randomSolutions.push(solutionsCopy.splice(randomIndex, 1)[0]);
      }

      this.logger.debug(
        `Random Solutions: ${JSON.stringify(
          randomSolutions.map((s) => s.title),
          null,
          2
        )}`
      );

      // Step 2: Call the LLM for a list of duplicates to remove
      const duplicateSolutionTitlesToRemove = (await this.callModel(
        PsAiModelType.Text,
        PsAiModelSize.Medium,
        this.renderMessages(randomSolutions),
        true,
        true
      )) as SolutionToRemove[];

      this.logger.debug(
        JSON.stringify(duplicateSolutionTitlesToRemove, null, 2)
      );

      // Step 3: Count duplicates
      const titlesToRemoveCount = new Map<string, number>();
      for (const {
        titleOfSimilarSolutionToDrop,
      } of duplicateSolutionTitlesToRemove) {
        if (titlesToRemoveCount.has(titleOfSimilarSolutionToDrop)) {
          titlesToRemoveCount.set(
            titleOfSimilarSolutionToDrop,
            titlesToRemoveCount.get(titleOfSimilarSolutionToDrop)! + 1
          );
        } else {
          titlesToRemoveCount.set(titleOfSimilarSolutionToDrop, 1);
        }
      }

      // Step 4: Remove duplicates
      let duplicatesFound = false;
      const newSolutions = [];

      for (const solution of solutions) {
        if (titlesToRemoveCount.has(solution.title)) {
          const count = titlesToRemoveCount.get(solution.title)!;
          if (count > 0) {
            titlesToRemoveCount.set(solution.title, count - 1);
            duplicatesFound = true;
            this.logger.info(`Dropping solution: ${solution.title}`);
            continue; // Skip this solution to remove it
          }
        }
        newSolutions.push(solution);
      }

      solutions = newSolutions;

      // Step 5: Check for duplicates found and update the counter
      if (duplicatesFound) {
        noDuplicatesCount = 0; // Reset the counter if we found duplicates
      } else {
        noDuplicatesCount++; // Increment the counter if no duplicates were found
      }

      this.logger.info(
        `Length of solutions after dedup: ${solutions.length} noDuplicatesCount: ${noDuplicatesCount}`
      );
    }

    return solutions;
  }

  async processSubProblems() {
    const promises = [];

    for (
      let s = 0;
      s <
      Math.min(this.memory.subProblems.length, this.maxSubProblems);
      s++
    ) {
      promises.push(
        (async () => {
          this.copyEntitySolutionsToSubProblem(s);
          await this.saveMemory();

          this.memory.subProblems[s].solutionsFromSearch = await this.dedup(
            this.memory.subProblems[s].solutionsFromSearch!
          );

          this.logger.info(
            `Finished and closed page for ${this.memory.subProblems[s].title}`
          );
        })()
      );
    }

    await Promise.all(promises);
  }

  async copyEntitySolutionsToSubProblem(subProblemIndex: number) {
    for (
      let e = 0;
      e <
      Math.min(
        this.memory.subProblems[subProblemIndex].entities.length,
        this.maxTopEntitiesToSearch
      );
      e++
    ) {
      this.memory.subProblems[subProblemIndex].solutionsFromSearch! = [
        ...this.memory.subProblems[subProblemIndex].solutionsFromSearch!,
        ...this.memory.subProblems[subProblemIndex].entities[e]
          .solutionsFromSearch!,
      ];
    }
  }

  async processProblemStatement() {
    const lengthBefore =
      this.memory.problemStatement.solutionsFromSearch!.length;

    this.logger.info(
      `Deduping Web Solutions for Problem Statement for length before: ${lengthBefore}`
    );

    this.memory.problemStatement.solutionsFromSearch = await this.dedup(
      this.memory.problemStatement.solutionsFromSearch!
    );

    const lengthAfter =
      this.memory.problemStatement.solutionsFromSearch!.length;

    this.logger.info(
      `Deduping Web Solutions for Problem Statement complete for length after: ${lengthAfter} removed ${
        lengthBefore - lengthAfter
      }`
    );
  }

  async processAll() {
    await this.processProblemStatement();

    // Sleeep 60 sec
    await new Promise((resolve) => setTimeout(resolve, 30000));

    await this.processSubProblems();

    await this.saveMemory();
  }

  async process() {
    this.logger.info("Dedup Web Solutions Agent");
    super.process();

    await this.processAll();

    this.logger.info("Get Web Pages Agent Complete");
  }
}
