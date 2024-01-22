# LtpStreamingAIResponse

This class handles the WebSocket connection for streaming AI responses. It manages the connection, receives messages, and updates the target container with the received data.

## Properties

| Name             | Type                                      | Description                                           |
|------------------|-------------------------------------------|-------------------------------------------------------|
| wsClientId       | string                                    | The unique client ID for the WebSocket connection.    |
| targetContainer  | HTMLElement \| HTMLInputElement \| undefined | The container where the streamed data will be displayed. |
| caller           | YpBaseElement                             | The element that initiated the streaming.             |
| api              | LtpServerApi                              | An instance of the server API for communication.      |
| ws               | WebSocket                                 | The WebSocket connection instance.                    |
| isActive         | boolean                                   | Indicates whether the streaming is active.            |

## Methods

| Name       | Parameters                                      | Return Type         | Description                                                                 |
|------------|-------------------------------------------------|---------------------|-----------------------------------------------------------------------------|
| constructor | caller: YpBaseElement, targetContainer: HTMLElement \| HTMLInputElement \| undefined = undefined |                     | Initializes the class with the caller and optional target container.        |
| close      |                                                 | void                | Closes the WebSocket connection and sets `isActive` to false.               |
| connect    |                                                 | Promise<string>     | Opens a WebSocket connection and returns a promise that resolves with the client ID. |
| onWsOpen   | event: Event, resolve: (wsClientId: string) => void | void                | Handles the WebSocket 'open' event and sets up the initial message handler. |
| onMessage  | event: MessageEvent                             | void                | Handles incoming WebSocket messages and updates the target container.       |

## Events

- **wsMessage**: Emitted when a WebSocket message is received. The event detail includes the message data and the WebSocket client ID.

## Examples

```typescript
// Example usage of LtpStreamingAIResponse
const callerElement = new YpBaseElement();
const target = document.getElementById('streaming-container');
const streamingAIResponse = new LtpStreamingAIResponse(callerElement, target);

streamingAIResponse.connect().then((clientId) => {
  console.log(`Connected with client ID: ${clientId}`);
}).catch((error) => {
  console.error('Connection failed:', error);
});

// Later, when you want to close the connection
streamingAIResponse.close();
```

Note: The above example assumes that `YpBaseElement` is a class that exists in the context where this example is run and that it has a method `fire` to emit custom events.