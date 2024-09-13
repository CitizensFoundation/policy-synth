import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
export class SolutionsSheetsExportAgent extends PolicySynthAgent {
    sheetsConnector;
    allSubProblems;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.sheetsConnector = PsConnectorFactory.getConnector(this.agent, this.memory, PsConnectorClassTypes.Spreadsheet, false);
        if (!this.sheetsConnector) {
            console.error("Google Sheets connector not found");
        }
    }
    async process() {
        await this.updateRangedProgress(0, "Starting solutions export");
        const subProblems = this.memory.subProblems;
        this.allSubProblems = subProblems;
        if (!subProblems || subProblems.length === 0) {
            throw new Error("No subproblems found in memory.");
        }
        for (let i = 0; i < subProblems.length; i++) {
            const subProblem = subProblems[i];
            const latestSolutions = this.getLatestGeneration(subProblem);
            if (latestSolutions && latestSolutions.length > 0) {
                await this.exportSubProblemSolutions(subProblem, latestSolutions);
            }
            else {
                console.warn(`No solutions found for subproblem: ${subProblem.title}`);
            }
            const progressPercentage = ((i + 1) / subProblems.length) * 100;
            await this.updateRangedProgress(progressPercentage, `Processed subproblem ${i + 1}/${subProblems.length}`);
        }
        await this.updateRangedProgress(100, "Solutions export completed");
    }
    getLatestGeneration(subProblem) {
        const populations = subProblem.solutions?.populations;
        if (populations && populations.length > 0) {
            return populations[populations.length - 1]; // Return the latest generation
        }
        return [];
    }
    async exportSubProblemSolutions(subProblem, solutions) {
        const sheetName = subProblem.title;
        // Ensure the sheet exists (create if it doesn't)
        await this.sheetsConnector.addSheetIfNotExists(sheetName);
        // Prepare data
        const data = this.prepareSolutionsData(solutions, subProblem);
        // Write data to the sheet starting from A1
        await this.sheetsConnector.updateRange(`${sheetName}!A1`, data);
    }
    getUrlsFromFamily(solution, subProblem) {
        let urlsSet = new Set();
        const visited = new Set();
        const stack = [solution];
        while (stack.length > 0) {
            const currentSolution = stack.pop();
            if (!currentSolution || !currentSolution.family)
                continue;
            // Collect seed URLs if available
            if (currentSolution.family.seedUrls && currentSolution.family.seedUrls.length > 0) {
                currentSolution.family.seedUrls.forEach((url) => {
                    urlsSet.add(url);
                });
            }
            // Process parentA and parentB
            ['parentA', 'parentB'].forEach((parentKey) => {
                const parentIndex = currentSolution.family[parentKey];
                if (parentIndex != undefined && !visited.has(parentIndex)) {
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
    getSolutionByIndex(index, subProblem) {
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
    prepareSolutionsData(solutions, subProblem) {
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
            solution.family?.gen ? solution.family?.gen.toString() : "",
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
//# sourceMappingURL=googleSheets.js.map