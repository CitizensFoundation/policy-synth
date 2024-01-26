# CreateSeedPoliciesProcessor

This class extends `BaseProlemSolvingAgent` to create seed policies from solutions for sub-problems.

## Methods

| Name                           | Parameters                                                                 | Return Type                  | Description                                                                                   |
|--------------------------------|----------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------------------------|
| renderCurrentSolution          | solution: IEngineSolution                                                  | string                       | Renders the current solution into a formatted string.                                         |
| renderCreatePrompt             | subProblemIndex: number, solution: IEngineSolution                         | Promise<SystemMessage[]>     | Prepares the prompt for creating policy proposals based on a solution.                        |
| renderRefinePrompt             | subProblemIndex: number, solution: IEngineSolution, policyProposalsToRefine: PSPolicy[] | Promise<SystemMessage[]>     | Prepares the prompt for refining policy proposals.                                            |
| renderChoosePrompt             | subProblemIndex: number, solution: IEngineSolution, policyProposalsToChooseFrom: PSPolicy[] | Promise<SystemMessage[]>     | Prepares the prompt for choosing the best policy proposal from a list.                        |
| createSeedPolicyForSolution    | populationIndex: number, subProblemIndex: number, solution: IEngineSolution, solutionIndex: number | Promise<PSPolicy>            | Creates a seed policy for a given solution by generating, refining, and choosing policy proposals. |
| createSeedPolicies             |                                                                            | Promise<void>                | Iterates over sub-problems and their solutions to create seed policies.                       |
| process                        |                                                                            | Promise<void>                | Main method to start the process of creating seed policies.                                   |

## Example

```typescript
// Example usage of CreateSeedPoliciesProcessor
import { CreateSeedPoliciesProcessor } from '@policysynth/agents/policies/create/createSeedPolicies.ts';

async function run() {
  const processor = new CreateSeedPoliciesProcessor();
  await processor.process();
}

run().catch(console.error);
```