# RootCauseExamplePrompts

The `RootCauseExamplePrompts` class provides methods to render different types of root cause prompts based on a given category type. It also includes a static prompt template for analyzing text to find root causes related to a problem statement.

## Properties

| Name   | Type   | Description               |
|--------|--------|---------------------------|
| prompt | string | Static template for generating root cause analysis prompts. |

## Methods

| Name    | Parameters                        | Return Type | Description                                                                                   |
|---------|-----------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| render  | categoryType: PSRootCauseWebPageTypes | string      | Renders root cause prompts based on the provided category type.                               |

## Examples

```typescript
// Example usage of the RootCauseExamplePrompts class
const categoryType = "historicalRootCause";
const prompt = RootCauseExamplePrompts.render(categoryType);
console.log(prompt);
```