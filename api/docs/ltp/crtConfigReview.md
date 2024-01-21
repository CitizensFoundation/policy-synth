# OpenAI

This class provides methods to interact with the OpenAI API.

## Properties

| Name     | Type   | Description               |
|----------|--------|---------------------------|
| config   | object | Configuration for OpenAI. |

## Methods

| Name                    | Parameters                                       | Return Type | Description                                                                 |
|-------------------------|--------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| renderUserPrompt        | crt: LtpCurrentRealityTreeData                   | string      | Generates a user prompt string based on the current reality tree data.      |
| renderSystemPrompt      | None                                             | string      | Generates a system prompt string for setting up a context and UDEs.         |
| getConfigurationReview  | crt: LtpCurrentRealityTreeData, clientId: string, wsClients: Map<string, WebSocket> | Promise<void> | Initiates a review process for the current reality tree configuration.      |

## Examples

```typescript
// Example usage of the OpenAI class methods
const crtData: LtpCurrentRealityTreeData = {
  context: "Example context",
  undesirableEffects: ["UDE1", "UDE2"]
};

const clientId = uuidv4();
const wsClients = new Map<string, WebSocket>();

// Example of rendering a user prompt
const userPrompt = renderUserPrompt(crtData);
console.log(userPrompt);

// Example of rendering a system prompt
const systemPrompt = renderSystemPrompt();
console.log(systemPrompt);

// Example of initiating a configuration review
await getConfigurationReview(crtData, clientId, wsClients);
```

# LtpCurrentRealityTreeData

This type represents the data structure for the current reality tree.

## Properties

| Name               | Type     | Description                                   |
|--------------------|----------|-----------------------------------------------|
| context            | string   | The context for the current reality tree.     |
| undesirableEffects | string[] | A list of undesirable effects to be reviewed. |

# WebSocket

This class is used to create a WebSocket connection.

## Properties

No properties are documented for the WebSocket class.

## Methods

No methods are documented for the WebSocket class.

## Examples

```typescript
// Example usage of the WebSocket class
const ws = new WebSocket('ws://www.host.com/path');
ws.on('open', function open() {
  ws.send('something');
});
```

Please note that the `WebSocket` class is not fully documented here as it is a standard class from the "ws" library and its usage is well-known. For detailed documentation, refer to the official "ws" library documentation.