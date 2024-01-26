# EvidenceExamplePrompts

This class provides methods to render example prompts for various types of evidence related to policies and their impacts. It supports rendering examples for positive, negative, neutral, and various specific types of evidence.

## Methods

| Name   | Parameters                        | Return Type | Description                                                                 |
|--------|-----------------------------------|-------------|-----------------------------------------------------------------------------|
| render | evidenceType: PSEvidenceWebPageTypes | string      | Renders example prompts based on the specified type of evidence.            |

## Example

```
import { EvidenceExamplePrompts } from '@policysynth/agents/policies/web/evidenceExamplePrompts.ts';

const examplePrompt = EvidenceExamplePrompts.render("positiveEvidence");
console.log(examplePrompt);
```

This will output an example prompt for positive evidence.