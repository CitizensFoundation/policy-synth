# PsSubAgentsConnector

A connector class for linking multiple agents together within the PolicySynth agent framework. This connector enables the orchestration of sub-agents, allowing agents to be connected as inputs or outputs, facilitating complex agent workflows.

## Properties

| Name                                   | Type                                         | Description                                                                                  |
|-----------------------------------------|----------------------------------------------|----------------------------------------------------------------------------------------------|
| SUB_AGENTS_CONNECTOR_CLASS_BASE_ID      | `string` (static, readonly)                  | Unique identifier for the Sub Agents Connector class.                                         |
| SUB_AGENTS_CONNECTOR_VERSION            | `number` (static, readonly)                  | Version number of the Sub Agents Connector class.                                             |
| getConnectorClass                       | `PsAgentConnectorClassCreationAttributes`    | Static definition of the connector class metadata and configuration, including UI questions.  |

## Constructor

```typescript
constructor(
  connector: PsAgentConnectorAttributes,
  connectorClass: PsAgentConnectorClassAttributes,
  agent: PsAgent,
  memory?: PsAgentMemoryData,
  startProgress?: number,
  endProgress?: number
)
```

- **connector**: The connector instance attributes.
- **connectorClass**: The connector class attributes.
- **agent**: The parent agent instance.
- **memory**: (Optional) The agent's memory data.
- **startProgress**: (Optional) Progress start value (default: 0).
- **endProgress**: (Optional) Progress end value (default: 100).

## Methods

| Name                      | Parameters | Return Type         | Description                                                                                      |
|---------------------------|------------|---------------------|--------------------------------------------------------------------------------------------------|
| listConnectedInputAgents  | none       | `Promise<PsAgent[]>`| Returns a list of agents that are connected as inputs to this connector.                         |
| listConnectedOutputAgents | none       | `Promise<PsAgent[]>`| Returns a list of agents that are connected as outputs from this connector.                      |

### Method Details

#### listConnectedInputAgents

Returns all agents that are connected as inputs to this connector.

```typescript
async listConnectedInputAgents(): Promise<PsAgent[]>
```

#### listConnectedOutputAgents

Returns all agents that are connected as outputs from this connector.

```typescript
async listConnectedOutputAgents(): Promise<PsAgent[]>
```

## Example

```typescript
import { PsSubAgentsConnector } from '@policysynth/agents/connectors/agents/subAgentsConnector.js';

// Assume you have instances of the required arguments:
const connector: PsAgentConnectorAttributes = /* ... */;
const connectorClass: PsAgentConnectorClassAttributes = /* ... */;
const agent: PsAgent = /* ... */;
const memory: PsAgentMemoryData = /* ... */;

const subAgentsConnector = new PsSubAgentsConnector(
  connector,
  connectorClass,
  agent,
  memory
);

// List input agents connected to this connector
const inputAgents = await subAgentsConnector.listConnectedInputAgents();

// List output agents connected to this connector
const outputAgents = await subAgentsConnector.listConnectedOutputAgents();
```

---

**Connector Class Metadata Example:**

```typescript
PsSubAgentsConnector.getConnectorClass
// {
//   class_base_id: "eb5a405e-e8bb-4eae-80c9-e5b66aaf164f",
//   name: "Sub Agents Connector",
//   version: 1,
//   user_id: 1,
//   available: true,
//   configuration: {
//     name: "Sub Agents Connector",
//     classType: PsConnectorClassTypes.SubAgents,
//     description: "Connector for linking agents together",
//     hasPublicAccess: true,
//     imageUrl: "...",
//     iconName: "agents",
//     questions: [
//       { uniqueId: "name", text: "Name", type: "textField", maxLength: 200, required: true },
//       { uniqueId: "description", text: "Description", type: "textArea", maxLength: 500, required: false },
//     ],
//   },
// }
```

---

**Summary:**  
The `PsSubAgentsConnector` class is a specialized connector for orchestrating and linking multiple agents, supporting both input and output agent connections. It is designed for use in advanced agent workflows within the PolicySynth platform.