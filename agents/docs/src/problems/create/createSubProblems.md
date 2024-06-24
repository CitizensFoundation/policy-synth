# CreateSubProblemsProcessor

The `CreateSubProblemsProcessor` class is a specialized agent for creating and refining sub-problems from a given problem statement. It extends the `BaseProblemSolvingAgent` class and utilizes the OpenAI language model to generate and refine sub-problems.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| chat          | ChatOpenAI | Instance of the ChatOpenAI class used for interacting with the language model. |
| memory        | PsSmarterCrowdsourcingMemoryData | Memory object that stores the problem statement and sub-problems. |
| logger        | Logger | Logger instance for logging information. |

## Methods

| Name                | Parameters        | Return Type | Description                 |
|---------------------|-------------------|-------------|-----------------------------|
| renderRefinePrompt  | results: PsSubProblem[] | Promise<BaseMessage[]> | Generates a prompt for refining sub-problems. |
| renderCreatePrompt  | None              | Promise<BaseMessage[]> | Generates a prompt for creating sub-problems. |
| createSubProblems   | None              | Promise<void> | Creates and refines sub-problems using the language model. |
| process             | None              | Promise<void> | Main processing method that initializes the chat instance and creates sub-problems. |

## Example

```typescript
import { CreateSubProblemsProcessor } from '@policysynth/agents/problems/create/createSubProblems.js';

const processor = new CreateSubProblemsProcessor();
processor.process();
```

This example demonstrates how to create an instance of `CreateSubProblemsProcessor` and call its `process` method to generate and refine sub-problems from a given problem statement.