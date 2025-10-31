# PsConnectorClassTypes

The `PsConnectorClassTypes` enum defines the various types of connector classes available in the PolicySynth Agents system. These connector types categorize the nature and purpose of connectors, such as document handling, spreadsheets, notifications, collaboration, and more.

## Enum Values

| Name                   | Value                  | Description                                                                 |
|------------------------|------------------------|-----------------------------------------------------------------------------|
| Document               | "docs"                 | Represents connectors for document management (e.g., Google Docs).          |
| Spreadsheet            | "sheets"               | Represents connectors for spreadsheet management (e.g., Google Sheets).     |
| NotificationsAndChat   | "notificationsAndChat" | Connectors for notifications and chat platforms (e.g., Slack, Discord).     |
| IdeasCollaboration     | "ideasCollaboration"   | Connectors for collaborative idea management (e.g., Your Priorities).       |
| VotingCollaboration    | "votingCollaboration"  | Connectors for collaborative voting systems (e.g., All Our Ideas).          |
| Drive                  | "drive"                | Connectors for file storage and drive services (e.g., Google Drive).        |
| SubAgents              | "subAgents"            | Connectors for managing or linking sub-agents within the agent system.      |

## Example

```typescript
import { PsConnectorClassTypes } from '@policysynth/agents/connectorTypes.js';

// Example: Assigning a connector type to a variable
const connectorType: PsConnectorClassTypes = PsConnectorClassTypes.Document;

if (connectorType === PsConnectorClassTypes.Document) {
  console.log("This connector handles documents.");
}
```

This enum is typically used when defining or registering connector classes, ensuring that each connector is categorized appropriately for its intended integration or functionality.