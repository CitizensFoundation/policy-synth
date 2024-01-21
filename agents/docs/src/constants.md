# IEngineConstants

This class contains constants and static methods related to the configuration of AI models, pricing, and operational parameters for an AI engine.

## Properties

| Name                                             | Type    | Description                                                  |
|--------------------------------------------------|---------|--------------------------------------------------------------|
| gpt4InTokenPrice                                 | number  | The price per token for GPT-4 input tokens.                  |
| gpt4OutTokenPrice                                | number  | The price per token for GPT-4 output tokens.                 |
| gpt35_16kInTokenPrice                            | number  | The price per token for GPT-3.5 16k input tokens.            |
| gpt35_16kOutTokenPrice                           | number  | The price per token for GPT-3.5 16k output tokens.           |
| gpt4TotalTokenLimit                              | number  | The total token limit for GPT-4, set to 70,000.              |
| adaInTokenPrice                                  | number  | The price per token for Ada model input tokens.              |
| gpt35_16k_TPM                                    | number  | Transactions per minute for GPT-3.5 16k model.               |
| gpt35_16k_RPM                                    | number  | Requests per minute for GPT-3.5 16k model.                   |
| gpt35_TPM                                        | number  | Transactions per minute for GPT-3.5 model.                   |
| gpt35_RPM                                        | number  | Requests per minute for GPT-3.5 model.                       |
| gpt4_TPM                                         | number  | Transactions per minute for GPT-4 model.                     |
| gpt4_RPM                                         | number  | Requests per minute for GPT-4 model.                         |
| createSubProblemsModel                           | object  | Configuration for the model to create sub-problems.          |
| policiesSeedModel                                | object  | Configuration for the model to seed policies.                |
| analyseExternalSolutionsModel                    | object  | Configuration for the model to analyze external solutions.   |
| createEntitiesModel                              | object  | Configuration for the model to create entities.              |
| topicMapSolutionsModel                           | object  | Configuration for the model to map solutions topics.         |
| createSolutionImagesModel                        | object  | Configuration for the model to create solution images.       |
| createSearchQueriesModel                         | object  | Configuration for the model to create search queries.        |
| createEvidenceSearchQueriesModel                 | object  | Configuration for the model to create evidence search queries. |
| createRootCauseSearchQueriesModel                | object  | Configuration for the model to create root cause search queries. |
| searchQueryRankingsModel                         | object  | Configuration for the model to rank search queries.          |
| searchResultsRankingsModel                       | object  | Configuration for the model to rank search results.          |
| subProblemsRankingsModel                         | object  | Configuration for the model to rank sub-problems.            |
| entitiesRankingsModel                            | object  | Configuration for the model to rank entities.                |
| solutionsRankingsModel                           | object  | Configuration for the model to rank solutions.               |
| prosConsRankingsModel                            | object  | Configuration for the model to rank pros and cons.           |
| getPageAnalysisModel                             | object  | Configuration for the model to analyze pages.                |
| getSolutionsPagesAnalysisModel                   | object  | Configuration for the model to analyze solutions pages.      |
| rankWebSolutionsModel                            | object  | Configuration for the model to rank web solutions.           |
| reduceSubProblemsModel                           | object  | Configuration for the model to reduce sub-problems.          |
| rateWebEvidenceModel                             | object  | Configuration for the model to rate web evidence.            |
| rateWebRootCausesModel                           | object  | Configuration for the model to rate web root causes.         |
| rankWebEvidenceModel                             | object  | Configuration for the model to rank web evidence.            |
| rankWebRootCausesModel                           | object  | Configuration for the model to rank web root causes.         |
| getRefinedEvidenceModel                          | object  | Configuration for the model to get refined evidence.         |
| getRefinedRootCausesModel                        | object  | Configuration for the model to get refined root causes.      |
| reapSolutionsModel                               | object  | Configuration for the model to reap solutions.               |
| groupSolutionsModel                              | object  | Configuration for the model to group solutions.              |
| rateSolutionsModel                               | object  | Configuration for the model to rate solutions.               |
| createSolutionsModel                             | object  | Configuration for the model to create solutions.             |
| evolveSolutionsModel                             | object  | Configuration for the model to evolve solutions.             |
| createProsConsModel                              | object  | Configuration for the model to create pros and cons.         |
| evolutionMutateModel                             | object  | Configuration for the model to mutate in evolution.          |
| evolutionRecombineModel                          | object  | Configuration for the model to recombine in evolution.       |
| validationModel                                  | object  | Configuration for the model to validate.                     |
| getPageCacheExpiration                           | number  | Cache expiration time for pages, set to 6 months.            |
| maxSubProblems                                   | number  | Maximum number of sub-problems.                              |
| maxNumberGeneratedOfEntities                     | number  | Maximum number of entities generated.                        |
| maxStabilityRetryCount                           | number  | Maximum number of stability retries.                         |
| mainLLMmaxRetryCount                             | number  | Maximum number of retries for the main LLM.                  |
| limitedLLMmaxRetryCount                          | number  | Maximum number of retries for the limited LLM.               |
| rankingLLMmaxRetryCount                          | number  | Maximum number of retries for the ranking LLM.               |
| maxTopEntitiesToSearch                           | number  | Maximum number of top entities to search.                    |
| maxTopEntitiesToRender                           | number  | Maximum number of top entities to render.                    |
| maxTopQueriesToSearchPerType                     | number  | Maximum number of top queries to search per type.            |
| maxTopEvidenceQueriesToSearchPerType             | number  | Maximum number of top evidence queries to search per type.   |
| maxTopRootCauseQueriesToSearchPerType            | number  | Maximum number of top root cause queries to search per type. |
| maxRootCausePercentOfSearchResultWebPagesToGet   | number  | Maximum percentage of search result web pages to get for root causes. |
| maxRootCausesToUseForRatingRootCauses            | number  | Maximum number of root causes to use for rating.             |
| topWebPagesToGetForRefineRootCausesScan          | number  | Top web pages to get for refining root causes scan.          |
| mainSearchRetryCount                             | number  | Maximum number of retries for the main search.               |
| maxDalleRetryCount                               | number  | Maximum number of retries for DALL-E.                        |
| maxTopWebPagesToGet                              | number  | Maximum number of top web pages to get.                      |
| maxBingSearchResults                             | number  | Maximum number of Bing search results.                       |
| maxTopProsConsUsedForRating                      | number  | Maximum number of top pros and cons used for rating.         |
| maxNumberGeneratedProsConsForSolution            | number  | Maximum number of generated pros and cons for a solution.    |
| minSleepBeforeBrowserRequest                     | number  | Minimum sleep time before a browser request.                 |
| maxAdditionalRandomSleepBeforeBrowserRequest     | number  | Maximum additional random sleep time before a browser request. |
| numberOfSearchTypes                              | number  | Number of search types.                                      |
| webPageNavTimeout                                | number  | Web page navigation timeout.                                 |
| subProblemsRankingMinNumberOfMatches             | number  | Minimum number of matches for sub-problems ranking.          |
| currentUserAgent                                 | string  | Current user agent string.                                   |
| topItemsToKeepForTopicClusterPruning             | number  | Top items to keep for topic cluster pruning.                 |
| chances                                          | object  | Probabilities for various actions in solution creation.      |
| maxTopSearchQueriesForSolutionCreation           | number  | Maximum number of top search queries for solution creation.  |
| maxPercentOfSolutionsWebPagesToGet               | number  | Maximum percentage of solutions web pages to get.            |
| limits                                           | object  | Limits for various actions in solution creation.             |
| enable                                           | object  | Flags to enable or disable certain refinements.              |
| evolution                                        | object  | Parameters for the evolution process.                        |
| maxPercentOfEloMatched                           | number  | Maximum percentage of ELO matched.                           |
| minimumNumberOfPairwiseVotesForPopulation        | number  | Minimum number of pairwise votes for population.             |
| maxNumberOfPairwiseRankingPrompts                | number  | Maximum number of pairwise ranking prompts.                  |
| maxTopSolutionsToCreatePolicies                  | number  | Maximum number of top solutions to create policies.          |
| maxTopPoliciesToProcess                          | number  | Maximum number of top policies to process.                   |
| maxEvidenceToUseForRatingEvidence                | number  | Maximum evidence to use for rating evidence.                 |
| policyEvidenceFieldTypes                         | string[]| Types of evidence fields for policies.                       |
| rootCauseFieldTypes                              | string[]| Types of root cause fields.                                  |

## Methods

| Name                     | Parameters                | Return Type | Description                                      |
|--------------------------|---------------------------|-------------|--------------------------------------------------|
| simplifyEvidenceType     | evidenceType: string      | string      | Simplifies the evidence type string.             |
| simplifyRootCauseType    | rootCauseType: string     | string      | Simplifies the root cause type string.           |

## Examples

```typescript
// Example usage of simplifying evidence type
const simplifiedEvidenceType = IEngineConstants.simplifyEvidenceType("allPossiblePositiveEvidenceIdentifiedInTextContext");

// Example usage of simplifying root cause type
const simplifiedRootCauseType = IEngineConstants.simplifyRootCauseType("allPossibleEconomicRootCausesIdentifiedInTextContext");
```