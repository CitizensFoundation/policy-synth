import { PairwiseRankingAgent } from "@policysynth/agents/base/agentPairwiseRanking.js";
//TODO: Get methods from the baseAgent not duplicate
export class BaseSmarterCrowdsourcingPairwiseAgent extends PairwiseRankingAgent {
    job;
    currentSubProblemIndex;
    get customInstructionsRankSolutions() {
        return this.getConfig("customInstructionsRankSolutions", "");
    }
    get minimumNumberOfPairwiseVotesForPopulation() {
        return this.getConfig("minimumNumberOfPairwiseVotesForPopulation", 10);
    }
    get maxTopEntitiesToSearch() {
        return this.getConfig("maxTopEntitiesToSearch", 3);
    }
    get rankSubProblemsInstructions() {
        return this.getConfig("rankSubProblemsInstructions", "");
    }
    get subProblemsRankingMinNumberOfMatches() {
        return this.getConfig("subProblemsRankingMinNumberOfMatches", 10);
    }
    get problemStatementDescription() {
        return this.getConfig("problemStatementDescription", "");
    }
    get maxSubProblems() {
        return this.getConfig("maxSubProblems", 7);
    }
    rootCauseTypes = [
        "historicalRootCause",
        "economicRootCause",
        "scientificRootCause",
        "culturalRootCause",
        "socialRootCause",
        "environmentalRootCause",
        "legalRootCause",
        "technologicalRootCause",
        "geopoliticalRootCause",
        "ethicalRootCause",
        "caseStudies",
    ];
    getProCons(prosCons) {
        if (prosCons && prosCons.length > 0) {
            return prosCons.map((proCon) => proCon.description);
        }
        else {
            return [];
        }
    }
    lastPopulationIndex(subProblemIndex) {
        return (this.memory.subProblems[subProblemIndex].solutions.populations.length - 1);
    }
    renderSubProblem(subProblemIndex, useProblemAsHeader = false) {
        const subProblem = this.memory.subProblems[subProblemIndex];
        return `
      ${useProblemAsHeader ? "Problem" : "Sub Problem"}:
      ${subProblem.title}

      ${subProblem.description}

      ${subProblem.whyIsSubProblemImportant}
      `;
    }
    renderSubProblemSimple(subProblemIndex) {
        const subProblem = this.memory.subProblems[subProblemIndex];
        return `
      ${subProblem.title}
      ${subProblem.description}
      `;
    }
    getActiveSolutionsLastPopulation(subProblemIndex) {
        const populations = this.memory.subProblems[subProblemIndex].solutions.populations;
        const lastPopulation = populations[populations.length - 1];
        return lastPopulation.filter((solution) => !solution.reaped);
    }
    getActiveSolutionsFromPopulation(subProblemIndex, populationIndex) {
        const populations = this.memory.subProblems[subProblemIndex].solutions.populations;
        const lastPopulation = populations[populationIndex];
        return lastPopulation.filter((solution) => !solution.reaped);
    }
    numberOfPopulations(subProblemIndex) {
        return this.memory.subProblems[subProblemIndex].solutions.populations
            .length;
    }
    renderSubProblems() {
        return `
      Sub Problems:
      ${this.memory.subProblems.map((subProblem, index) => {
            return `
        ${index + 1}. ${subProblem.title}\n

        ${subProblem.description}\n

        ${subProblem.whyIsSubProblemImportant}\n
        `;
        })}
   `;
    }
    renderEntity(subProblemIndex, entityIndex) {
        const entity = this.memory.subProblems[subProblemIndex].entities[entityIndex];
        return `
      Entity: ${entity.name}
      ${this.renderEntityPosNegReasons(entity)}
      `;
    }
    renderProblemStatement() {
        return `
      Problem Statement:
      ${this.problemStatementDescription}
      `;
    }
    renderProblemStatementSubProblemsAndEntities(index, includeMainProblemStatement = true) {
        const subProblem = this.memory.subProblems[index];
        const entitiesText = `
      ${subProblem.entities
            .slice(0, process.env.PS_MAX_ENTITIES_TO_RENDER
            ? parseInt(process.env.PS_MAX_ENTITIES_TO_RENDER)
            : 3)
            .map((entity) => {
            let entityEffects = this.renderEntityPosNegReasons(entity);
            if (entityEffects.length > 0) {
                entityEffects = `\n${entity.name}\n${entityEffects}\n}`;
            }
            return entityEffects;
        })
            .join("")}`;
        return `
      ${includeMainProblemStatement
            ? `Problem Statement:\n${this.problemStatementDescription}\n\nSub Problem:\n`
            : `Problem:\n`}
      ${subProblem.title}\n
      ${subProblem.description}\n

      ${entitiesText ? `Top Affected Entities:\n${entitiesText}` : ""}
    `;
    }
    renderEntityPosNegReasons(item) {
        let itemEffects = "";
        if (item.positiveEffects && item.positiveEffects.length > 0) {
            itemEffects += `
      Positive Effects:
      ${item.positiveEffects.join("\n")}
      `;
        }
        if (item.negativeEffects && item.negativeEffects.length > 0) {
            itemEffects += `
      Negative Effects:
      ${item.negativeEffects.join("\n")}
      `;
        }
        return itemEffects;
    }
}
//# sourceMappingURL=scPairwiseAgent.js.map