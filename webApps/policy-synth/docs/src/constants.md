# IEngineConstants

The `IEngineConstants` class provides a collection of constants and static methods related to the configuration of AI models, pricing, and operational parameters for an AI engine.

## Properties

| Name                                             | Type                  | Description                                                                 |
|--------------------------------------------------|-----------------------|-----------------------------------------------------------------------------|
| createSubProblemsModel                           | IEngineBaseAIModelConstants | Configuration constants for the sub-problems model.                         |
| policiesSeedModel                                | IEngineBaseAIModelConstants | Configuration constants for the policies seed model.                        |
| analyseExternalSolutionsModel                    | IEngineBaseAIModelConstants | Configuration constants for the external solutions analysis model.          |
| createEntitiesModel                              | IEngineBaseAIModelConstants | Configuration constants for the entities creation model.                    |
| topicMapSolutionsModel                           | object                | Contains inTokenCostsUSD for the topic map solutions model.                 |
| createSolutionImagesModel                        | IEngineBaseAIModelConstants | Configuration constants for the solution images creation model.             |
| createSearchQueriesModel                         | IEngineBaseAIModelConstants | Configuration constants for the search queries creation model.              |
| createEvidenceSearchQueriesModel                 | IEngineBaseAIModelConstants | Configuration constants for the evidence search queries creation model.     |
| createRootCauseSearchQueriesModel                | IEngineBaseAIModelConstants | Configuration constants for the root cause search queries creation model.   |
| searchQueryRankingsModel                         | IEngineBaseAIModelConstants | Configuration constants for the search query rankings model.                |
| searchResultsRankingsModel                       | IEngineBaseAIModelConstants | Configuration constants for the search results rankings model.              |
| subProblemsRankingsModel                         | IEngineBaseAIModelConstants | Configuration constants for the sub-problems rankings model.                |
| entitiesRankingsModel                            | IEngineBaseAIModelConstants | Configuration constants for the entities rankings model.                    |
| solutionsRankingsModel                           | IEngineBaseAIModelConstants | Configuration constants for the solutions rankings model.                   |
| prosConsRankingsModel                            | IEngineBaseAIModelConstants | Configuration constants for the pros and cons rankings model.               |
| getPageAnalysisModel                             | IEngineBaseAIModelConstants | Configuration constants for the page analysis model.                        |
| getSolutionsPagesAnalysisModel                   | IEngineBaseAIModelConstants | Configuration constants for the solutions pages analysis model.             |
| rankWebSolutionsModel                            | IEngineBaseAIModelConstants | Configuration constants for the web solutions ranking model.                |
| reduceSubProblemsModel                           | IEngineBaseAIModelConstants | Configuration constants for the sub-problems reduction model.               |
| rateWebEvidenceModel                             | IEngineBaseAIModelConstants | Configuration constants for the web evidence rating model.                  |
| rateWebRootCausesModel                           | IEngineBaseAIModelConstants | Configuration constants for the web root causes rating model.               |
| rankWebEvidenceModel                             | IEngineBaseAIModelConstants | Configuration constants for the web evidence ranking model.                 |
| rankWebRootCausesModel                           | IEngineBaseAIModelConstants | Configuration constants for the web root causes ranking model.              |
| getRefinedEvidenceModel                          | IEngineBaseAIModelConstants | Configuration constants for the refined evidence model.                     |
| getRefinedRootCausesModel                        | IEngineBaseAIModelConstants | Configuration constants for the refined root causes model.                  |
| reapSolutionsModel                               | IEngineBaseAIModelConstants | Configuration constants for the solutions reaping model.                    |
| groupSolutionsModel                              | IEngineBaseAIModelConstants | Configuration constants for the solutions grouping model.                   |
| rateSolutionsModel                               | IEngineBaseAIModelConstants | Configuration constants for the solutions rating model.                     |
| createSolutionsModel                             | IEngineBaseAIModelConstants | Configuration constants for the solutions creation model.                   |
| evolveSolutionsModel                             | IEngineBaseAIModelConstants | Configuration constants for the solutions evolution model.                  |
| createProsConsModel                              | IEngineBaseAIModelConstants | Configuration constants for the pros and cons creation model.               |
| evolutionMutateModel                             | IEngineBaseAIModelConstants | Configuration constants for the evolution mutation model.                   |
| evolutionRecombineModel                          | IEngineBaseAIModelConstants | Configuration constants for the evolution recombination model.              |
| validationModel                                  | IEngineBaseAIModelConstants | Configuration constants for the validation model.                           |
| getPageCacheExpiration                           | number                | Cache expiration time for page analysis in seconds.                         |
| maxSubProblems                                   | number                | Maximum number of sub-problems allowed.                                     |
| maxNumberGeneratedOfEntities                     | number                | Maximum number of entities that can be generated.                           |
| maxStabilityRetryCount                           | number                | Maximum number of stability retries.                                        |
| mainLLMmaxRetryCount                             | number                | Maximum number of retries for the main LLM.                                 |
| limitedLLMmaxRetryCount                          | number                | Maximum number of retries for the limited LLM.                              |
| rankingLLMmaxRetryCount                          | number                | Maximum number of retries for the ranking LLM.                              |
| maxTopEntitiesToSearch                           | number                | Maximum number of top entities to search.                                   |
| maxTopEntitiesToRender                           | number                | Maximum number of top entities to render.                                   |
| maxTopQueriesToSearchPerType                     | number                | Maximum number of top queries to search per type.                           |
| maxTopEvidenceQueriesToSearchPerType             | number                | Maximum number of top evidence queries to search per type.                  |
| maxTopRootCauseQueriesToSearchPerType            | number                | Maximum number of top root cause queries to search per type.                |
| maxRootCausePercentOfSearchResultWebPagesToGet   | number                | Maximum percentage of search result web pages to get for root causes.       |
| maxRootCausesToUseForRatingRootCauses            | number                | Maximum number of root causes to use for rating.                            |
| topWebPagesToGetForRefineRootCausesScan          | number                | Number of top web pages to get for refining root causes scan.               |
| mainSearchRetryCount                             | number                | Maximum number of retries for the main search.                              |
| maxDalleRetryCount                               | number                | Maximum number of retries for DALL-E.                                       |
| maxTopWebPagesToGet                              | number                | Maximum number of top web pages to get.                                     |
| maxBingSearchResults                             | number                | Maximum number of Bing search results.                                      |
| maxTopProsConsUsedForRating                      | number                | Maximum number of top pros and cons used for rating.                        |
| maxNumberGeneratedProsConsForSolution            | number                | Maximum number of generated pros and cons for a solution.                   |
| minSleepBeforeBrowserRequest                     | number                | Minimum sleep time before a browser request in milliseconds.                |
| maxAdditionalRandomSleepBeforeBrowserRequest     | number                | Maximum additional random sleep time before a browser request in milliseconds. |
| numberOfSearchTypes                              | number                | Number of search types.                                                     |
| webPageNavTimeout                                | number                | Web page navigation timeout in milliseconds.                                |
| subProblemsRankingMinNumberOfMatches             | number                | Minimum number of matches for sub-problems ranking.                         |
| currentUserAgent                                 | string                | Current user agent string.                                                  |
| topItemsToKeepForTopicClusterPruning             | number                | Number of top items to keep for topic cluster pruning.                      |
| chances                                          | object                | Probabilities and chances for various operations in solution creation.      |
| maxTopSearchQueriesForSolutionCreation           | number                | Maximum number of top search queries for solution creation.                 |
| maxPercentOfSolutionsWebPagesToGet               | number                | Maximum percentage of solutions web pages to get.                           |
| limits                                           | object                | Limits for various operations in the AI engine.                             |
| enable                                           | object                | Flags to enable or disable certain refinements.                             |
| evolution                                        | object                | Parameters for the evolution process.                                       |
| maxPercentOfEloMatched                           | number                | Maximum percentage of ELO matched.                                          |
| minimumNumberOfPairwiseVotesForPopulation        | number                | Minimum number of pairwise votes for population.                            |
| maxNumberOfPairwiseRankingPrompts                | number                | Maximum number of pairwise ranking prompts.                                 |
| maxTopSolutionsToCreatePolicies                  | number                | Maximum number of top solutions to create policies.                         |
| maxTopPoliciesToProcess                          | number                | Maximum number of top policies to process.                                  |
| maxEvidenceToUseForRatingEvidence                | number                | Maximum evidence to use for rating evidence.                                |
| policyEvidenceFieldTypes                         | string[]              | Array of policy evidence field types.                                       |
| rootCauseFieldTypes                              | string[]              | Array of root cause field types.                                            |

## Methods

| Name                     | Parameters        | Return Type | Description                                                                 |
|--------------------------|-------------------|-------------|-----------------------------------------------------------------------------|
| simplifyEvidenceType     | evidenceType: string | string      | Simplifies the evidence type string by removing prefixes and suffixes.       |
| simplifyRootCauseType    | rootCauseType: string | string      | Simplifies the root cause type string by removing prefixes and suffixes.     |

## Examples

```typescript
// Example usage of simplifying evidence type
const simplifiedEvidenceType = IEngineConstants.simplifyEvidenceType("allPossiblePositiveEvidenceIdentifiedInTextContext");
console.log(simplifiedEvidenceType); // Outputs: positiveEvidence

// Example usage of simplifying root cause type
const simplifiedRootCauseType = IEngineConstants.simplifyRootCauseType("allPossibleEconomicRootCausesIdentifiedInTextContext");
console.log(simplifiedRootCauseType); // Outputs: economicRootCause
```