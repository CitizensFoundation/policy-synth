# PsConnectorFactory

The `PsConnectorFactory` class is responsible for creating various types of connectors based on the provided configuration. It supports different categories of connectors such as document, spreadsheet, notifications and chat, ideas collaboration, and voting collaboration.

## Methods

| Name                               | Parameters                                                                                                                                                                                                 | Return Type                  | Description                                                                 |
|------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| `createConnector`                  | `connector: PsAgentConnectorAttributes`, `connectorClass: PsAgentConnectorClassAttributes`, `agent: PsAgent`, `memory: any`                                                                              | `PsBaseConnectorTypes \| null` | Creates a connector based on the class type specified in the configuration. |
| `createDocumentConnector`          | `connector: PsAgentConnectorAttributes`, `connectorClass: PsAgentConnectorClassAttributes`, `agent: PsAgent`, `memory: any`                                                                              | `PsBaseDocumentConnector \| null` | Creates a document connector such as Google Docs or Microsoft Word.         |
| `createSheetConnector`             | `connector: PsAgentConnectorAttributes`, `connectorClass: PsAgentConnectorClassAttributes`, `agent: PsAgent`, `memory: any`                                                                              | `PsBaseSheetConnector \| null` | Creates a spreadsheet connector such as Google Sheets or Microsoft Excel.   |
| `createNotificationsConnector`     | `connector: PsAgentConnectorAttributes`, `connectorClass: PsAgentConnectorClassAttributes`, `agent: PsAgent`, `memory: any`                                                                              | `PsBaseNotificationsConnector \| null` | Creates a notifications connector such as Discord or Slack.                |
| `createIdeasCollaborationConnector`| `connector: PsAgentConnectorAttributes`, `connectorClass: PsAgentConnectorClassAttributes`, `agent: PsAgent`, `memory: any`                                                                              | `PsBaseIdeasCollaborationConnector \| null` | Creates an ideas collaboration connector such as Your Priorities.          |
| `createVotingCollaborationConnector`| `connector: PsAgentConnectorAttributes`, `connectorClass: PsAgentConnectorClassAttributes`, `agent: PsAgent`, `memory: any`                                                                             | `PsBaseVotingCollaborationConnector \| null` | Creates a voting collaboration connector such as All Our Ideas.            |
| `getConnector`                     | `agent: PsAgent`, `memory: any`, `connectorType: PsConnectorClassTypes`, `isInput: boolean = true`                                                                                                        | `PsBaseConnectorTypes \| null` | Retrieves a connector based on the specified type and whether it's an input or output connector. |

## Example

```typescript
import { PsConnectorFactory } from '@policysynth/agents/connectors/base/connectorFactory.js';
import { PsAgent } from '../../dbModels/agent.js';
import { PsConnectorClassTypes } from '../../connectorTypes.js';

// Example usage of PsConnectorFactory
const agent = new PsAgent();
const memory = {};
const connectorType = PsConnectorClassTypes.Document;
const documentConnector = PsConnectorFactory.getConnector(agent, memory, connectorType);

if (documentConnector) {
  // Use the document connector
}
```

This class provides a structured way to instantiate connectors based on their type and configuration, allowing for easy integration and management of different connector types within the system.