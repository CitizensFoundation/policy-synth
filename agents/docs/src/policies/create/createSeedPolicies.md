# CreateSeedPoliciesProcessor

This class extends `BaseProblemSolvingAgent` to create seed policies from solutions for sub-problems.

## Methods

| Name                           | Parameters                                                                 | Return Type            | Description                                                                 |
|--------------------------------|----------------------------------------------------------------------------|------------------------|-----------------------------------------------------------------------------|
| renderCurrentSolution          | solution: IEngineSolution                                                  | string                 | Renders the current solution into a formatted string.                       |
| renderCreatePrompt             | subProblemIndex: number, solution: IEngineSolution                         | Promise<SystemMessage[]> | Prepares the prompt for creating policy proposals based on a solution.      |
| renderRefinePrompt             | subProblemIndex: number, solution: IEngineSolution, policyProposalsToRefine: PSPolicy[] | Promise<SystemMessage[]> | Prepares the prompt for refining policy proposals.                          |
| renderChoosePrompt             | subProblemIndex: number, solution: IEngineSolution, policyProposalsToChooseFrom: PSPolicy[] | Promise<SystemMessage[]> | Prepares the prompt for choosing the best policy proposal.                  |
| createSeedPolicyForSolution    | populationIndex: number, subProblemIndex: number, solution: IEngineSolution, solutionIndex: number | Promise<PSPolicy>      | Creates a seed policy for a given solution.                                 |
| createSeedPolicies             | -                                                                          | Promise<void>          | Creates seed policies for all solutions of all sub-problems.                |
| process                        | -                                                                          | Promise<void>          | Main method to start the process of creating seed policies.                 |

## Example

```javascript
// Example usage of CreateSeedPoliciesProcessor
import { CreateSeedPoliciesProcessor } from '@policysynth/agents/policies/create/createSeedPolicies.js';
import { IEngineSolution, PSPolicy } from 'path/to/interfaces'; // Assume these are defined elsewhere

const processor = new CreateSeedPoliciesProcessor();

// Example of creating a seed policy for a specific solution
const solution: IEngineSolution = {
  title: 'Example Solution',
  description: 'An example solution description.',
  mainBenefitOfSolutionComponent: 'Main benefit of the solution.',
  mainObstacleToSolutionComponentAdoption: 'Main obstacle to adoption.',
  pros: [],
  cons: []
};

processor.createSeedPolicyForSolution(0, 1, solution, 2)
  .then(policy => console.log(policy))
  .catch(error => console.error(error));

// Starting the process of creating seed policies
processor.process()
  .then(() => console.log('Finished creating seed policies'))
  .catch(error => console.error(error));
```