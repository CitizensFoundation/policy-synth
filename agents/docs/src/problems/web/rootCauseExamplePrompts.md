# RootCauseExamplePrompts

This class provides methods to render different types of root cause analysis based on a given category type. It supports rendering for various root causes including historical, economic, scientific, cultural, social, environmental, legal, technological, geopolitical, ethical, and case studies.

## Methods

| Name                  | Parameters                        | Return Type | Description                                                                 |
|-----------------------|-----------------------------------|-------------|-----------------------------------------------------------------------------|
| render                | categoryType: PSRootCauseWebPageTypes | string      | Renders the appropriate root cause analysis based on the provided category. |
| renderHistoricalRootCause | None                              | string      | Renders the historical root cause analysis.                                 |
| renderEconomicRootCause | None                              | string      | Renders the economic root cause analysis.                                   |
| renderScientificRootCause | None                              | string      | Renders the scientific root cause analysis.                                 |
| renderCulturalRootCause | None                              | string      | Renders the cultural root cause analysis.                                   |
| renderSocialRootCause | None                              | string      | Renders the social root cause analysis.                                     |
| renderEnvironmentalRootCause | None                              | string      | Renders the environmental root cause analysis.                              |
| renderLegalRootCause  | None                              | string      | Renders the legal root cause analysis.                                      |
| renderTechnologicalRootCause | None                              | string      | Renders the technological root cause analysis.                              |
| renderGeopoliticalRootCause | None                              | string      | Renders the geopolitical root cause analysis.                               |
| renderEthicalRootCause | None                              | string      | Renders the ethical root cause analysis.                                    |
| renderCaseStudies     | None                              | string      | Renders the case studies related to root causes.                            |

## Example

```typescript
import { RootCauseExamplePrompts } from '@policysynth/agents/problems/web/rootCauseExamplePrompts.js';

// Example usage to render historical root cause
const historicalRootCause = RootCauseExamplePrompts.render("historicalRootCause");
console.log(historicalRootCause);

// Example usage to render economic root cause
const economicRootCause = RootCauseExamplePrompts.render("economicRootCause");
console.log(economicRootCause);
```