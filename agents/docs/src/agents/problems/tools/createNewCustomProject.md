# IEngineInnovationMemoryData

This interface represents the structure of the data stored in memory for an engine innovation project.

## Properties

| Name                | Type                          | Description                                       |
|---------------------|-------------------------------|---------------------------------------------------|
| redisKey            | string                        | The key used to store the project data in Redis.  |
| groupId             | number                        | The group ID associated with the project.         |
| communityId         | number                        | The community ID associated with the project.     |
| domainId            | number                        | The domain ID associated with the project.        |
| stage               | string                        | The current stage of the project.                 |
| currentStage        | string                        | The current stage of the project.                 |
| stages              | object                        | An object containing the stages of the project.   |
| timeStart           | number                        | The timestamp when the project was started.       |
| totalCost           | number                        | The total cost associated with the project.       |
| customInstructions  | object                        | Custom instructions for the project, if any.      |
| problemStatement    | IProblemStatement             | The problem statement associated with the project.|
| subProblems         | ISubProblem[]                 | An array of sub-problems related to the project.  |
| currentStageData    | IEngineInnovationMemoryData\|undefined | Data specific to the current stage of the project.|

## Methods

No methods are documented for this interface.

## Examples

```typescript
// Example usage of the IEngineInnovationMemoryData interface
const project: IEngineInnovationMemoryData = {
  redisKey: 'st_mem:12345:id',
  groupId: 12345,
  communityId: 2,
  domainId: 1,
  stage: 'create-sub-problems',
  currentStage: 'create-sub-problems',
  stages: {
    // ...stages object with stage details...
  },
  timeStart: Date.now(),
  totalCost: 0,
  customInstructions: {
    // ...custom instructions if any...
  },
  problemStatement: {
    description: 'A brief description of the problem statement',
    searchQueries: {
      general: [],
      scientific: [],
      news: [],
      openData: [],
    },
    searchResults: {
      pages: {
        general: [],
        scientific: [],
        news: [],
        openData: [],
      }
    },
  },
  subProblems: [],
  currentStageData: undefined,
};
```

# IProblemStatement

This interface represents the structure of the problem statement for an engine innovation project.

## Properties

| Name           | Type              | Description                                       |
|----------------|-------------------|---------------------------------------------------|
| description    | string            | The description of the problem statement.         |
| searchQueries  | ISearchQueries    | The search queries associated with the problem.   |
| searchResults  | ISearchResults    | The search results associated with the problem.   |

## Methods

No methods are documented for this interface.

## Examples

```typescript
// Example usage of the IProblemStatement interface
const problemStatement: IProblemStatement = {
  description: 'A detailed description of the problem statement',
  searchQueries: {
    general: ['query1', 'query2'],
    scientific: ['query3', 'query4'],
    news: ['query5', 'query6'],
    openData: ['query7', 'query8'],
  },
  searchResults: {
    pages: {
      general: ['page1', 'page2'],
      scientific: ['page3', 'page4'],
      news: ['page5', 'page6'],
      openData: ['page7', 'page8'],
    }
  },
};
```

# ISearchQueries

This interface represents the search queries used in the problem statement of an engine innovation project.

## Properties

| Name           | Type              | Description                                       |
|----------------|-------------------|---------------------------------------------------|
| general        | string[]          | General search queries.                           |
| scientific     | string[]          | Scientific search queries.                        |
| news           | string[]          | News search queries.                              |
| openData       | string[]          | Open data search queries.                         |

## Methods

No methods are documented for this interface.

## Examples

```typescript
// Example usage of the ISearchQueries interface
const searchQueries: ISearchQueries = {
  general: ['general query1', 'general query2'],
  scientific: ['scientific query1', 'scientific query2'],
  news: ['news query1', 'news query2'],
  openData: ['open data query1', 'open data query2'],
};
```

# ISearchResults

This interface represents the search results for the problem statement of an engine innovation project.

## Properties

| Name           | Type              | Description                                       |
|----------------|-------------------|---------------------------------------------------|
| pages          | IPages            | Pages associated with the search results.         |

## Methods

No methods are documented for this interface.

## Examples

```typescript
// Example usage of the ISearchResults interface
const searchResults: ISearchResults = {
  pages: {
    general: ['general page1', 'general page2'],
    scientific: ['scientific page1', 'scientific page2'],
    news: ['news page1', 'news page2'],
    openData: ['open data page1', 'open data page2'],
  },
};
```

# IPages

This interface represents the pages associated with the search results of an engine innovation project.

## Properties

| Name           | Type              | Description                                       |
|----------------|-------------------|---------------------------------------------------|
| general        | string[]          | General pages.                                    |
| scientific     | string[]          | Scientific pages.                                 |
| news           | string[]          | News pages.                                       |
| openData       | string[]          | Open data pages.                                  |

## Methods

No methods are documented for this interface.

## Examples

```typescript
// Example usage of the IPages interface
const pages: IPages = {
  general: ['general page1', 'general page2'],
  scientific: ['scientific page1', 'scientific page2'],
  news: ['news page1', 'news page2'],
  openData: ['open data page1', 'open data page2'],
};
```

# ISubProblem

This interface represents a sub-problem associated with an engine innovation project.

## Properties

| Name           | Type              | Description                                       |
|----------------|-------------------|---------------------------------------------------|
| // Properties of sub-problem are not provided in the input |

## Methods

No methods are documented for this interface.

## Examples

```typescript
// Example usage of the ISubProblem interface
const subProblem: ISubProblem = {
  // Properties of sub-problem would be defined here
};
```

Please note that the actual properties and methods for `ISubProblem`, `ISearchQueries`, `ISearchResults`, and `IPages` interfaces are not provided in the input and should be defined according to the specific requirements of the project.