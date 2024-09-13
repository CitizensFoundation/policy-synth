import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
export class SolutionsFromSearchSheetsExportAgent extends PolicySynthAgent {
    sheetsConnector;
    constructor(agent, memory, startProgress, endProgress) {
        super(agent, memory, startProgress, endProgress);
        this.sheetsConnector = PsConnectorFactory.getConnector(this.agent, this.memory, PsConnectorClassTypes.Spreadsheet, false);
        if (!this.sheetsConnector) {
            console.error("Google Sheets connector not found");
            throw new Error("Google Sheets connector not found");
        }
    }
    async process() {
        await this.updateRangedProgress(0, "Starting solutionsFromSearch export");
        // Export Problem Statement SolutionsFromSearch
        const problemStatementSolutions = this.memory.problemStatement.solutionsFromSearch;
        if (problemStatementSolutions && problemStatementSolutions.length > 0) {
            await this.exportSolutions("ProblemStatement_SolutionsFromSearch", problemStatementSolutions, "Problem Statement", "ProblemStatement");
        }
        else {
            console.warn("No solutionsFromSearch found for the problem statement.");
        }
        const subProblems = this.memory.subProblems;
        if (!subProblems || subProblems.length === 0) {
            throw new Error("No subproblems found in memory.");
        }
        for (let i = 0; i < subProblems.length; i++) {
            const subProblem = subProblems[i];
            const subProblemSolutions = subProblem.solutionsFromSearch;
            // Initialize combined solutions array
            const combinedSolutions = [];
            // Add subproblem's solutionsFromSearch
            if (subProblemSolutions && subProblemSolutions.length > 0) {
                subProblemSolutions.forEach((solution) => {
                    combinedSolutions.push({
                        source: "SubProblem",
                        solution: solution,
                    });
                });
            }
            else {
                console.warn(`No solutionsFromSearch found for subproblem: ${subProblem.title}`);
            }
            // Add entities' solutionsFromSearch
            if (subProblem.entities && subProblem.entities.length > 0) {
                for (let j = 0; j < subProblem.entities.length; j++) {
                    const entity = subProblem.entities[j];
                    const entitySolutions = entity.solutionsFromSearch; // Ensure entity has solutionsFromSearch
                    if (entitySolutions && entitySolutions.length > 0) {
                        entitySolutions.forEach((solution) => {
                            combinedSolutions.push({
                                source: `Entity: ${entity.name}`,
                                solution: solution,
                            });
                        });
                    }
                    else {
                        console.warn(`No solutionsFromSearch found for entity: ${entity.name} in subproblem: ${subProblem.title}`);
                    }
                }
            }
            if (combinedSolutions.length > 0) {
                const sheetName = `SubProblem_${i + 1}_${this.sanitizeSheetName(subProblem.title)}_SolutionsFromSearch`;
                await this.exportSolutions(sheetName, combinedSolutions.map(cs => cs.solution), `SubProblem ${i + 1}: ${subProblem.title}`, combinedSolutions.map(cs => cs.source).join(", "));
            }
            else {
                console.warn(`No combined solutions found for subproblem: ${subProblem.title}`);
            }
            const progressPercentage = ((i + 1) / subProblems.length) * 100;
            await this.updateRangedProgress(progressPercentage, `Processed subproblem ${i + 1}/${subProblems.length}`);
        }
        await this.updateRangedProgress(100, "SolutionsFromSearch export completed");
    }
    /**
     * Sanitizes sheet names by removing or replacing invalid characters.
     * @param name The original sheet name.
     * @returns A sanitized sheet name.
     */
    sanitizeSheetName(name) {
        return name.replace(/[/\\?*[\]]/g, "_").substring(0, 100);
    }
    /**
     * Exports a list of PsSolution to a specified sheet with an optional source description.
     * This method handles both individual and combined exports.
     * @param sheetName The name of the sheet to export to.
     * @param solutions The list of solutions to export.
     * @param contextDescription A description of the context for progress updates.
     * @param sourceDescription (Optional) A description of the sources of the solutions.
     */
    async exportSolutions(sheetName, solutions, contextDescription, sourceDescription = "") {
        // Ensure the sheet exists (create if it doesn't)
        await this.sheetsConnector.addSheetIfNotExists(sheetName);
        // Prepare data
        const data = this.prepareSolutionsData(solutions, sourceDescription);
        // Write data to the sheet starting from A1
        await this.sheetsConnector.updateRange(`${sheetName}!A1`, data);
        console.log(`Exported ${solutions.length} solutions to sheet: ${sheetName} (${contextDescription})`);
    }
    /**
     * Prepares the data for exporting solutionsFromSearch.
     * @param solutions The list of solutions to prepare.
     * @param sourceDescription (Optional) A description of the sources of the solutions.
     * @returns A 2D array representing rows and columns for Google Sheets.
     */
    prepareSolutionsData(solutions, sourceDescription) {
        const headers = sourceDescription
            ? [
                "Source",
                "ID",
                "Title",
                "Description",
                "Main Benefit of Solution",
                "Main Obstacle to Solution Adoption",
                "Generation",
                "Seed URLs",
                "Elo Rating",
                "Image URL",
                "From URL",
                "Relevance Score",
                "Quality Score",
                "Confidence Score",
                // Add other fields as needed
            ]
            : [
                "ID",
                "Title",
                "Description",
                "Main Benefit of Solution",
                "Main Obstacle to Solution Adoption",
                "Generation",
                "Seed URLs",
                "Elo Rating",
                "Image URL",
                "From URL",
                // Add other fields as needed
            ];
        const rows = solutions.map((solution) => {
            const baseRow = [
                solution.id || "",
                solution.title || "",
                solution.description || "",
                solution.mainBenefitOfSolution || "",
                solution.mainObstacleToSolutionAdoption || "",
                solution.family?.gen ? solution.family.gen.toString() : "",
                solution.family?.seedUrls ? solution.family.seedUrls.join("\n") : "",
                solution.eloRating?.toString() || "",
                solution.imageUrl || "",
                solution.fromUrl || "",
                // Add other fields as needed
            ];
            return sourceDescription
                ? [sourceDescription, ...baseRow]
                : baseRow;
        });
        return [headers, ...rows];
    }
}
//# sourceMappingURL=sheetsWegSolutions.js.map