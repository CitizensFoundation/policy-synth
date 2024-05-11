# RootCauseTypeTypeDefs

This class provides methods to render different types of root cause information based on the category specified. It supports various root cause categories such as historical, economic, scientific, and more, each returning a structured data format relevant to the type.

## Methods

| Name                        | Parameters                          | Return Type | Description                                                                 |
|-----------------------------|-------------------------------------|-------------|-----------------------------------------------------------------------------|
| render                      | categoryType: PSRootCauseWebPageTypes | string      | Renders root cause information based on the specified category type.        |
| renderHistoricalRootCause   |                                     | string      | Returns historical root cause information in a structured format.           |
| renderEconomicRootCause     |                                     | string      | Returns economic root cause information in a structured format.             |
| renderScientificRootCause   |                                     | string      | Returns scientific root cause information in a structured format.           |
| renderCulturalRootCause     |                                     | string      | Returns cultural root cause information in a structured format.             |
| renderSocialRootCause       |                                     | string      | Returns social root cause information in a structured format.               |
| renderEnvironmentalRootCause|                                     | string      | Returns environmental root cause information in a structured format.        |
| renderLegalRootCause        |                                     | string      | Returns legal root cause information in a structured format.                |
| renderTechnologicalRootCause|                                     | string      | Returns technological root cause information in a structured format.        |
| renderGeopoliticalRootCause |                                     | string      | Returns geopolitical root cause information in a structured format.         |
| renderEthicalRootCause      |                                     | string      | Returns ethical root cause information in a structured format.              |
| renderCaseStudies           |                                     | string      | Returns case studies related to root causes in a structured format.         |

## Example

```typescript
import { RootCauseTypeTypeDefs } from '@policysynth/agents/problems/web/rootCauseTypeTypeDef.js';

// Example usage to render historical root cause information
const historicalRootCauseInfo = RootCauseTypeTypeDefs.render("historicalRootCause");
console.log(historicalRootCauseInfo);

// Example usage to render economic root cause information
const economicRootCauseInfo = RootCauseTypeTypeDefs.render("economicRootCause");
console.log(economicRootCauseInfo);
```