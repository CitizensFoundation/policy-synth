# LtpAiChatElement

`LtpAiChatElement` extends `PsAiChatElement` to provide a custom chat element for the LTP (Logical Thinking Process) application. It includes functionality for handling JSON content related to causes and suggestions, rendering UI components for user interaction, and communicating with the LTP server API for data processing and updates.

## Properties

| Name                      | Type                        | Description                                                                 |
|---------------------------|-----------------------------|-----------------------------------------------------------------------------|
| parentNodeId              | String                      | The ID of the parent node in the current reality tree.                      |
| crtId                     | String \| Number            | The ID of the current reality tree.                                         |
| refinedCausesSuggestions  | String[] \| undefined       | An array of refined causes suggestions.                                     |
| lastChainCompletedAsValid | Boolean                     | Indicates if the last chain of causes was completed as valid.               |
| lastValidateCauses        | String[] \| undefined       | An array of the last validated causes.                                      |
| isCreatingCauses          | Boolean                     | Indicates if the process of creating causes is currently happening.         |
| api                       | LtpServerApi                | An instance of `LtpServerApi` for communicating with the LTP server.       |

## Methods

| Name                | Parameters | Return Type | Description                                                                                   |
|---------------------|------------|-------------|-----------------------------------------------------------------------------------------------|
| handleJsonLoadingEnd| event: any | void        | Handles the end of JSON loading, parsing the JSON content and updating the causes suggestions.|
| addSelected         |            | Promise<void> | Processes the selected causes and assumptions, updating the current reality tree accordingly. |
| isError             |            | Boolean     | Checks if the current type is an error or moderation error.                                   |
| renderJson          |            | TemplateResult | Overrides the `renderJson` method to render the UI components for causes suggestions.        |

## Events

This class does not explicitly define custom events but utilizes inherited events from `PsAiChatElement` and may fire global events for communication with other components.

## Example

```typescript
import '@policysynth/webapp/ltp/chat/ltp-ai-chat-element.js';

// Usage in HTML
<ltp-ai-chat-element parentNodeId="123" crtId="456"></ltp-ai-chat-element>

// Interaction with the element can be done through its public properties and methods.
```

This example demonstrates how to use the `LtpAiChatElement` in an HTML document. The element is imported, and then used within the HTML with its attributes like `parentNodeId` and `crtId` set to interact with the LTP application's current reality tree.