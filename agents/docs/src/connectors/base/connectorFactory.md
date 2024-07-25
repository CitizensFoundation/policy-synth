# PsConnectorFactory

The `PsConnectorFactory` class is responsible for creating various types of connectors based on the provided configuration. It supports different types of connectors such as document connectors, sheet connectors, notifications connectors, ideas collaboration connectors, and voting collaboration connectors.

## Properties

This class does not have any properties.

## Methods

| Name                             | Parameters                                                                 | Return Type                  | Description                                                                 |
|----------------------------------|----------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| `createConnector`                | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any` | `PsBaseConnectorTypes \| null` | Creates a connector based on the provided class type.                      |
| `createDocumentConnector`        | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any` | `PsBaseDocumentConnector \| null` | Creates a document connector based on the provided configuration.          |
| `createSheetConnector`           | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any` | `PsBaseSheetConnector \| null` | Creates a sheet connector based on the provided configuration.             |
| `createNotificationsConnector`   | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any` | `PsBaseNotificationsConnector \| null` | Creates a notifications connector based on the provided configuration.     |
| `createIdeasCollaborationConnector` | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any` | `PsBaseIdeasCollaborationConnector \| null` | Creates an ideas collaboration connector based on the provided configuration. |
| `createVotingCollaborationConnector` | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any` | `PsBaseVotingCollaborationConnector \| null` | Creates a voting collaboration connector based on the provided configuration. |
| `getConnector`                   | `agent: PsAgent, memory: any, connectorType: PsConnectorClassTypes, isInput: boolean = true` | `PsBaseConnectorTypes \| null` | Retrieves a connector of the specified type from the agent's connectors.    |

## Example

```typescript
import { PsAgent } from "../../dbModels/agent.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";
import { PsConnectorFactory } from "./connectorFactory.js";

// Example usage of PsConnectorFactory
const agent = new PsAgent();
const memory = {}; // Some memory object
const connectorType = PsConnectorClassTypes.Document;

const documentConnector = PsConnectorFactory.getConnector(agent, memory, connectorType);

if (documentConnector) {
  console.log("Document connector created successfully.");
} else {
  console.log("Failed to create document connector.");
}
```

## Detailed Method Descriptions

### `createConnector`

Creates a connector based on the provided class type.

**Parameters:**
- `connector: PsAgentConnectorAttributes`: The connector attributes.
- `connectorClass: PsAgentConnectorClassAttributes`: The connector class attributes.
- `agent: PsAgent`: The agent instance.
- `memory: any`: The memory object.

**Returns:**
- `PsBaseConnectorTypes | null`: The created connector or null if the type is unsupported.

### `createDocumentConnector`

Creates a document connector based on the provided configuration.

**Parameters:**
- `connector: PsAgentConnectorAttributes`: The connector attributes.
- `connectorClass: PsAgentConnectorClassAttributes`: The connector class attributes.
- `agent: PsAgent`: The agent instance.
- `memory: any`: The memory object.

**Returns:**
- `PsBaseDocumentConnector | null`: The created document connector or null if the type is unsupported.

### `createSheetConnector`

Creates a sheet connector based on the provided configuration.

**Parameters:**
- `connector: PsAgentConnectorAttributes`: The connector attributes.
- `connectorClass: PsAgentConnectorClassAttributes`: The connector class attributes.
- `agent: PsAgent`: The agent instance.
- `memory: any`: The memory object.

**Returns:**
- `PsBaseSheetConnector | null`: The created sheet connector or null if the type is unsupported.

### `createNotificationsConnector`

Creates a notifications connector based on the provided configuration.

**Parameters:**
- `connector: PsAgentConnectorAttributes`: The connector attributes.
- `connectorClass: PsAgentConnectorClassAttributes`: The connector class attributes.
- `agent: PsAgent`: The agent instance.
- `memory: any`: The memory object.

**Returns:**
- `PsBaseNotificationsConnector | null`: The created notifications connector or null if the type is unsupported.

### `createIdeasCollaborationConnector`

Creates an ideas collaboration connector based on the provided configuration.

**Parameters:**
- `connector: PsAgentConnectorAttributes`: The connector attributes.
- `connectorClass: PsAgentConnectorClassAttributes`: The connector class attributes.
- `agent: PsAgent`: The agent instance.
- `memory: any`: The memory object.

**Returns:**
- `PsBaseIdeasCollaborationConnector | null`: The created ideas collaboration connector or null if the type is unsupported.

### `createVotingCollaborationConnector`

Creates a voting collaboration connector based on the provided configuration.

**Parameters:**
- `connector: PsAgentConnectorAttributes`: The connector attributes.
- `connectorClass: PsAgentConnectorClassAttributes`: The connector class attributes.
- `agent: PsAgent`: The agent instance.
- `memory: any`: The memory object.

**Returns:**
- `PsBaseVotingCollaborationConnector | null`: The created voting collaboration connector or null if the type is unsupported.

### `getConnector`

Retrieves a connector of the specified type from the agent's connectors.

**Parameters:**
- `agent: PsAgent`: The agent instance.
- `memory: any`: The memory object.
- `connectorType: PsConnectorClassTypes`: The type of connector to retrieve.
- `isInput: boolean = true`: Whether to retrieve an input connector (default is true).

**Returns:**
- `PsBaseConnectorTypes | null`: The retrieved connector or null if not found.