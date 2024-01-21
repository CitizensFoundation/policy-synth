# BaseProcessor

BaseProcessor is an abstract class that extends the Base class and is designed to process jobs with associated memory data in an innovation engine context.

## Properties

| Name                   | Type                                  | Description                                      |
|------------------------|---------------------------------------|--------------------------------------------------|
| memory                 | IEngineInnovationMemoryData           | The memory data associated with the processor.   |
| job                    | Job                                   | The job that the processor is handling.          |
| currentSubProblemIndex | number \| undefined                   | The index of the current sub-problem being processed. |

## Methods

| Name                                  | Parameters                            | Return Type | Description                                                                 |
|---------------------------------------|---------------------------------------|-------------|-----------------------------------------------------------------------------|
| getProCons                            | prosCons: IEngineProCon[] \| undefined | string[]    | Returns an array of descriptions from the provided pros and cons.           |
| process                               |                                       | Promise<void> | Processes the job using the initialized memory. Throws an error if memory is not initialized. |
| lastPopulationIndex                   | subProblemIndex: number               | number      | Returns the index of the last population for a given sub-problem.           |
| renderSubProblem                      | subProblemIndex: number, useProblemAsHeader: boolean | string      | Renders the sub-problem at the given index, optionally using the problem as the header. |
| renderSubProblemSimple                | subProblemIndex: number               | string      | Renders a simplified version of the sub-problem at the given index.         |
| getActiveSolutionsLastPopulation      | subProblemIndex: number               | ISolution[] | Returns the active solutions from the last population of a given sub-problem. |
| getActiveSolutionsFromPopulation      | subProblemIndex: number, populationIndex: number | ISolution[] | Returns the active solutions from a specific population of a given sub-problem. |
| numberOfPopulations                   | subProblemIndex: number               | number      | Returns the number of populations for a given sub-problem.                 |
| renderSubProblems                     |                                       | string      | Renders all sub-problems.                                                  |
| renderEntity                          | subProblemIndex: number, entityIndex: number | string      | Renders the entity at the given index for a specific sub-problem.          |
| renderProblemStatement                |                                       | string      | Renders the problem statement.                                             |
| renderProblemStatementSubProblemsAndEntities | index: number                        | string      | Renders the problem statement along with sub-problems and entities for a given index. |
| renderEntityPosNegReasons             | item: IEngineAffectedEntity           | string      | Renders the positive and negative effects associated with an entity.        |

## Examples

```typescript
// Example usage of BaseProcessor
class CustomProcessor extends BaseProcessor {
  async process() {
    super.process();
    // Custom processing logic
  }
}

// Initialize a job and memory data
const job = new Job();
const memoryData: IEngineInnovationMemoryData = {
  // ... memory data structure
};

// Create an instance of CustomProcessor
const processor = new CustomProcessor(job, memoryData);

// Call process method
processor.process().then(() => {
  console.log('Processing complete.');
}).catch(error => {
  console.error('Processing failed:', error);
});
```