# RateSolutionsProcessor

`RateSolutionsProcessor` extends `BaseProblemSolvingAgent` to rate solutions for sub-problems using a language model.

## Methods

| Name                | Parameters                                  | Return Type                  | Description                                                                 |
|---------------------|---------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| renderRatePrompt    | subProblemIndex: number, solution: IEngineSolution | Promise<SystemMessage[]> | Generates messages for rating a solution component.                         |
| rateSolutions       | None                                        | Promise<void>                | Rates all solutions for all sub-problems.                                   |
| process             | None                                        | Promise<void>                | Initializes the chat model and processes the rating of solution components. |

## Example

```javascript
// Example usage of RateSolutionsProcessor
import { RateSolutionsProcessor } from '@policysynth/agents/solutions/ranking/rateSolutions.js';

const rateSolutionsProcessor = new RateSolutionsProcessor();

(async () => {
  try {
    await rateSolutionsProcessor.process();
  } catch (error) {
    console.error("Error processing solution ratings:", error);
  }
})();
```