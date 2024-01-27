# RootCauseExamplePrompts

This class provides methods to render example prompts for identifying root causes in various categories such as historical, economic, scientific, cultural, social, environmental, legal, technological, geopolitical, ethical, and case studies. It aims to analyze texts to find root causes related to the provided problem statement and outputs the analysis in JSON format.

## Methods

| Name   | Parameters                          | Return Type | Description                                                                 |
|--------|-------------------------------------|-------------|-----------------------------------------------------------------------------|
| render | categoryType: PSRootCauseWebPageTypes | string      | Renders example prompts based on the specified root cause category type.    |

## Example

```typescript
import { RootCauseExamplePrompts, PSRootCauseWebPageTypes } from '@policysynth/agents/problems/web/rootCauseExamplePrompts.js';

// Example usage to render a prompt for historical root cause
const categoryType: PSRootCauseWebPageTypes = "historicalRootCause";
const prompt = RootCauseExamplePrompts.render(categoryType);

console.log(prompt);
```