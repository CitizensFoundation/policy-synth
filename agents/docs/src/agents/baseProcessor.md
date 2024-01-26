# BaseProlemSolvingAgent

BaseProlemSolvingAgent is an abstract class that extends the PolicySynthAgentBase class. It is responsible for processing data related to a job and maintaining a memory state for the engine's innovation process.

## Properties

| Name                   | Type                             | Description                                      |
|------------------------|----------------------------------|--------------------------------------------------|
| memory                 | IEngineInnovationMemoryData      | The memory state of the engine's innovation process. |
| job                    | Job                              | The job instance associated with the processor.  |
| currentSubProblemIndex | number \| undefined              | The index of the current sub-problem being processed. |

## Methods

| Name                                  | Parameters                        | Return Type | Description                                                                 |
|---------------------------------------|-----------------------------------|-------------|-----------------------------------------------------------------------------|
| getProCons                            | prosCons: IEngineProCon[] \| undefined | Array       | Returns an array of descriptions from the provided pros and cons.           |
| process                               | -                                 | Promise<void> | Processes the job. Throws an error if memory is not initialized.            |
| lastPopulationIndex                   | subProblemIndex: number           | number      | Returns the index of the last population for a given sub-problem.           |
| renderSubProblem                      | subProblemIndex: number, useProblemAsHeader: boolean | string      | Renders a sub-problem as a string, optionally using the problem as a header. |
| renderSubProblemSimple                | subProblemIndex: number           | string      | Renders a simplified version of a sub-problem as a string.                  |
| getActiveSolutionsLastPopulation      | subProblemIndex: number           | Array       | Returns the active solutions from the last population of a sub-problem.     |
| getActiveSolutionsFromPopulation      | subProblemIndex: number, populationIndex: number | Array       | Returns the active solutions from a specific population of a sub-problem.   |
| numberOfPopulations                   | subProblemIndex: number           | number      | Returns the number of populations for a given sub-problem.                  |
| renderSubProblems                     | -                                 | string      | Renders all sub-problems as a string.                                       |
| renderEntity                          | subProblemIndex: number, entityIndex: number | string      | Renders an entity associated with a sub-problem as a string.                |
| renderProblemStatement                | -                                 | string      | Renders the problem statement as a string.                                  |
| renderProblemStatementSubProblemsAndEntities | index: number                     | string      | Renders the problem statement, sub-problems, and entities as a string.      |
| renderEntityPosNegReasons             | item: IEngineAffectedEntity       | string      | Renders the positive and negative effects of an entity as a string.         |

## Examples

```typescript
// Example usage of BaseProlemSolvingAgent
class MyProcessor extends BaseProlemSolvingAgent {
  async process() {
    // Custom processing logic
    console.log(this.renderProblemStatement());
  }
}

const job = new Job(); // Assuming Job is properly instantiated
const memory = {}; // Assuming memory is properly instantiated with IEngineInnovationMemoryData structure
const processor = new MyProcessor(job, memory);

processor.process().then(() => {
  // Processing is complete
}).catch((error) => {
  console.error(error);
});
```