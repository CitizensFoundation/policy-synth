# PsConnectorFactory

The `PsConnectorFactory` class is responsible for creating and managing different types of connectors based on the provided configuration. It supports various connector types such as document, spreadsheet, notifications, ideas collaboration, and voting collaboration connectors.

## Methods

| Name                               | Parameters                                                                                          | Return Type                  | Description                                                                 |
|------------------------------------|-----------------------------------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| `createConnector`                  | `connector: PsAgentConnectorAttributes`, `connectorClass: PsAgentConnectorClassAttributes`, `agent: PsAgent`, `memory: any` | `PsBaseConnectorTypes \| null` | Creates a connector based on the class type specified in the configuration. |
| `createDocumentConnector`          | `connector: PsAgentConnectorAttributes`, `connectorClass: PsAgentConnectorClassAttributes`, `agent: PsAgent`, `memory: any` | `PsBaseDocumentConnector \| null` | Creates a document connector such as Google Docs or Microsoft Word.         |
| `createSheetConnector`             | `connector: PsAgentConnectorAttributes`, `connectorClass: PsAgentConnectorClassAttributes`, `agent: PsAgent`, `memory: any` | `PsBaseSheetConnector \| null` | Creates a sheet connector such as Google Sheets or Microsoft Excel.         |
| `createNotificationsConnector`     | `connector: PsAgentConnectorAttributes`, `connectorClass: PsAgentConnectorClassAttributes`, `agent: PsAgent`, `memory: any` | `PsBaseNotificationsConnector \| null` | Creates a notifications connector such as Discord or Slack.                 |
| `createIdeasCollaborationConnector`| `connector: PsAgentConnectorAttributes`, `connectorClass: PsAgentConnectorClassAttributes`, `agent: PsAgent`, `memory: any` | `PsBaseIdeasCollaborationConnector \| null` | Creates an ideas collaboration connector such as Your Priorities.           |
| `createVotingCollaborationConnector`| `connector: PsAgentConnectorAttributes`, `connectorClass: PsAgentConnectorClassAttributes`, `agent: PsAgent`, `memory: any` | `PsBaseVotingCollaborationConnector \| null` | Creates a voting collaboration connector such as All Our Ideas.             |
| `getConnector`                     | `agent: PsAgent`, `memory: any`, `connectorType: PsConnectorClassTypes`, `isInput: boolean = true` | `PsBaseConnectorTypes \| null` | Retrieves a specific connector based on the type and whether it's an input or output connector. |
| `getAllConnectors`                 | `agent: PsAgent`, `memory: any`, `connectorType: PsConnectorClassTypes`, `isInput: boolean = true` | `PsBaseConnectorTypes[]`     | Retrieves all connectors of a specific type, either input or output.        |

## Example

```typescript
import { PsConnectorFactory } from '@policysynth/agents/connectors/base/connectorFactory.js';
import { PsAgent } from '../../dbModels/agent.js';
import { PsConnectorClassTypes } from '../../connectorTypes.js';

// Example usage of PsConnectorFactory
const agent = new PsAgent();
const memory = {}; // Example memory object

// Create a document connector
const documentConnector = PsConnectorFactory.createConnector(
  connectorAttributes,
  connectorClassAttributes,
  agent,
  memory
);

// Get a specific connector
const specificConnector = PsConnectorFactory.getConnector(
  agent,
  memory,
  PsConnectorClassTypes.Document
);

// Get all connectors of a specific type
const allConnectors = PsConnectorFactory.getAllConnectors(
  agent,
  memory,
  PsConnectorClassTypes.NotificationsAndChat
);
```

This class provides a flexible way to manage different types of connectors by using a factory pattern, allowing for easy extension and maintenance of connector types.