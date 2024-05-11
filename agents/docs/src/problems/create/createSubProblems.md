# CreateSubProblemsProcessor

This class extends `BaseProblemSolvingAgent` to handle the creation and refinement of sub-problems derived from a main problem statement. It interacts with a language model to generate and refine sub-problems, and manages the flow of messages related to this process.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| chat          | ChatOpenAI | Instance of ChatOpenAI used for communication with OpenAI's language models. |

## Methods

| Name                | Parameters        | Return Type            | Description                 |
|---------------------|-------------------|------------------------|-----------------------------|
| renderRefinePrompt  | results: IEngineSubProblem[] | Promise<BaseMessage[]> | Generates messages for refining sub-problems based on initial results. |
| renderCreatePrompt  | -                 | Promise<BaseMessage[]> | Generates messages for creating initial sub-problems. |
| createSubProblems   | -                 | Promise<void>          | Orchestrates the creation and optional refinement of sub-problems. |
| process             | -                 | Promise<void>          | Overrides the `process` method from `BaseProblemSolvingAgent`, initializes chat settings, and starts the sub-problem creation process. |

## Example

```typescript
import { CreateSubProblemsProcessor } from '@policysynth/agents/problems/create/createSubProblems.js';
import { IEngineConstants } from '../../constants.js';

const processor = new CreateSubProblemsProcessor();

// Example settings for IEngineConstants
IEngineConstants.createSubProblemsModel = {
  temperature: 0.5,
  maxOutputTokens: 150,
  name: 'gpt-3.5-turbo',
  verbose: true
};

IEngineConstants.enable = {
  refine: {
    createSubProblems: true
  }
};

processor.process().then(() => {
  console.log('Sub-problems processing completed.');
}).catch(error => {
  console.error('Error processing sub-problems:', error);
});
```