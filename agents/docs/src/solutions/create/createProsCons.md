# CreateProsConsProcessor

This class extends `BaseProblemSolvingAgent` to create pros and cons for solutions to subproblems. It interacts with a language model to generate and refine pros and cons lists, ensuring they are clear, consistent, and directly applicable to the solutions.

## Properties

No properties are explicitly defined in this class beyond those inherited from `BaseProblemSolvingAgent`.

## Methods

| Name                  | Parameters                                                                 | Return Type                        | Description                                                                                   |
|-----------------------|----------------------------------------------------------------------------|------------------------------------|-----------------------------------------------------------------------------------------------|
| renderCurrentSolution | solution: IEngineSolution                                                  | string                             | Renders the current solution's details as a string.                                           |
| renderRefinePrompt    | prosOrCons: string, results: string[], subProblemIndex: number, solution: IEngineSolution | Promise<SystemMessage[] \| HumanMessage[]> | Prepares messages for refining pros or cons of a solution.                                    |
| renderCreatePrompt    | prosOrCons: string, subProblemIndex: number, solution: IEngineSolution     | Promise<SystemMessage[] \| HumanMessage[]> | Prepares messages for creating pros or cons of a solution.                                    |
| createProsCons        |                                                                            | Promise<void>                      | Creates pros and cons for all solutions to subproblems.                                       |
| process               |                                                                            | Promise<void>                      | Overrides the `process` method from `BaseProblemSolvingAgent` to initiate the pros and cons creation process. |

## Example

```javascript
// Example usage of CreateProsConsProcessor
import { CreateProsConsProcessor } from '@policysynth/agents/solutions/create/createProsCons.js';
import { IEngineSolution } from 'path/to/IEngineSolution';
import { IEngineConstants } from '@policysynth/agents/constants.js';

const processor = new CreateProsConsProcessor();

// Assuming `solution` is an object that conforms to IEngineSolution
const solution: IEngineSolution = {
  title: "Example Solution",
  description: "This is an example solution description.",
  mainBenefitOfSolutionComponent: "Main benefit of this solution component.",
  mainObstacleToSolutionComponentAdoption: "Main obstacle to adopting this solution component."
};

// Example of rendering current solution
console.log(processor.renderCurrentSolution(solution));

// Example of creating pros and cons
(async () => {
  await processor.process();
})();
```