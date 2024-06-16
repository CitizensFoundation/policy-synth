# PsConstants

This class provides a set of constants and configurations for various AI models used in the engine. These constants include model configurations, token prices, limits, and other settings.

## Properties

| Name                                      | Type                      | Description                                                                 |
|-------------------------------------------|---------------------------|-----------------------------------------------------------------------------|
| createSubProblemsModel                    | PsBaseAIModelConstants | Configuration for the "createSubProblems" model.                            |
| policiesSeedModel                         | PsBaseAIModelConstants | Configuration for the "policiesSeed" model.                                 |
| analyseExternalSolutionsModel             | PsBaseAIModelConstants | Configuration for the "analyseExternalSolutions" model.                     |
| createEntitiesModel                       | PsBaseAIModelConstants | Configuration for the "createEntities" model.                               |
| topicMapSolutionsModel                    | object                    | Configuration for the "topicMapSolutions" model.                            |
| createSolutionImagesModel                 | PsBaseAIModelConstants | Configuration for the "createSolutionImages" model.                         |
| createSearchQueriesModel                  | PsBaseAIModelConstants | Configuration for the "createSearchQueries" model.                          |
| createEvidenceSearchQueriesModel          | PsBaseAIModelConstants | Configuration for the "createEvidenceSearchQueries" model.                  |
| createRootCauseSearchQueriesModel         | PsBaseAIModelConstants | Configuration for the "createRootCauseSearchQueries" model.                 |
| searchQueryRankingsModel                  | PsBaseAIModelConstants | Configuration for the "searchQueryRankings" model.                          |
| searchResultsRankingsModel                | PsBaseAIModelConstants | Configuration for the "searchResultsRankings" model.                        |
| subProblemsRankingsModel                  | PsBaseAIModelConstants | Configuration for the "subProblemsRankings" model.                          |
| entitiesRankingsModel                     | PsBaseAIModelConstants | Configuration for the "entitiesRankings" model.                             |
| solutionsRankingsModel                    | PsBaseAIModelConstants | Configuration for the "solutionsRankings" model.                            |
| prosConsRankingsModel                     | PsBaseAIModelConstants | Configuration for the "prosConsRankings" model.                             |
| getPageAnalysisModel                      | PsBaseAIModelConstants | Configuration for the "getPageAnalysis" model.                              |
| getSolutionsPagesAnalysisModel            | PsBaseAIModelConstants | Configuration for the "getSolutionsPagesAnalysis" model.                    |
| rankWebSolutionsModel                     | PsBaseAIModelConstants | Configuration for the "rankWebSolutions" model.                             |
| reduceSubProblemsModel                    | PsBaseAIModelConstants | Configuration for the "reduceSubProblems" model.                            |
| rateWebEvidenceModel                      | PsBaseAIModelConstants | Configuration for the "rateWebEvidence" model.                              |
| rateWebRootCausesModel                    | PsBaseAIModelConstants | Configuration for the "rateWebRootCauses" model.                            |
| rankWebEvidenceModel                      | PsBaseAIModelConstants | Configuration for the "rankWebEvidence" model.                              |
| rankWebRootCausesModel                    | PsBaseAIModelConstants | Configuration for the "rankWebRootCauses" model.                            |
| getRefinedEvidenceModel                   | PsBaseAIModelConstants | Configuration for the "getRefinedEvidence" model.                           |
| getRefinedRootCausesModel                 | PsBaseAIModelConstants | Configuration for the "getRefinedRootCauses" model.                         |
| reapSolutionsModel                        | PsBaseAIModelConstants | Configuration for the "reapSolutions" model.                                |
| groupSolutionsModel                       | PsBaseAIModelConstants | Configuration for the "groupSolutions" model.                               |
| rateSolutionsModel                        | PsBaseAIModelConstants | Configuration for the "rateSolutions" model.                                |
| createSolutionsModel                      | PsBaseAIModelConstants | Configuration for the "createSolutions" model.                              |
| evolveSolutionsModel                      | PsBaseAIModelConstants | Configuration for the "evolveSolutions" model.                              |
| createProsConsModel                       | PsBaseAIModelConstants | Configuration for the "createProsCons" model.                               |
| evolutionMutateModel                      | PsBaseAIModelConstants | Configuration for the "evolutionMutate" model.                              |
| evolutionRecombineModel                   | PsBaseAIModelConstants | Configuration for the "evolutionRecombine" model.                           |
| validationModel                           | PsBaseAIModelConstants | Configuration for the "validation" model.                                   |
| ingestionModel                            | PsBaseAIModelConstants | Configuration for the "ingestion" model.                                    |
| engineerModel                             | PsBaseAIModelConstants | Configuration for the "engineer" model.                                     |
| getPageCacheExpiration                    | number                    | Cache expiration time for pages (in seconds).                               |
| maxSubProblems                            | number                    | Maximum number of sub-problems.                                             |
| maxNumberGeneratedOfEntities              | number                    | Maximum number of generated entities.                                       |
| maxStabilityRetryCount                    | number                    | Maximum retry count for stability.                                          |
| mainLLMmaxRetryCount                      | number                    | Maximum retry count for the main LLM.                                       |
| limitedLLMmaxRetryCount                   | number                    | Maximum retry count for the limited LLM.                                    |
| rankingLLMmaxRetryCount                   | number                    | Maximum retry count for the ranking LLM.                                    |
| maxTopEntitiesToSearch                    | number                    | Maximum top entities to search.                                             |
| maxTopEntitiesToRender                    | number                    | Maximum top entities to render.                                             |
| maxTopQueriesToSearchPerType              | number                    | Maximum top queries to search per type.                                     |
| maxTopEvidenceQueriesToSearchPerType      | number                    | Maximum top evidence queries to search per type.                            |
| maxTopRootCauseQueriesToSearchPerType     | number                    | Maximum top root cause queries to search per type.                          |
| maxRootCausePercentOfSearchResultWebPagesToGet | number                    | Maximum root cause percent of search result web pages to get.               |
| maxRootCausesToUseForRatingRootCauses     | number                    | Maximum root causes to use for rating root causes.                          |
| topWebPagesToGetForRefineRootCausesScan   | number                    | Top web pages to get for refine root causes scan.                           |
| mainSearchRetryCount                      | number                    | Main search retry count.                                                    |
| maxDalleRetryCount                        | number                    | Maximum DALL-E retry count.                                                 |
| maxTopWebPagesToGet                       | number                    | Maximum top web pages to get.                                               |
| maxBingSearchResults                      | number                    | Maximum Bing search results.                                                |
| maxTopProsConsUsedForRating               | number                    | Maximum top pros and cons used for rating.                                  |
| maxNumberGeneratedProsConsForSolution     | number                    | Maximum number of generated pros and cons for a solution.                   |
| minSleepBeforeBrowserRequest              | number                    | Minimum sleep before browser request (in milliseconds).                     |
| maxAdditionalRandomSleepBeforeBrowserRequest | number                    | Maximum additional random sleep before browser request (in milliseconds).   |
| numberOfSearchTypes                       | number                    | Number of search types.                                                     |
| webPageNavTimeout                         | number                    | Web page navigation timeout (in milliseconds).                              |
| subProblemsRankingMinNumberOfMatches      | number                    | Minimum number of matches for sub-problems ranking.                         |
| currentUserAgent                          | string                    | Current user agent string.                                                  |
| topItemsToKeepForTopicClusterPruning      | number                    | Top items to keep for topic cluster pruning.                                |
| chances                                   | object                    | Various chances for different operations.                                   |
| maxTopSearchQueriesForSolutionCreation    | number                    | Maximum top search queries for solution creation.                           |
| maxPercentOfSolutionsWebPagesToGet        | number                    | Maximum percent of solutions web pages to get.                              |
| limits                                    | object                    | Various limits for different operations.                                    |
| enable                                    | object                    | Enable flags for different operations.                                      |
| evolution                                 | object                    | Evolution settings.                                                         |
| maxPercentOfEloMatched                    | number                    | Maximum percent of ELO matched.                                             |
| minimumNumberOfPairwiseVotesForPopulation | number                    | Minimum number of pairwise votes for population.                            |
| maxNumberOfPairwiseRankingPrompts         | number                    | Maximum number of pairwise ranking prompts.                                 |
| maxTopSolutionsToCreatePolicies           | number                    | Maximum top solutions to create policies.                                   |
| maxTopPoliciesToProcess                   | number                    | Maximum top policies to process.                                            |
| maxEvidenceToUseForRatingEvidence         | number                    | Maximum evidence to use for rating evidence.                                |
| policyEvidenceFieldTypes                  | string[]                  | List of policy evidence field types.                                        |
| rootCauseFieldTypes                       | string[]                  | List of root cause field types.                                             |

## Methods

| Name                   | Parameters          | Return Type | Description                                                                 |
|------------------------|---------------------|-------------|-----------------------------------------------------------------------------|
| simplifyEvidenceType   | evidenceType: string | string      | Simplifies the evidence type string.                                        |
| simplifyRootCauseType  | rootCauseType: string | string      | Simplifies the root cause type string.                                      |

## Example

```typescript
import { PsConstants } from '@policysynth/agents/constants.js';

// Example usage of PsConstants
const modelConfig = PsConstants.createSubProblemsModel;
console.log(modelConfig.name); // Output: gpt-4o
```