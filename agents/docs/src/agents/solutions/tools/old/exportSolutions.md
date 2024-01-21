# IEngineInnovationMemoryData

Represents the memory data structure for engine innovation.

## Properties

| Name             | Type                                      | Description                           |
|------------------|-------------------------------------------|---------------------------------------|
| problemStatement | IEngineProblemStatement                   | The problem statement details.        |
| subProblems      | IEngineSubProblem[]                       | An array of sub-problems.             |

## Methods

No methods are defined for this type.

# IEngineProblemStatement

Represents the problem statement details.

## Properties

| Name          | Type                             | Description                           |
|---------------|----------------------------------|---------------------------------------|
| description   | string                           | The description of the problem.       |
| searchQueries | IEngineSearchQueries             | The search queries related to the problem. |
| searchResults | IEngineSearchResults             | The search results related to the problem. |

## Methods

No methods are defined for this type.

# IEngineSearchQueries

Represents the search queries related to the problem.

## Properties

| Name          | Type                             | Description                           |
|---------------|----------------------------------|---------------------------------------|
| general       | string[]                         | General search queries.               |

## Methods

No methods are defined for this type.

# IEngineSearchResults

Represents the search results related to the problem.

## Properties

| Name          | Type                             | Description                           |
|---------------|----------------------------------|---------------------------------------|
| pages         | IEngineSearchResultPages         | The pages of search results.          |

## Methods

No methods are defined for this type.

# IEngineSearchResultPages

Represents the pages of search results.

## Properties

| Name          | Type                             | Description                           |
|---------------|----------------------------------|---------------------------------------|
| general       | IEngineSearchResultItem[]        | An array of general search result items. |

## Methods

No methods are defined for this type.

# IEngineSearchResultItem

Represents an individual search result item.

## Properties

| Name          | Type                             | Description                           |
|---------------|----------------------------------|---------------------------------------|
| title         | string                           | The title of the search result.       |
| url           | string                           | The URL of the search result.         |

## Methods

No methods are defined for this type.

# IEngineSubProblem

Represents a sub-problem.

## Properties

| Name          | Type                             | Description                           |
|---------------|----------------------------------|---------------------------------------|
| title         | string                           | The title of the sub-problem.         |
| description   | string                           | The description of the sub-problem.   |
| eloRating     | number                           | The ELO rating of the sub-problem.    |
| solutions     | IEngineSolutionPopulation       | The solutions for the sub-problem.    |

## Methods

No methods are defined for this type.

# IEngineSolutionPopulation

Represents the solution population for a sub-problem.

## Properties

| Name          | Type                             | Description                           |
|---------------|----------------------------------|---------------------------------------|
| populations   | IEngineSolution[][]              | An array of solution arrays.          |

## Methods

No methods are defined for this type.

# IEngineSolution

Represents a solution.

## Properties

| Name          | Type                             | Description                           |
|---------------|----------------------------------|---------------------------------------|
| title         | string                           | The title of the solution.            |
| description   | string                           | The description of the solution.      |
| eloRating     | number                           | The ELO rating of the solution.       |
| pros          | IEngineProCon[]                  | An array of pros for the solution.    |
| cons          | IEngineProCon[]                  | An array of cons for the solution.    |

## Methods

No methods are defined for this type.

# IEngineProCon

Represents a pro or con.

## Properties

| Name          | Type                             | Description                           |
|---------------|----------------------------------|---------------------------------------|
| description   | string                           | The description of the pro or con.    |
| eloRating     | number                           | The ELO rating of the pro or con.     |

## Methods

No methods are defined for this type.

# IEngineConstants

Represents the engine constants.

## Properties

| Name                             | Type   | Description                                   |
|----------------------------------|--------|-----------------------------------------------|
| maxSubProblems                   | number | The maximum number of sub-problems.           |
| maxTopProsConsUsedForRating      | number | The maximum number of pros and cons used for rating. |

## Methods

No methods are defined for this type.

## Examples

```typescript
// Example usage of reading memory data and generating HTML content
const memoryData = fs.readFileSync(filePath, "utf-8");
const memory = JSON.parse(memoryData) as IEngineInnovationMemoryData;
// ... rest of the code to generate HTML ...
```

Please note that the above example is a simplified usage scenario. The actual code provided includes additional logic for handling file paths, generating HTML content, and writing to a file.