import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsBaseSheetConnector } from "@policysynth/agents/connectors/base/baseSheetConnector";

export class SolutionsSheetsExportAgent extends PolicySynthAgent {
  private sheetsConnector: PsBaseSheetConnector;

  declare memory: PsSmarterCrowdsourcingMemoryData;

  private allSubProblems!: PsSubProblem[];

  constructor(
    agent: PsAgent,
    memory: PsSmarterCrowdsourcingMemoryData,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);
    this.sheetsConnector = PsConnectorFactory.getConnector(
      this.agent,
      this.memory,
      PsConnectorClassTypes.Spreadsheet,
      false
    ) as PsBaseSheetConnector;

    if (!this.sheetsConnector) {
      console.error("Google Sheets connector not found");
    }
  }

  async process(): Promise<void> {
    await this.updateRangedProgress(0, "Starting solutions export");

    const subProblems: PsSubProblem[] = this.memory.subProblems;
    this.allSubProblems = subProblems;

    if (!subProblems || subProblems.length === 0) {
      throw new Error("No subproblems found in memory.");
    }

    for (let i = 0; i < subProblems.length; i++) {
      const subProblem = subProblems[i];
      const latestSolutions = this.getLatestGeneration(subProblem);

      if (latestSolutions && latestSolutions.length > 0) {
        await this.exportSubProblemSolutions(subProblem, latestSolutions);
      } else {
        console.warn(`No solutions found for subproblem: ${subProblem.title}`);
      }

      const progressPercentage = ((i + 1) / subProblems.length) * 100;
      await this.updateRangedProgress(
        progressPercentage,
        `Processed subproblem ${i + 1}/${subProblems.length}`
      );
    }

    await this.updateRangedProgress(100, "Solutions export completed");
  }

  private getLatestGeneration(subProblem: PsSubProblem): PsSolution[] {
    const populations = subProblem.solutions?.populations;
    if (populations && populations.length > 0) {
      return populations[populations.length - 1]; // Return the latest generation
    }
    return [];
  }

  private async exportSubProblemSolutions(
    subProblem: PsSubProblem,
    solutions: PsSolution[]
  ): Promise<void> {
    const sheetName = subProblem.title;

    // Ensure the sheet exists (create if it doesn't)
    await this.sheetsConnector.addSheetIfNotExists(sheetName);

    // Prepare data
    const data = this.prepareSolutionsData(solutions, subProblem);

    // Write data to the sheet starting from A1
    await this.sheetsConnector.updateRange(`${sheetName}!A1`, data);
  }

  private getUrlsFromFamily(solution: PsSolution, subProblem: PsSubProblem): string {
    let urlsSet = new Set<string>();
    const visited = new Set<string>();
    const stack: PsSolution[] = [solution];

    while (stack.length > 0) {
      const currentSolution = stack.pop();
      if (!currentSolution || !currentSolution.family) continue;

      // Collect seed URLs if available
      if (currentSolution.family.seedUrls && currentSolution.family.seedUrls.length > 0) {
        currentSolution.family.seedUrls.forEach((url) => {
          urlsSet.add(url);
        });
      }

      // Process parentA and parentB
      ['parentA', 'parentB'].forEach((parentKey) => {
        const parentIndex = currentSolution.family![parentKey as 'parentA' | 'parentB'];
        if (parentIndex!=undefined && !visited.has(parentIndex)) {
          visited.add(parentIndex);
          const parentSolution = this.getSolutionByIndex(parentIndex, subProblem);
          if (parentSolution) {
            stack.push(parentSolution);
          }
        }
      });
    }

    return Array.from(urlsSet).join('\n');
  }

  private getSolutionByIndex(index: string, subProblem: PsSubProblem): PsSolution | null {
    const [populationIndexStr, solutionIndexStr] = index.split(':');
    const populationIndex = parseInt(populationIndexStr);
    const solutionIndex = parseInt(solutionIndexStr);

    const populations = subProblem.solutions?.populations;
    if (populations && populations[populationIndex]) {
      const population = populations[populationIndex];
      if (population && population[solutionIndex]) {
        return population[solutionIndex];
      }
    }
    return null;
  }

  private prepareSolutionsData(solutions: PsSolution[], subProblem: PsSubProblem): string[][] {
    const headers = [
      "Title",
      "Description",
      "Main Benefit of Solution",
      "Main Obstacle to Solution Adoption",
      "Generation",
      "Seeds URLs",
      "Elo Rating",
     // "Relevance Score",
    //  "Quality Score",
    //  "Confidence Score",
      "Image URL",
      // Add other fields as needed
    ];

    const rows = solutions.map((solution) => [
      solution.title || "",
      solution.description || "",
      solution.mainBenefitOfSolution || "",
      solution.mainObstacleToSolutionAdoption || "",
      solution.family?.gen  ? solution.family?.gen.toString() : "",
      this.getUrlsFromFamily(solution, subProblem),
      solution.eloRating?.toString() || "",
    //  solution.relevanceScore?.toString() || "",
    //  solution.qualityScore?.toString() || "",
    //  solution.confidenceScore?.toString() || "",
      solution.imageUrl || "",
      // Add other fields as needed
    ]);

    return [headers, ...rows];
  }
}