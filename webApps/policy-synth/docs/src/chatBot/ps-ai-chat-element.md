# PsAiChatElement

The `PsAiChatElement` is a custom web component that extends `YpBaseElement` to provide a chat interface for AI-driven conversations. It supports various message types, including errors, information, and follow-up questions.

## Properties

| Name                   | Type                                  | Description                                                                 |
|------------------------|---------------------------------------|-----------------------------------------------------------------------------|
| message                | String                                | The message content to be displayed.                                        |
| sender                 | 'you' \| 'bot'                        | The sender of the message, either 'you' for the user or 'bot' for the AI.   |
| detectedLanguage       | String                                | The language detected in the conversation.                                  |
| clusterId              | Number                                | An identifier for the cluster of messages.                                  |
| type                   | 'start' \| 'error' \| 'moderation_error' \| 'info' \| 'message' \| 'thinking' \| 'noStreaming' \| undefined | The type of message being displayed.                                        |
| active                 | Boolean                               | Indicates whether the chat element is active.                               |
| fullReferencesOpen     | Boolean                               | Indicates whether full references are open.                                 |
| followUpQuestionsRaw   | String                                | Raw string containing follow-up questions.                                  |
| followUpQuestions      | String[]                              | An array of follow-up questions parsed from `followUpQuestionsRaw`.        |
| jsonLoading            | Boolean                               | Indicates whether JSON content is currently being loaded.                   |
| api                    | BaseChatBotServerApi                  | An instance of `BaseChatBotServerApi` for API interactions.                 |

## Methods

| Name                    | Parameters | Return Type | Description                                                                 |
|-------------------------|------------|-------------|-----------------------------------------------------------------------------|
| stopJsonLoading         |            | void        | Stops the JSON loading indicator.                                            |
| handleJsonLoadingStart  |            | void        | Handles the start of JSON loading, setting the loading state to true.       |
| handleJsonLoadingEnd    | event: any | void        | Handles the end of JSON loading, parsing the JSON content if possible.      |
| isError                 |            | Boolean     | Determines if the current message type is an error.                          |
| renderCGImage           |            | TemplateResult | Renders the ChatGPT image icon.                                             |
| renderRoboImage         |            | TemplateResult | Renders the user image icon.                                                |
| renderJson              |            | TemplateResult | Renders JSON content if applicable.                                         |
| renderChatGPT           |            | TemplateResult | Renders the ChatGPT dialog with the message and any follow-up questions.    |
| parseFollowUpQuestions  |            | void        | Parses the raw follow-up questions string and populates the questions array.|
| updated                 | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method called after the element’s properties have changed.       |
| renderUser              |            | TemplateResult | Renders the user's message dialog.                                          |
| renderNoStreaming       |            | TemplateResult | Renders the no streaming state with an active indicator or done icon.       |
| renderThinking          |            | TemplateResult | Renders the thinking state with an active indicator or done icon.           |
| getThinkingText         |            | String      | Retrieves the localized text for the thinking state.                        |
| renderMessage           |            | TemplateResult | Renders the appropriate message dialog based on the sender and type.        |
| render                  |            | TemplateResult | The main render method for the chat element.                                |

## Events (if any)

- **jsonLoadingStart**: Emitted when JSON loading starts.
- **jsonLoadingEnd**: Emitted when JSON loading ends, with the JSON content as detail.

## Examples

```typescript
// Example usage of the PsAiChatElement
const chatElement = document.createElement('ps-ai-chat-element');
chatElement.message = 'Hello, how can I help you?';
chatElement.sender = 'bot';
chatElement.type = 'message';
document.body.appendChild(chatElement);
```

Note: The `PsAiChatElement` component includes a variety of internal methods and properties for handling chat interactions, JSON content loading, and rendering different types of messages. It also includes a comprehensive set of styles for its visual appearance.