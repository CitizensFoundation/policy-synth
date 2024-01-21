# YpSurveyHelpers

A utility class providing helper methods for survey question operations.

## Methods

| Name                        | Parameters                             | Return Type | Description                                             |
|-----------------------------|----------------------------------------|-------------|---------------------------------------------------------|
| getQuestionLengthWithSubOptions | questions: Array<YpStructuredQuestionData> | number      | Calculates the total number of questions including sub-options like radio buttons, checkboxes, or dropdown options. |

## Examples

```typescript
// Example usage of getQuestionLengthWithSubOptions
const questions: Array<YpStructuredQuestionData> = [
  // ... populate with question data
];

const totalLength = YpSurveyHelpers.getQuestionLengthWithSubOptions(questions);
console.log(totalLength);
```