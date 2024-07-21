# PsConnectorClassTypes

Enumeration representing different types of connector classes.

## Enum Values

| Name                    | Value                  | Description                                      |
|-------------------------|------------------------|--------------------------------------------------|
| Document                | "docs"                 | Represents a document connector class.           |
| Spreadsheet             | "sheets"               | Represents a spreadsheet connector class.        |
| NotificationsAndChat    | "notificationsAndChat" | Represents a notifications and chat connector class. |
| Collaboration           | "collaboration"        | Represents a collaboration connector class.      |
| PairwiseVoting          | "pairwiseVoting"       | Represents a pairwise voting connector class.    |

## Example

```typescript
import { PsConnectorClassTypes } from '@policysynth/agents/connectorTypes.js';

// Example usage
const connectorType: PsConnectorClassTypes = PsConnectorClassTypes.Document;
console.log(connectorType); // Output: "docs"
```

This enum is used to categorize different types of connectors in the system, making it easier to manage and utilize them based on their specific type.