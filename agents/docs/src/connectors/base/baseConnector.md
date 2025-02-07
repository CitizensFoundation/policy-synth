# PsBaseConnector

The `PsBaseConnector` is an abstract class that extends the `PolicySynthAgent`. It serves as a base class for creating connectors in the PolicySynth framework. Connectors are used to interface with external systems or services.

## Properties

| Name            | Type                                  | Description                                      |
|-----------------|---------------------------------------|--------------------------------------------------|
| connector       | `PsAgentConnectorAttributes`          | The connector attributes associated with this instance. |
| connectorClass  | `PsAgentConnectorClassAttributes`     | The class attributes of the connector.           |
| skipAiModels    | `boolean`                             | A flag to skip AI models, default is `true`.     |

## Constructor

The constructor initializes a new instance of the `PsBaseConnector` class.

### Parameters

- `connector: PsAgentConnectorAttributes` - The connector attributes.
- `connectorClass: PsAgentConnectorClassAttributes` - The class attributes of the connector.
- `agent: PsAgent` - The agent associated with this connector.
- `memory: PsAgentMemoryData | undefined` - Optional memory data for the agent.
- `startProgress: number` - The starting progress percentage, default is `0`.
- `endProgress: number` - The ending progress percentage, default is `100`.

## Methods

| Name                             | Parameters                                                                 | Return Type                  | Description                                                                 |
|----------------------------------|----------------------------------------------------------------------------|------------------------------|-----------------------------------------------------------------------------|
| `getConfigurationQuestions`      | -                                                                          | `YpStructuredQuestionData[]` | Returns the configuration questions for the connector.                      |
| `getExtraConfigurationQuestions` | -                                                                          | `YpStructuredQuestionData[]` | Returns additional configuration questions specific to the connector.       |
| `name`                           | -                                                                          | `string`                     | Gets the name of the connector from its configuration.                      |
| `description`                    | -                                                                          | `string`                     | Gets the description of the connector from its configuration.               |
| `getConfig`                      | `uniqueId: string, defaultValue: T`                                        | `T`                          | Retrieves a configuration value by its unique ID, with a default fallback.  |
| `retryOperation`                 | `operation: () => Promise<T>, maxRetries: number = 3, delay: number = 1000` | `Promise<T>`                 | Retries an operation a specified number of times with a delay between attempts. |

## Example

```typescript
import { PsBaseConnector } from '@policysynth/agents/connectors/base/baseConnector.js';
import { PsAgentConnectorAttributes, PsAgentConnectorClassAttributes, PsAgent } from '@policysynth/agents/dbModels/agent.js';

class CustomConnector extends PsBaseConnector {
  constructor(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent) {
    super(connector, connectorClass, agent);
  }

  // Implement custom methods and properties here
}
```

This class provides a foundation for creating connectors by handling common configuration and retry logic, allowing developers to focus on implementing specific connector functionality.