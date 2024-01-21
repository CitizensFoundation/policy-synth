# IEngineConstants

The `IEngineConstants` class provides a collection of static properties and methods that define various constants and configurations for AI model parameters, pricing, limits, and other settings used within an AI engine.

## Properties

| Name                                             | Type                  | Description                                                                 |
|--------------------------------------------------|-----------------------|-----------------------------------------------------------------------------|
| createSubProblemsModel                           | IEngineBaseAIModelConstants | Configuration for the AI model used to create sub-problems.                 |
| policiesSeedModel                                | IEngineBaseAIModelConstants | Configuration for the AI model used to seed policies.                       |
| analyseExternalSolutionsModel                    | IEngineBaseAIModelConstants | Configuration for the AI model used to analyze external solutions.          |
| createEntitiesModel                              | IEngineBaseAIModelConstants | Configuration for the AI model used to create entities.                     |
| topicMapSolutionsModel                           | Object                | Configuration for the AI model used in topic map solutions.                 |
| createSolutionImagesModel                        | IEngineBaseAIModelConstants | Configuration for the AI model used to create solution images.              |
| createSearchQueriesModel                         | IEngineBaseAIModelConstants | Configuration for the AI model used to create search queries.               |
| createEvidenceSearchQueriesModel                 | IEngineBaseAIModelConstants | Configuration for the AI model used to create evidence search queries.      |
| createRootCauseSearchQueriesModel                | IEngineBaseAIModelConstants | Configuration for the AI model used to create root cause search queries.    |
| searchQueryRankingsModel                         | IEngineBaseAIModelConstants | Configuration for the AI model used to rank search queries.                 |
| searchResultsRankingsModel                       | IEngineBaseAIModelConstants | Configuration for the AI model used to rank search results.                 |
| subProblemsRankingsModel                         | IEngineBaseAIModelConstants | Configuration for the AI model used to rank sub-problems.                   |
| entitiesRankingsModel                            | IEngineBaseAIModelConstants | Configuration for the AI model used to rank entities.                       |
| solutionsRankingsModel                           | IEngineBaseAIModelConstants | Configuration for the AI model used to rank solutions.                      |
| prosConsRankingsModel                            | IEngineBaseAIModelConstants | Configuration for the AI model used to rank pros and cons.                  |
| getPageAnalysisModel                             | IEngineBaseAIModelConstants | Configuration for the AI model used to get page analysis.                   |
| getSolutionsPagesAnalysisModel                   | IEngineBaseAIModelConstants | Configuration for the AI model used to analyze solutions pages.             |
| rankWebSolutionsModel                            | IEngineBaseAIModelConstants | Configuration for the AI model used to rank web solutions.                  |
| reduceSubProblemsModel                           | IEngineBaseAIModelConstants | Configuration for the AI model used to reduce sub-problems.                 |
| rateWebEvidenceModel                             | IEngineBaseAIModelConstants | Configuration for the AI model used to rate web evidence.                   |
| rateWebRootCausesModel                           | IEngineBaseAIModelConstants | Configuration for the AI model used to rate web root causes.                |
| rankWebEvidenceModel                             | IEngineBaseAIModelConstants | Configuration for the AI model used to rank web evidence.                   |
| rankWebRootCausesModel                           | IEngineBaseAIModelConstants | Configuration for the AI model used to rank web root causes.                |
| getRefinedEvidenceModel                          | IEngineBaseAIModelConstants | Configuration for the AI model used to get refined evidence.                |
| getRefinedRootCausesModel                        | IEngineBaseAIModelConstants | Configuration for the AI model used to get refined root causes.             |
| reapSolutionsModel                               | IEngineBaseAIModelConstants | Configuration for the AI model used to reap solutions.                      |
| groupSolutionsModel                              | IEngineBaseAIModelConstants | Configuration for the AI model used to group solutions.                     |
| rateSolutionsModel                               | IEngineBaseAIModelConstants | Configuration for the AI model used to rate solutions.                      |
| createSolutionsModel                             | IEngineBaseAIModelConstants | Configuration for the AI model used to create solutions.                    |
| evolveSolutionsModel                             | IEngineBaseAIModelConstants | Configuration for the AI model used to evolve solutions.                    |
| createProsConsModel                              | IEngineBaseAIModelConstants | Configuration for the AI model used to create pros and cons.                |
| evolutionMutateModel                             | IEngineBaseAIModelConstants | Configuration for the AI model used in evolution mutation.                  |
| evolutionRecombineModel                          | IEngineBaseAIModelConstants | Configuration for the AI model used in evolution recombination.             |
| validationModel                                  | IEngineBaseAIModelConstants | Configuration for the AI model used for validation.                         |
| getPageCacheExpiration                           | number                | The expiration time for page cache in seconds.                              |
| maxSubProblems                                   | number                | The maximum number of sub-problems allowed.                                 |
| maxNumberGeneratedOfEntities                     | number                | The maximum number of entities that can be generated.                       |
| maxStabilityRetryCount                           | number                | The maximum number of stability retries allowed.                            |
| mainLLMmaxRetryCount                             | number                | The maximum number of retries for the main LLM.                             |
| limitedLLMmaxRetryCount                          | number                | The maximum number of retries for the limited LLM.                          |
| rankingLLMmaxRetryCount                          | number                | The maximum number of retries for the ranking LLM.                          |
| maxTopEntitiesToSearch                           | number                | The maximum number of top entities to search.                               |
| maxTopEntitiesToRender                           | number                | The maximum number of top entities to render.                               |
| maxTopQueriesToSearchPerType                     | number                | The maximum number of top queries to search per type.                       |
| maxTopEvidenceQueriesToSearchPerType             | number                | The maximum number of top evidence queries to search per type.              |
| maxTopRootCauseQueriesToSearchPerType            | number                | The maximum number of top root cause queries to search per type.            |
| maxRootCausePercentOfSearchResultWebPagesToGet   | number                | The maximum percentage of search result web pages to get for root causes.   |
| maxRootCausesToUseForRatingRootCauses            | number                | The maximum number of root causes to use for rating.                        |
| topWebPagesToGetForRefineRootCausesScan          | number                | The number of top web pages to get for refining root causes scan.           |
| mainSearchRetryCount                             | number                | The maximum number of retries for the main search.                          |
| maxDalleRetryCount                               | number                | The maximum number of retries for DALL-E.                                   |
| maxTopWebPagesToGet                              | number                | The maximum number of top web pages to get.                                 |
| maxBingSearchResults                             | number                | The maximum number of Bing search results.                                  |
| maxTopProsConsUsedForRating                      | number                | The maximum number of top pros and cons used for rating.                    |
| maxNumberGeneratedProsConsForSolution            | number                | The maximum number of generated pros and cons for a solution.               |
| minSleepBeforeBrowserRequest                     | number                | The minimum sleep time before a browser request in milliseconds.            |
| maxAdditionalRandomSleepBeforeBrowserRequest     | number                | The maximum additional random sleep time before a browser request in milliseconds. |
| numberOfSearchTypes                              | number                | The number of search types.                                                 |
| webPageNavTimeout                                | number                | The web page navigation timeout in milliseconds.                            |
| subProblemsRankingMinNumberOfMatches             | number                | The minimum number of matches for sub-problems ranking.                     |
| currentUserAgent                                 | string                | The current user agent string.                                              |
| topItemsToKeepForTopicClusterPruning             | number                | The number of top items to keep for topic cluster pruning.                  |
| chances                                          | Object                | An object containing various probabilities used in solution creation.       |
| maxTopSearchQueriesForSolutionCreation           | number                | The maximum number of top search queries for solution creation.             |
| maxPercentOfSolutionsWebPagesToGet               | number                | The maximum percentage of solutions web pages to get.                       |
| limits                                           | Object                | An object containing various limits for vector search results and random selection. |
| enable                                           | Object                | An object containing flags to enable or disable refinement processes.       |
| evolution                                        | Object                | An object containing configurations for the evolution process.              |
| maxPercentOfEloMatched                           | number                | The maximum percentage of ELO matched.                                      |
| minimumNumberOfPairwiseVotesForPopulation        | number                | The minimum number of pairwise votes for population.                        |
| maxNumberOfPairwiseRankingPrompts                | number                | The maximum number of pairwise ranking prompts.                             |
| maxTopSolutionsToCreatePolicies                  | number                | The maximum number of top solutions to create policies.                     |
| maxTopPoliciesToProcess                          | number                | The maximum number of top policies to process.                              |
| maxEvidenceToUseForRatingEvidence                | number                | The maximum evidence to use for rating evidence.                            |
| policyEvidenceFieldTypes                         | string[]              | An array of strings representing policy evidence field types.               |
| rootCauseFieldTypes                              | string[]              | An array of strings representing root cause field types.                    |

## Methods

| Name                     | Parameters            | Return Type | Description                                                                 |
|--------------------------|-----------------------|-------------|-----------------------------------------------------------------------------|
| simplifyEvidenceType     | evidenceType: string  | string      | Simplifies the evidence type string by removing prefixes and suffixes.      |
| simplifyRootCauseType    | rootCauseType: string | string      | Simplifies the root cause type string by removing prefixes and suffixes.    |

## Examples

```typescript
// Example usage of the IEngineConstants class to get the configuration for creating sub-problems
const subProblemsConfig = IEngineConstants.createSubProblemsModel;

// Example usage of the IEngineConstants class to simplify an evidence type string
const simplifiedEvidenceType = IEngineConstants.simplifyEvidenceType("allPossiblePositiveEvidenceIdentifiedInTextContext");
```

Note: The `IEngineBaseAIModelConstants` type is assumed to be defined elsewhere in the codebase and is used here to represent the structure of AI model configurations.