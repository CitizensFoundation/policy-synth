# IEngineInnovationMemoryData

This interface represents the memory data structure used to store and manage custom instructions, problem statements, sub-problem client colors, and other related information for different projects.

## Properties

| Name                      | Type                          | Description                                                                 |
|---------------------------|-------------------------------|-----------------------------------------------------------------------------|
| customInstructions        | `CustomInstructions`          | Custom instructions for creating, ranking, and rating solutions.            |
| problemStatement          | `ProblemStatement`            | Description of the main problem statement for the project.                   |
| subProblemClientColors    | `string[]`                    | Array of color codes representing different sub-problems.                    |
| subProblemColors          | `string[]`                    | Array of color names representing different sub-problems.                    |

## Methods

| Name             | Parameters                        | Return Type | Description                                                                 |
|------------------|-----------------------------------|-------------|-----------------------------------------------------------------------------|
| setupProjectOne  | memory: IEngineInnovationMemoryData | `void`      | Sets up custom instructions and other configurations for project one.       |
| setupProjectTwo  | memory: IEngineInnovationMemoryData | `void`      | Sets up custom instructions and other configurations for project two.       |
| setupProjectThree| memory: IEngineInnovationMemoryData | `void`      | Sets up custom instructions and other configurations for project three.     |
| setupProjectFour | memory: IEngineInnovationMemoryData | `void`      | Sets up custom instructions and other configurations for project four.      |
| setupProjectFive | memory: IEngineInnovationMemoryData | `void`      | Sets up custom instructions and other configurations for project five.      |
| setupProjectSix  | memory: IEngineInnovationMemoryData | `void`      | Sets up custom instructions and other configurations for project six.       |

## Examples

```typescript
// Example usage of setting up project memory data
const projectId = "1";
const memory: IEngineInnovationMemoryData = {
  customInstructions: {},
  problemStatement: { description: "" },
  subProblemClientColors: [],
  subProblemColors: []
};

if (projectId == "1") {
  setupProjectOne(memory);
} else if (projectId == "2") {
  setupProjectTwo(memory);
  // ... other project setups
}
```

# CustomInstructions

This type represents the structure for custom instructions used within the `IEngineInnovationMemoryData`.

## Properties

| Name                          | Type   | Description                                                                 |
|-------------------------------|--------|-----------------------------------------------------------------------------|
| createSolutions               | `string` | Instructions for creating solutions.                                        |
| rankSolutions                 | `string` | Instructions for ranking solutions.                                         |
| rateSolutionsJsonFormat       | `string` | Instructions for rating solutions in JSON format.                           |
| reapSolutions                 | `string` | Instructions for reaping solutions.                                         |
| rankSubProblems               | `string` | Instructions for ranking sub-problems.                                      |

## Examples

```typescript
// Example usage of custom instructions within memory data
const memory: IEngineInnovationMemoryData = {
  customInstructions: {
    createSolutions: "Instructions for creating solutions.",
    rankSolutions: "Instructions for ranking solutions.",
    rateSolutionsJsonFormat: "Instructions for rating solutions in JSON format.",
    reapSolutions: "Instructions for reaping solutions.",
    rankSubProblems: "Instructions for ranking sub-problems."
  },
  // ... other properties
};
```

# ProblemStatement

This type represents the structure for the problem statement used within the `IEngineInnovationMemoryData`.

## Properties

| Name          | Type     | Description                       |
|---------------|----------|-----------------------------------|
| description   | `string` | Description of the problem statement. |

## Examples

```typescript
// Example usage of problem statement within memory data
const memory: IEngineInnovationMemoryData = {
  problemStatement: {
    description: "Description of the main problem statement for the project."
  },
  // ... other properties
};
```

Note: The provided TypeScript code is a script that sets up project-specific memory data based on the provided project ID. It uses Redis to store and retrieve the memory data. The script also includes a series of setup functions for different projects, each tailoring the memory data with specific instructions and configurations.