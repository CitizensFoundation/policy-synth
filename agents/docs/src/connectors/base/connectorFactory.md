# PsConnectorFactory

The `PsConnectorFactory` class is responsible for creating and managing different types of connectors for agents. It supports document connectors, notifications and chat connectors, and collaboration connectors.

## Properties

This class does not have any properties.

## Methods

| Name                      | Parameters                                                                 | Return Type                  | Description                                                                 |
|---------------------------|----------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| `createConnector`         | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any` | `PsBaseConnectorTypes \| null` | Creates a connector based on the provided connector class type.             |
| `createDocumentConnector` | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any` | `PsBaseDocumentConnector \| null` | Creates a document connector based on the provided connector class name.    |
| `createNotificationsConnector` | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any` | `PsBaseNotificationsConnector \| null` | Creates a notifications connector based on the provided connector class name. |
| `createCollaborationConnector` | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any` | `PsBaseCollaborationConnector \| null` | Creates a collaboration connector based on the provided connector class name. |
| `getConnector`            | `agent: PsAgent, memory: any, connectorType: PsConnectorClassTypes, isInput: boolean = true` | `PsBaseConnectorTypes \| null` | Retrieves a connector of the specified type for the given agent.            |

## Example

```typescript
import { PsAgent } from "../../dbModels/agent.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";
import { PsConnectorFactory } from "./connectorFactory.js";

// Example usage of PsConnectorFactory
const agent = new PsAgent();
const memory = {};

const documentConnector = PsConnectorFactory.getConnector(agent, memory, PsConnectorClassTypes.Document);
const notificationsConnector = PsConnectorFactory.getConnector(agent, memory, PsConnectorClassTypes.NotificationsAndChat);
const collaborationConnector = PsConnectorFactory.getConnector(agent, memory, PsConnectorClassTypes.Collaboration);

if (documentConnector) {
  // Use the document connector
}

if (notificationsConnector) {
  // Use the notifications connector
}

if (collaborationConnector) {
  // Use the collaboration connector
}
```

## Detailed Method Descriptions

### `createConnector`

Creates a connector based on the provided connector class type.

**Parameters:**
- `connector: PsAgentConnectorAttributes`: The connector attributes.
- `connectorClass: PsAgentConnectorClassAttributes`: The connector class attributes.
- `agent: PsAgent`: The agent instance.
- `memory: any`: The memory instance.

**Returns:**
- `PsBaseConnectorTypes | null`: The created connector or null if the connector type is unsupported.

### `createDocumentConnector`

Creates a document connector based on the provided connector class name.

**Parameters:**
- `connector: PsAgentConnectorAttributes`: The connector attributes.
- `connectorClass: PsAgentConnectorClassAttributes`: The connector class attributes.
- `agent: PsAgent`: The agent instance.
- `memory: any`: The memory instance.

**Returns:**
- `PsBaseDocumentConnector | null`: The created document connector or null if the connector name is unsupported.

### `createNotificationsConnector`

Creates a notifications connector based on the provided connector class name.

**Parameters:**
- `connector: PsAgentConnectorAttributes`: The connector attributes.
- `connectorClass: PsAgentConnectorClassAttributes`: The connector class attributes.
- `agent: PsAgent`: The agent instance.
- `memory: any`: The memory instance.

**Returns:**
- `PsBaseNotificationsConnector | null`: The created notifications connector or null if the connector name is unsupported.

### `createCollaborationConnector`

Creates a collaboration connector based on the provided connector class name.

**Parameters:**
- `connector: PsAgentConnectorAttributes`: The connector attributes.
- `connectorClass: PsAgentConnectorClassAttributes`: The connector class attributes.
- `agent: PsAgent`: The agent instance.
- `memory: any`: The memory instance.

**Returns:**
- `PsBaseCollaborationConnector | null`: The created collaboration connector or null if the connector name is unsupported.

### `getConnector`

Retrieves a connector of the specified type for the given agent.

**Parameters:**
- `agent: PsAgent`: The agent instance.
- `memory: any`: The memory instance.
- `connectorType: PsConnectorClassTypes`: The type of connector to retrieve.
- `isInput: boolean = true`: Whether to retrieve an input connector (default is true).

**Returns:**
- `PsBaseConnectorTypes | null`: The retrieved connector or null if no matching connector is found.