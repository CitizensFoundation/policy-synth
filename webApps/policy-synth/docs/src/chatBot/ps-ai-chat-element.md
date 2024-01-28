# PsAiChatElement

This class extends `YpBaseElement` to create a custom chat element for AI interactions. It handles the rendering of messages, loading states, and follow-up questions within a chat interface.

## Properties

| Name                  | Type                                      | Description                                                                 |
|-----------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| message               | String                                    | The message content to be displayed.                                        |
| updateMessage         | String                                    | An additional message to be displayed, often used for updates.              |
| sender                | 'you' \| 'bot'                            | Indicates the sender of the message.                                        |
| detectedLanguage      | String                                    | The language detected in the message content.                               |
| clusterId             | Number                                    | An identifier for the cluster to which the message belongs.                 |
| type                  | 'start' \| 'error' \| 'moderation_error' \| 'info' \| 'message' \| 'thinking' \| 'noStreaming' \| undefined | The type of message being displayed.                                        |
| spinnerActive         | Boolean                                   | Indicates whether a loading spinner should be active.                       |
| fullReferencesOpen    | Boolean                                   | Indicates whether full references are open or not.                          |
| followUpQuestionsRaw  | String                                    | A raw string containing follow-up questions.                                |
| followUpQuestions     | String[]                                  | An array of follow-up questions parsed from `followUpQuestionsRaw`.         |
| jsonLoading           | Boolean                                   | Indicates whether JSON content is currently being loaded.                   |
| api                   | BaseChatBotServerApi                      | An instance of `BaseChatBotServerApi` for API interactions.                 |

## Methods

| Name                    | Parameters                          | Return Type | Description                                                                 |
|-------------------------|-------------------------------------|-------------|-----------------------------------------------------------------------------|
| stopJsonLoading         |                                     | void        | Stops the JSON loading process.                                             |
| handleJsonLoadingStart  |                                     | void        | Handles the start of the JSON loading process.                              |
| handleJsonLoadingEnd    | event: any                          | void        | Handles the end of the JSON loading process, parsing the JSON content.      |
| isError                 |                                     | boolean     | Checks if the current message type is an error.                             |
| renderCGImage           |                                     | TemplateResult | Renders the ChatGPT image.                                                  |
| renderRoboImage         |                                     | TemplateResult | Renders the robot image.                                                    |
| renderJson              |                                     | TemplateResult | Renders JSON content.                                                       |
| renderChatGPT           |                                     | TemplateResult | Renders the ChatGPT dialog.                                                 |
| parseFollowUpQuestions  |                                     | void        | Parses follow-up questions from the raw string.                             |
| renderUser              |                                     | TemplateResult | Renders the user's message dialog.                                          |
| renderNoStreaming       |                                     | TemplateResult | Renders the no streaming message.                                           |
| renderThinking          |                                     | TemplateResult | Renders the thinking message.                                               |
| getThinkingText         |                                     | String      | Returns the thinking text based on the detected language.                   |
| renderMessage           |                                     | TemplateResult | Renders the appropriate message based on the sender and type.               |

## Events

No custom events are documented.

## Example

```typescript
import '@policysynth/webapp/chatBot/ps-ai-chat-element.js';

// Usage in a LitElement template
html`
  <ps-ai-chat-element
    .message=${"Hello, how can I assist you today?"}
    .sender=${"bot"}
    .type=${"message"}
  ></ps-ai-chat-element>
`;
```

This example demonstrates how to use the `ps-ai-chat-element` in a LitElement-based project. It shows setting the message, sender, and type properties to render a bot message within the custom chat element.