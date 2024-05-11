# PsBaseMemoryData

This type represents the base memory data structure used in policy synthesis and problem-solving scenarios. It is designed to store and manage various instructions, problem statements, and other relevant data for project setups.

## Properties

| Name                     | Type                          | Description                                       |
|--------------------------|-------------------------------|---------------------------------------------------|
| customInstructions       | CustomInstructions \| undefined | Custom instructions for various project tasks.    |
| problemStatement         | ProblemStatement \| undefined  | Description of the main problem to be addressed.  |
| subProblemClientColors   | string[] \| undefined          | Array of color codes for sub-problem visualization. |
| customInstructions       | CustomInstructions \| undefined | Custom instructions for creating, ranking, and rating solutions. |

## Methods

| Name             | Parameters                  | Return Type | Description                 |
|------------------|-----------------------------|-------------|-----------------------------|
| setupProjectOne  | memory: PsBaseMemoryData    | void        | Sets up project one with specific instructions and problem statements. |
| setupProjectTwo  | memory: PsBaseMemoryData    | void        | Sets up project two with specific instructions and problem statements. |
| setupProjectThree| memory: PsBaseMemoryData    | void        | Sets up project three with specific instructions and problem statements. |
| setupProjectFour | memory: PsBaseMemoryData    | void        | Sets up project four with specific instructions and problem statements. |
| setupProjectFive | memory: PsBaseMemoryData    | void        | Sets up project five with specific instructions and problem statements. |
| setupProjectSix  | memory: PsBaseMemoryData    | void        | Sets up project six with specific instructions and problem statements. |
| setupProjectSeven| memory: PsBaseMemoryData    | void        | Sets up project seven with specific instructions and problem statements. |

## Example

```typescript
import { PsBaseMemoryData } from '@policysynth/agents/problems/tools/setAlignmentStatements.js';

const memoryData: PsBaseMemoryData = {
  customInstructions: {
    createSolutions: "Detailed instructions for creating solutions.",
    rankSolutions: "Instructions for ranking solutions.",
    rateSolutionsJsonFormat: "JSON format for rating solutions."
  },
  problemStatement: {
    description: "A detailed description of the main problem."
  },
  subProblemClientColors: ["#FFFFFF", "#000000"],
};

// Example usage of setupProjectOne
setupProjectOne(memoryData);
```