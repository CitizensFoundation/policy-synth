# CreateSubProblemsProcessor

This class extends `BaseProblemSolvingAgent` to create and refine sub-problems from a given problem statement using AI models.

## Properties

No public properties documented.

## Methods

| Name                 | Parameters | Return Type                    | Description                                                                 |
|----------------------|------------|--------------------------------|-----------------------------------------------------------------------------|
| renderRefinePrompt   | results: IEngineSubProblem[] | Promise<BaseMessage[]> | Generates messages for refining sub-problems.                                |
| renderCreatePrompt   |            | Promise<BaseMessage[]>         | Generates messages for creating initial sub-problems.                       |
| createSubProblems    |            | Promise<void>                  | Creates and optionally refines sub-problems based on the problem statement. |
| process              |            | Promise<void>                  | Initiates the sub-problems creation and refinement process.                 |

## Example

```javascript
// Example usage of CreateSubProblemsProcessor
import { CreateSubProblemsProcessor } from '@policysynth/agents/problems/create/createSubProblems.js';

const processor = new CreateSubProblemsProcessor();
await processor.process();
```