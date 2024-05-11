# CreateSeedPoliciesProcessor

This class is responsible for creating seed policies based on solutions to subproblems. It extends the `BaseProblemSolvingAgent` and utilizes methods to render prompts, refine, and choose the best policy proposals.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| chat          | ChatOpenAI | Instance of ChatOpenAI used for communication with OpenAI's API. |

## Methods

| Name                          | Parameters                                             | Return Type         | Description                                                                 |
|-------------------------------|--------------------------------------------------------|---------------------|-----------------------------------------------------------------------------|
| renderCurrentSolution         | solution: IEngineSolution                              | string              | Renders the current solution details into a formatted string.               |
| renderCreatePrompt            | subProblemIndex: number, solution: IEngineSolution     | Promise<SystemMessage[]> | Generates messages for creating policy proposals based on a solution.       |
| renderRefinePrompt            | subProblemIndex: number, solution: IEngineSolution, policyProposalsToRefine: PSPolicy[] | Promise<SystemMessage[]> | Generates messages for refining existing policy proposals.                 |
| renderChoosePrompt            | subProblemIndex: number, solution: IEngineSolution, policyProposalsToChooseFrom: PSPolicy[] | Promise<SystemMessage[]> | Generates messages for choosing the best policy proposal.                   |
| createSeedPolicyForSolution   | populationIndex: number, subProblemIndex: number, solution: IEngineSolution, solutionIndex: number | Promise<PSPolicy>  | Creates a seed policy for a given solution.                                |
| createSeedPolicies            | None                                                   | Promise<void>       | Orchestrates the creation of seed policies for all subproblems.            |
| process                       | None                                                   | Promise<void>       | Main method to start the policy creation process.                          |

## Example

```typescript
// Example usage of CreateSeedPoliciesProcessor
import { CreateSeedPoliciesProcessor } from '@policysynth/agents/policies/create/createSeedPolicies.js';
import { IEngineSolution, PSPolicy } from 'path_to_solution_and_policy_types';

const processor = new CreateSeedPoliciesProcessor();

// Example solution object
const exampleSolution: IEngineSolution = {
  title: "Solution Example",
  description: "Detailed description of the solution.",
  mainBenefitOfSolutionComponent: "Main benefit of the solution.",
  mainObstacleToSolutionComponentAdoption: "Main obstacle for adoption.",
  pros: [{ detail: "Pro detail" }],
  cons: [{ detail: "Con detail" }]
};

// Render current solution
console.log(processor.renderCurrentSolution(exampleSolution));

// Create, refine, and choose policy proposals
async function handlePolicies() {
  const createMessages = await processor.renderCreatePrompt(0, exampleSolution);
  console.log(createMessages);

  const policyProposals: PSPolicy[] = [{ title: "Policy 1", description: "Description 1" }];
  const refineMessages = await processor.renderRefinePrompt(0, exampleSolution, policyProposals);
  console.log(refineMessages);

  const chooseMessages = await processor.renderChoosePrompt(0, exampleSolution, policyProposals);
  console.log(chooseMessages);
}

handlePolicies();
```
