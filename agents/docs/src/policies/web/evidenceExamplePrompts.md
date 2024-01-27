# EvidenceExamplePrompts

This class provides methods to render examples of evidence based on the type of evidence requested. It supports rendering examples for various types of evidence including positive, negative, neutral, economic, scientific, cultural, environmental, legal, technological, geopolitical evidence, case studies, stakeholder opinions, expert opinions, public opinions, historical context, ethical considerations, long-term impact, short-term impact, local perspective, global perspective, cost analysis, and implementation feasibility.

## Methods

| Name   | Parameters                      | Return Type | Description                                                                 |
|--------|---------------------------------|-------------|-----------------------------------------------------------------------------|
| render | evidenceType: PSEvidenceWebPageTypes | string      | Renders an example of evidence based on the specified evidence type.        |

## Example

```
// Example usage of EvidenceExamplePrompts
{ EvidenceExamplePrompts } from '@policysynth/agents/policies/web/evidenceExamplePrompts.js';

const example = EvidenceExamplePrompts.render("positiveEvidence");
console.log(example);
```

This will output an example of positive evidence.