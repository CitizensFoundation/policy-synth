# PsConnectorFactory

The `PsConnectorFactory` class is a factory utility for instantiating various types of connector classes in the PolicySynth agent framework. It provides static methods to create connectors for documents, spreadsheets, notifications, ideas collaboration, voting collaboration, and sub-agents, based on the connector class type and configuration. It also provides utility methods to retrieve connectors from an agent instance.

**File:** `@policysynth/agents/connectors/base/connectorFactory.js`

---

## Properties

This class does not define instance properties, but inherits from `PolicySynthAgentBase` (which may provide logging and other base functionality).

---

## Methods

| Name                                   | Parameters                                                                                                                                                                                                                                    | Return Type                                   | Description                                                                                                 |
|---------------------------------------- |-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| `createConnector`                      | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any`                                                                                                                        | `PsBaseConnectorTypes \| null`                | Factory method to create a connector instance based on the connector class type.                            |
| `createDocumentConnector`              | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any`                                                                                                                        | `PsBaseDocumentConnector \| null`             | Creates a document connector (e.g., Google Docs).                                                           |
| `createSheetConnector`                 | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any`                                                                                                                        | `PsBaseSheetConnector \| null`                | Creates a spreadsheet connector (e.g., Google Sheets).                                                      |
| `createNotificationsConnector`         | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any`                                                                                                                        | `PsBaseNotificationsConnector \| null`        | Creates a notifications/chat connector (e.g., Discord).                                                     |
| `createIdeasCollaborationConnector`    | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any`                                                                                                                        | `PsBaseIdeasCollaborationConnector \| null`   | Creates an ideas collaboration connector (e.g., Your Priorities).                                           |
| `createVotingCollaborationConnector`   | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any`                                                                                                                        | `PsBaseVotingCollaborationConnector \| null`  | Creates a voting collaboration connector (e.g., All Our Ideas).                                             |
| `createSubAgentsConnector`             | `connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory: any`                                                                                                                        | `PsSubAgentsConnector`                        | Creates a sub-agents connector.                                                                             |
| `getConnector`                         | `agent: PsAgent, memory: any, connectorType: PsConnectorClassTypes, isInput: boolean = true`                                                                                                                                                | `PsBaseConnectorTypes \| null`                | Retrieves a single connector of the specified type from the agent (input or output).                        |
| `getAllConnectors`                     | `agent: PsAgent, memory: any, connectorType: PsConnectorClassTypes, isInput: boolean = true`                                                                                                                                                | `PsBaseConnectorTypes[]`                      | Retrieves all connectors of the specified type from the agent (input or output).                            |

---

## Connector Types

The following connector base types are supported by the factory:

- `PsBaseDocumentConnector`
- `PsBaseSheetConnector`
- `PsBaseNotificationsConnector`
- `PsBaseVotingCollaborationConnector`
- `PsBaseIdeasCollaborationConnector`
- `PsSubAgentsConnector`

---

## Example

```typescript
import { PsConnectorFactory } from '@policysynth/agents/connectors/base/connectorFactory.js';
import { PsConnectorClassTypes } from '@policysynth/agents/connectorTypes.js';

// Example agent, memory, and connector setup (simplified)
const agent: PsAgent = ...; // Your agent instance
const memory: PsBaseMemoryData | undefined = ...;

// Get a Google Docs connector (if present as input connector)
const googleDocsConnector = PsConnectorFactory.getConnector(
  agent,
  memory,
  PsConnectorClassTypes.Document,
  true // isInput
);

if (googleDocsConnector) {
  // Use the connector, e.g., to read or write documents
}

// Get all spreadsheet connectors (e.g., Google Sheets)
const sheetConnectors = PsConnectorFactory.getAllConnectors(
  agent,
  memory,
  PsConnectorClassTypes.Spreadsheet,
  true
);

sheetConnectors.forEach(connector => {
  // Use each sheet connector
});
```

---

## Usage Notes

- The factory uses the `connectorClass.configuration.classType` and `connectorClass.configuration.name` to determine which connector class to instantiate.
- If a connector type or name is not supported, a warning is logged and `null` is returned.
- The `getConnector` and `getAllConnectors` methods help retrieve connectors from an agent's input or output connectors, filtering by type.
- The factory is designed to be extensible: to add support for new connector types, extend the relevant `switch` statements and import the new connector class.

---

## Related Types

- `PsAgentConnectorAttributes`
- `PsAgentConnectorClassAttributes`
- `PsAgent`
- `PsConnectorClassTypes`
- `PsBaseConnectorTypes` (union of all supported connector base classes)
- `PolicySynthAgentBase` (base class for logging and shared functionality)

---

## Extending

To add a new connector type (e.g., Slack, GitHub), import the connector class and add a case to the relevant `switch` statement in the appropriate factory method.

---

## Error Handling

- If an unsupported connector type or name is provided, the factory logs a warning and returns `null`.
- Some connector instantiations are commented out (e.g., Microsoft Word, Slack, GitHub) and can be enabled as needed.

---