# LtpStreamingAIResponse

This class handles the WebSocket connection for streaming AI responses, managing the connection lifecycle, and updating the target container with incoming message parts.

## Properties

| Name             | Type                                             | Description                                                                 |
|------------------|--------------------------------------------------|-----------------------------------------------------------------------------|
| wsClientId       | string                                           | The unique client identifier for the WebSocket connection.                  |
| targetContainer  | HTMLElement \| HTMLInputElement \| undefined     | The container where incoming message parts are appended.                    |
| caller           | YpBaseElement                                    | The element that initiated the streaming AI response.                       |
| api              | LtpServerApi                                     | An instance of the LtpServerApi class for server communication.             |
| ws               | WebSocket                                        | The WebSocket connection instance.                                          |
| isActive         | boolean                                          | Indicates whether the WebSocket connection is currently active.             |

## Methods

| Name       | Parameters                                      | Return Type | Description                                                                 |
|------------|-------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor| caller: YpBaseElement, targetContainer: HTMLElement \| HTMLInputElement \| undefined | none        | Initializes the class with the caller and optional target container.        |
| close      | none                                            | void        | Closes the WebSocket connection and sets isActive to false.                 |
| connect    | none                                            | Promise<string> | Establishes the WebSocket connection and returns a promise with the client ID. |
| onWsOpen   | event: Event, resolve: (wsClientId: string) => void | void        | Handles the WebSocket 'open' event and sets up the initial message handler. |
| onMessage  | event: MessageEvent                             | void        | Handles incoming WebSocket messages and updates the target container.       |

## Events

- **wsMessage**: Emitted when a WebSocket message is received, containing the message data and the WebSocket client ID.

## Examples

```typescript
// Example usage of the LtpStreamingAIResponse class
const callerElement = new YpBaseElement();
const target = document.getElementById('message-container');

const streamingAIResponse = new LtpStreamingAIResponse(callerElement, target);

streamingAIResponse.connect().then((clientId) => {
  console.log(`Connected with client ID: ${clientId}`);
});

// Later, when you want to close the connection
streamingAIResponse.close();
```

Note: The example assumes that `YpBaseElement` is a class that exists in the context where this example is run and that an element with the ID 'message-container' exists in the DOM.