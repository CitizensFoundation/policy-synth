# PsConnectorFactory

The `PsConnectorFactory` class is responsible for creating various types of connectors based on the provided configuration. It supports different types of connectors such as document connectors, sheet connectors, notifications connectors, ideas collaboration connectors, and voting collaboration connectors.

## Methods

### createConnector

Creates a connector based on the provided connector class type.

| Name           | Parameters                                                                 | Return Type                | Description                                                                 |
|----------------|----------------------------------------------------------------------------|----------------------------|-----------------------------------------------------------------------------|
| createConnector | connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any | PsBaseConnectorTypes \| null | Creates a connector based on the provided connector class type.             |

### createDocumentConnector

Creates a document connector based on the provided connector class name.

| Name                  | Parameters                                                                 | Return Type                | Description                                                                 |
|-----------------------|----------------------------------------------------------------------------|----------------------------|-----------------------------------------------------------------------------|
| createDocumentConnector | connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any | PsBaseDocumentConnector \| null | Creates a document connector based on the provided connector class name.    |

### createSheetConnector

Creates a sheet connector based on the provided connector class name.

| Name               | Parameters                                                                 | Return Type                | Description                                                                 |
|--------------------|----------------------------------------------------------------------------|----------------------------|-----------------------------------------------------------------------------|
| createSheetConnector | connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any | PsBaseSheetConnector \| null | Creates a sheet connector based on the provided connector class name.       |

### createNotificationsConnector

Creates a notifications connector based on the provided connector class name.

| Name                       | Parameters                                                                 | Return Type                | Description                                                                 |
|----------------------------|----------------------------------------------------------------------------|----------------------------|-----------------------------------------------------------------------------|
| createNotificationsConnector | connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any | PsBaseNotificationsConnector \| null | Creates a notifications connector based on the provided connector class name. |

### createIdeasCollaborationConnector

Creates an ideas collaboration connector based on the provided connector class name.

| Name                            | Parameters                                                                 | Return Type                | Description                                                                 |
|---------------------------------|----------------------------------------------------------------------------|----------------------------|-----------------------------------------------------------------------------|
| createIdeasCollaborationConnector | connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any | PsBaseIdeasCollaborationConnector \| null | Creates an ideas collaboration connector based on the provided connector class name. |

### createVotingCollaborationConnector

Creates a voting collaboration connector based on the provided connector class name.

| Name                            | Parameters                                                                 | Return Type                | Description                                                                 |
|---------------------------------|----------------------------------------------------------------------------|----------------------------|-----------------------------------------------------------------------------|
| createVotingCollaborationConnector | connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any | PsBaseVotingCollaborationConnector \| null | Creates a voting collaboration connector based on the provided connector class name. |

### getConnector

Retrieves a connector based on the provided agent, memory, connector type, and whether it is an input connector.

| Name         | Parameters                                                                 | Return Type                | Description                                                                 |
|--------------|----------------------------------------------------------------------------|----------------------------|-----------------------------------------------------------------------------|
| getConnector | agent: PsAgent, memory: any, connectorType: PsConnectorClassTypes, isInput: boolean = true | PsBaseConnectorTypes \| null | Retrieves a connector based on the provided agent, memory, connector type, and whether it is an input connector. |

## Example

```typescript
import { PsConnectorFactory } from '@policysynth/agents/connectors/base/connectorFactory.js';
import { PsAgent } from '../../dbModels/agent.js';
import { PsConnectorClassTypes } from '../../connectorTypes.js';

// Example usage of PsConnectorFactory
const agent: PsAgent = ...; // Initialize agent
const memory: any = ...; // Initialize memory
const connectorType: PsConnectorClassTypes = PsConnectorClassTypes.Document;

const connector = PsConnectorFactory.getConnector(agent, memory, connectorType);
if (connector) {
  // Use the connector
}
```

This documentation provides an overview of the `PsConnectorFactory` class, its methods, and an example of how to use it. The class is designed to create various types of connectors based on the provided configuration, making it easier to manage different types of connectors in a consistent manner.