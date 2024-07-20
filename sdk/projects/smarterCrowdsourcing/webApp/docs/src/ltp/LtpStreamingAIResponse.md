# LtpStreamingAIResponse

This class is responsible for handling the streaming AI response. It manages the WebSocket connection to receive real-time data and updates the target container with the received data.

## Properties

| Name             | Type                                              | Description                                                                 |
|------------------|---------------------------------------------------|-----------------------------------------------------------------------------|
| wsClientId       | string                                            | The WebSocket client ID.                                                    |
| targetContainer  | HTMLElement \| HTMLInputElement \| undefined      | The container where the streaming data will be displayed.                   |
| caller           | YpBaseElement                                     | The element that initiated the streaming.                                   |
| api              | LtpServerApi                                      | An instance of the LtpServerApi to interact with the server.                |
| ws               | WebSocket                                         | The WebSocket connection.                                                   |
| isActive         | boolean                                           | Indicates whether the streaming is active.                                  |

## Methods

| Name       | Parameters                                        | Return Type       | Description                                                                                   |
|------------|---------------------------------------------------|-------------------|-----------------------------------------------------------------------------------------------|
| constructor| caller: YpBaseElement, targetContainer: HTMLElement \| HTMLInputElement \| undefined = undefined |                   | Initializes the class with the caller and optionally a target container for displaying data. |
| close      |                                                   | void              | Closes the WebSocket connection and marks the streaming as inactive.                          |
| connect    |                                                   | Promise<string>   | Opens a WebSocket connection and returns a promise that resolves with the WebSocket client ID.|
| onWsOpen   | event: Event, resolve: (wsClientId: string) => void | void              | Handles the WebSocket 'open' event and sets up the initial message handler.                   |
| onMessage  | event: MessageEvent                               | void              | Handles incoming WebSocket messages and updates the target container with the data.           |

## Events

- `wsMessage`: Fired when a WebSocket message is received. It passes the received data and the WebSocket client ID to the caller.

## Example

```typescript
import { LtpStreamingAIResponse } from '@policysynth/webapp/ltp/LtpStreamingAIResponse.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';

// Assuming `caller` is an instance of YpBaseElement and `targetContainer` is a valid HTMLElement or HTMLInputElement
const streamingAIResponse = new LtpStreamingAIResponse(caller, targetContainer);

// To connect and start receiving data
streamingAIResponse.connect().then((wsClientId) => {
  console.log(`Connected with WebSocket client ID: ${wsClientId}`);
});

// To close the connection
streamingAIResponse.close();
```

This example demonstrates how to instantiate the `LtpStreamingAIResponse` class, connect to the WebSocket server to start receiving streaming data, and how to close the connection.