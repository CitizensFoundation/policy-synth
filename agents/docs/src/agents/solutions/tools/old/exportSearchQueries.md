# IEngineInnovationMemoryData

Represents the memory data structure for engine innovation.

## Properties

| Name             | Type                          | Description                                   |
|------------------|-------------------------------|-----------------------------------------------|
| problemStatement | IProblemStatement             | The main problem statement.                   |
| subProblems      | ISubProblem[]                 | An array of sub-problems.                     |

## Methods

| Name                | Parameters                  | Return Type | Description                                 |
|---------------------|-----------------------------|-------------|---------------------------------------------|
| formatElo           | elo: number \| undefined    | number      | Formats the ELO rating to an integer.      |
| formatSearchQueries | searchQueries: IEngineSearchQueries \| undefined | string | Formats the search queries into HTML string. |

## Examples

```typescript
// Example usage of formatting ELO
const formattedElo = formatElo(memory.subProblems[0].eloRating);

// Example usage of formatting search queries
const searchQueriesHtml = formatSearchQueries(memory.problemStatement.searchQueries);
```

# IProblemStatement

Represents a problem statement with a description and associated search queries.

## Properties

| Name          | Type                | Description               |
|---------------|---------------------|---------------------------|
| description   | string              | The description of the problem statement. |
| searchQueries | IEngineSearchQueries | The search queries related to the problem statement. |

## Methods

No methods.

## Examples

```typescript
// Example usage of IProblemStatement
const problemStatement: IProblemStatement = {
  description: "How to improve AI algorithms?",
  searchQueries: {
    general: ["AI improvements", "machine learning enhancements"],
    scientific: ["latest AI research", "AI algorithm advancements"],
    news: ["AI breakthrough news", "recent AI developments"],
    openData: ["AI datasets", "machine learning data sources"]
  }
};
```

# ISubProblem

Represents a sub-problem with a title, description, ELO rating, and associated search queries.

## Properties

| Name          | Type                | Description               |
|---------------|---------------------|---------------------------|
| title         | string              | The title of the sub-problem. |
| description   | string              | The description of the sub-problem. |
| eloRating     | number \| undefined | The ELO rating of the sub-problem. |
| searchQueries | IEngineSearchQueries | The search queries related to the sub-problem. |
| entities      | IEntity[]           | The entities associated with the sub-problem. |

## Methods

No methods.

## Examples

```typescript
// Example usage of ISubProblem
const subProblem: ISubProblem = {
  title: "Optimizing neural networks",
  description: "Explore methods to optimize neural network performance.",
  eloRating: 1500,
  searchQueries: {
    general: ["neural network optimization techniques"],
    scientific: ["neural network efficiency research"],
    news: [],
    openData: ["neural network datasets"]
  },
  entities: [
    // ...entities
  ]
};
```

# IEntity

Represents an entity with a name, ELO rating, positive and negative effects, and associated search queries.

## Properties

| Name             | Type                | Description               |
|------------------|---------------------|---------------------------|
| name             | string              | The name of the entity.   |
| eloRating        | number \| undefined | The ELO rating of the entity. |
| positiveEffects  | string[] \| undefined | The positive effects of the entity. |
| negativeEffects  | string[] \| undefined | The negative effects of the entity. |
| searchQueries    | IEngineSearchQueries | The search queries related to the entity. |

## Methods

No methods.

## Examples

```typescript
// Example usage of IEntity
const entity: IEntity = {
  name: "Convolutional Neural Network",
  eloRating: 1600,
  positiveEffects: ["Feature recognition", "Image classification"],
  negativeEffects: ["High computational cost"],
  searchQueries: {
    general: ["CNN applications"],
    scientific: ["CNN efficiency studies"],
    news: ["CNN breakthroughs"],
    openData: ["Image datasets for CNN"]
  }
};
```

# IEngineSearchQueries

Represents a collection of search queries categorized by type.

## Properties

| Name       | Type     | Description               |
|------------|----------|---------------------------|
| general    | string[] | General search queries.   |
| scientific | string[] | Scientific search queries.|
| news       | string[] | News search queries.      |
| openData   | string[] | Open data search queries. |

## Methods

No methods.

## Examples

```typescript
// Example usage of IEngineSearchQueries
const searchQueries: IEngineSearchQueries = {
  general: ["general query 1", "general query 2"],
  scientific: ["scientific query 1", "scientific query 2"],
  news: ["news query 1", "news query 2"],
  openData: ["open data query 1", "open data query 2"]
};
```

Please note that the above documentation is based on the provided TypeScript code snippet and assumes the existence of certain types such as `IProblemStatement`, `ISubProblem`, `IEntity`, and `IEngineSearchQueries`. If these types are not defined elsewhere in the codebase, they will need to be created and documented accordingly.