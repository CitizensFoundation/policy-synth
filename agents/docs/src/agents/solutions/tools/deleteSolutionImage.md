# ioredis

The `ioredis` module is a robust, performance-focused, and full-featured Redis client for Node.js.

## Properties

No public properties are documented here as `ioredis` is an external module and its properties are not exposed in the provided code snippet.

## Methods

No public methods are documented here as `ioredis` is an external module and its methods are not exposed in the provided code snippet.

# fs

The `fs` module is a file system module that includes promisified methods for interacting with the file system in a way that returns promises.

## Properties

No public properties are documented here as `fs` is an external module and its properties are not exposed in the provided code snippet.

## Methods

No public methods are documented here as `fs` is an external module and its methods are not exposed in the provided code snippet.

# IEngineInnovationMemoryData

This interface represents the structure of the memory data used in the application.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| subProblems   | `SubProblem[]` | An array of sub-problems within the project. |

## SubProblem

This type represents a sub-problem within the project.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| solutions     | `Solutions` | The solutions associated with the sub-problem. |

## Solutions

This type represents the solutions for a sub-problem.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| populations   | `Population[][]` | A two-dimensional array representing generations of solution populations. |

## Population

This type represents a population within a generation of solutions.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| title         | `string` | The title of the solution. |
| imageUrl      | `string` | The URL of the solution's image. |
| imagePrompt   | `string` | The prompt used to generate the solution's image. |

## Examples

```typescript
// Example usage of loading project data and updating a solution's image properties
const projectId = "example_project_id";
const subProblemIndex = 0;
const generationIndex = 22;
const title = "Enhancing Public Faith Through Accountability and Transparency in Government";

const loadProject = async (): Promise<void> => {
  if (projectId) {
    const output = await redis.get(`st_mem:${projectId}:id`);
    const memory = JSON.parse(output!) as IEngineInnovationMemoryData;

    for (let i = 0; i < memory.subProblems[subProblemIndex].solutions.populations[generationIndex].length; i++) {
      if (memory.subProblems[subProblemIndex].solutions.populations[generationIndex][i].title === title) {
        memory.subProblems[subProblemIndex].solutions.populations[generationIndex][i].imageUrl = "";
        memory.subProblems[subProblemIndex].solutions.populations[generationIndex][i].imagePrompt = "";
        console.log(`Solution image url has been deleted for ${title}`);
        break;
      }
    }
    await redis.set(`st_mem:${projectId}:id`, JSON.stringify(memory));
  } else {
    console.log('No project id provided');
  }
};

loadProject().catch(console.error);
```

Please note that the actual structure of `IEngineInnovationMemoryData`, `SubProblem`, `Solutions`, and `Population` are not fully detailed here as the provided code snippet does not include their definitions. The properties listed are inferred from the usage within the code.