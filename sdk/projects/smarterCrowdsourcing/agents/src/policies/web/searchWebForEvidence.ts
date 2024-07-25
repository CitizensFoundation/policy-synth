import { SearchWebAgent } from "../../solutions/web/searchWeb.js";
import { CreateEvidenceSearchQueriesAgent } from "../create/createEvidenceSearchQueries.js";

export class SearchWebForEvidenceAgent extends SearchWebAgent {
  searchCounter = 0
  async searchWeb(
    policy: PSPolicy,
    subProblemIndex: number,
    policyIndex: number
  ) {
    if (!policy.evidenceSearchResults) {
      //@ts-ignore
      policy.evidenceSearchResults = {};
    }
    for (const searchResultType of CreateEvidenceSearchQueriesAgent.evidenceWebPageTypesArray) {

      // If searchCounter mod 10 then print
      if (this.searchCounter % 10 == 0) {
        this.logger.info(`Have searched ${this.searchCounter} queries`);
      }
      if (this.searchCounter > 990) {
        // Sleep for 15 minutes
        this.logger.info(`Sleeping for 15 minutes to avoid search API rate limit`);
        await new Promise((resolve) => setTimeout(resolve, 15 * 60 * 1000));
        this.searchCounter = 300;
      }

      if (!policy.evidenceSearchResults![searchResultType]) {

        let queriesToSearch =  policy.evidenceSearchQueries![searchResultType]
         .slice(0, this.maxTopEvidenceQueriesToSearchPerType);

        const results = await this.getQueryResults(
          queriesToSearch,
          `subProblem_${subProblemIndex}_${searchResultType}_policy_${policyIndex}}`
        );

        this.searchCounter+=this.maxTopEvidenceQueriesToSearchPerType;

        policy.evidenceSearchResults![searchResultType] = results.searchResults;

        this.logger.info(
          `Have saved search results for ${subProblemIndex}/${policyIndex}: ${searchResultType} search results`
        );

        await this.saveMemory();
      } else {
        this.logger.info(`Have already saved search results for ${subProblemIndex}/${policyIndex}: ${searchResultType} search results`);
      }
    }
  }

  async process() {
    this.logger.info("Search Web for Evidence Agent");
    this.seenUrls = new Map();

    super.process();

    const subProblemsLimit = Math.min(
      this.memory.subProblems.length,
      this.maxSubProblems
    );

    for (
      let subProblemIndex = 0;
      subProblemIndex < subProblemsLimit;
      subProblemIndex++
    ) {
      const subProblem = this.memory.subProblems[subProblemIndex];

      const policies =
        subProblem.policies?.populations[
          subProblem.policies!.populations.length - 1
        ];

      if (policies) {
        for (
          let policyIndex = 0;
          policyIndex < policies.length;
          policyIndex++
        ) {
          this.logger.info(
            `Searching web for evidence for policy ${policyIndex}/${
              policies.length
            } of sub problem ${subProblemIndex} (${this.lastPopulationIndex(
              subProblemIndex
            )})`
          );

          const policy = policies[policyIndex];

          await this.searchWeb(policy, subProblemIndex, policyIndex);

          await this.saveMemory();
        }
      } else {
        this.logger.warn(
          `Sub problem ${subProblemIndex} doesn't have policies ${subProblem.policies?.populations.length} populations`
        );
      }

      await this.saveMemory();
    }

    this.logger.info(
      "Finished creating policies evidence search queries for all subproblems"
    );

    this.logger.info("Finished processing web search");

    await this.saveMemory();
  }
}
