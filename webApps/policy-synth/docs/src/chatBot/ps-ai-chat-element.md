# PsAiChatElement

This class extends `YpBaseElement` to create a custom chat element for AI interactions. It handles the display of messages, loading states, and follow-up questions within a chat interface.

## Properties

| Name                  | Type                                              | Description                                                                 |
|-----------------------|---------------------------------------------------|-----------------------------------------------------------------------------|
| message               | String                                            | The message to be displayed.                                                |
| updateMessage         | String                                            | An additional message that can be updated dynamically.                      |
| sender                | 'you' \| 'bot'                                    | The sender of the message. Can be either 'you' or 'bot'.                    |
| detectedLanguage      | String                                            | The language detected in the message.                                       |
| clusterId             | Number                                            | The ID of the cluster associated with the message.                          |
| type                  | 'start' \| 'error' \| 'moderation_error' \| 'info' \| 'message' \| 'thinking' \| 'noStreaming' \| undefined | The type of message being displayed.                                        |
| active                | Boolean                                           | Indicates whether the chat element is active.                               |
| fullReferencesOpen    | Boolean                                           | Indicates whether full references are open.                                 |
| followUpQuestionsRaw  | String                                            | Raw string containing follow-up questions.                                  |
| followUpQuestions     | String[]                                          | An array of follow-up questions parsed from `followUpQuestionsRaw`.         |
| jsonLoading           | Boolean                                           | Indicates whether JSON content is currently loading.                        |

## Methods

| Name                    | Parameters | Return Type | Description                                                                 |
|-------------------------|------------|-------------|-----------------------------------------------------------------------------|
| stopJsonLoading         |            | void        | Stops the JSON loading animation.                                           |
| handleJsonLoadingStart  |            | void        | Handles the start of JSON loading, setting `jsonLoading` to true.          |
| handleJsonLoadingEnd    | event: any | void        | Handles the end of JSON loading, parsing the JSON content if possible.     |
| isError                 |            | boolean     | Checks if the current message type is an error.                             |
| renderCGImage           |            | TemplateResult | Renders the CG image icon.                                                  |
| renderRoboImage         |            | TemplateResult | Renders the robot image icon.                                               |
| renderJson              |            | TemplateResult | Renders JSON content.                                                       |
| renderChatGPT           |            | TemplateResult | Renders the ChatGPT dialog with the message and optional follow-up questions. |
| parseFollowUpQuestions  |            | void        | Parses follow-up questions from the raw string.                            |
| renderUser              |            | TemplateResult | Renders the user's message dialog.                                          |
| renderNoStreaming       |            | TemplateResult | Renders the no streaming message or icon.                                   |
| renderThinking          |            | TemplateResult | Renders the thinking animation or done icon.                                |
| getThinkingText         |            | String      | Returns the thinking text based on the detected language.                   |
| renderMessage           |            | TemplateResult | Renders the appropriate message based on the sender and type.               |

## Events

- `jsonLoadingStart`: Fired when JSON loading starts.
- `jsonLoadingEnd`: Fired when JSON loading ends, with the JSON content as detail.

## Example

```typescript
import '@policysynth/webapp/chatBot/ps-ai-chat-element.js';

// Usage in a LitElement template
html`
  <ps-ai-chat-element
    .message=${"Hello, World!"}
    .sender=${"bot"}
    .type=${"message"}
    .active=${true}
  ></ps-ai-chat-element>
`;
```

This example demonstrates how to use the `ps-ai-chat-element` in a LitElement template, setting the message, sender, type, and active state.