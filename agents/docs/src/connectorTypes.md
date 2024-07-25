# PsConnectorClassTypes

Enumeration representing different types of connector classes.

## Enum Values

| Name                    | Value                  | Description                                      |
|-------------------------|------------------------|--------------------------------------------------|
| Document                | "docs"                 | Represents a document connector class.           |
| Spreadsheet             | "sheets"               | Represents a spreadsheet connector class.        |
| NotificationsAndChat    | "notificationsAndChat" | Represents a notifications and chat connector class. |
| IdeasCollaboration      | "ideasCollaboration"   | Represents an ideas collaboration connector class. |
| VotingCollaboration     | "votingCollaboration"  | Represents a voting collaboration connector class. |

## Example

```typescript
import { PsConnectorClassTypes } from '@policysynth/agents/connectorTypes.js';

// Example usage of PsConnectorClassTypes
const connectorType: PsConnectorClassTypes = PsConnectorClassTypes.Document;

console.log(connectorType); // Output: "docs"
```

This enum is used to categorize different types of connectors in the system, such as document connectors, spreadsheet connectors, and more. Each type is represented by a string value.