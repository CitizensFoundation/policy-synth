# LtpStreamingAIResponse

This class handles the WebSocket connection for streaming AI responses. It manages the connection, receives messages, and updates the target container with the received data.

## Properties

| Name             | Type                                             | Description                                                                 |
|------------------|--------------------------------------------------|-----------------------------------------------------------------------------|
| wsClientId       | string                                           | The unique client ID for the WebSocket connection.                          |
| targetContainer  | HTMLElement \| HTMLInputElement \| undefined     | The container where the streamed data will be displayed.                    |
| caller           | YpBaseElement                                    | The element that initiated the streaming.                                   |
| api              | LtpServerApi                                     | An instance of the LtpServerApi class.                                      |
| ws               | WebSocket                                        | The WebSocket connection instance.                                          |
| isActive         | boolean                                          | Indicates whether the streaming is currently active.                        |

## Methods

| Name       | Parameters                                      | Return Type         | Description                                                                 |
|------------|-------------------------------------------------|---------------------|-----------------------------------------------------------------------------|
| close      |                                                 | void                | Closes the WebSocket connection and sets `isActive` to false.               |
| connect    |                                                 | Promise<string>     | Initiates the WebSocket connection and returns a promise with the client ID.|
| onWsOpen   | event: Event, resolve: (wsClientId: string) => void | void                | Handles the WebSocket 'open' event and sets up the initial message handler. |
| onMessage  | event: MessageEvent                             | void                | Handles incoming WebSocket messages and updates the target container.       |

## Events

- **wsMessage**: Emitted when a WebSocket message is received, providing the message data and the WebSocket client ID.

## Examples

```typescript
// Example usage of the LtpStreamingAIResponse class
const callerElement = new YpBaseElement();
const target = document.getElementById('streaming-container');
const streamingAIResponse = new LtpStreamingAIResponse(callerElement, target);

// Connect to the WebSocket server
streamingAIResponse.connect().then(clientId => {
  console.log(`Connected with client ID: ${clientId}`);
}).catch(error => {
  console.error('Connection failed:', error);
});

// Close the WebSocket connection when done
streamingAIResponse.close();
```

Note: The example assumes that there is an HTML element with the ID 'streaming-container' in the DOM.