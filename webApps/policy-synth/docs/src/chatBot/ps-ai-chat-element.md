# PsAiChatElement

This class extends `YpBaseElement` to create a custom chat element for AI interactions. It manages the display of messages, loading states, and follow-up questions within a chat interface.

## Properties

| Name                  | Type                                              | Description                                                                 |
|-----------------------|---------------------------------------------------|-----------------------------------------------------------------------------|
| message               | String                                            | The message to be displayed.                                                |
| updateMessage         | String                                            | An additional message that can be updated dynamically.                      |
| sender                | 'you' \| 'bot'                                    | Indicates the sender of the message.                                        |
| detectedLanguage      | String                                            | The language detected in the message.                                       |
| clusterId             | Number                                            | An identifier for the cluster of messages or interactions.                   |
| type                  | 'start' \| 'error' \| 'moderation_error' \| 'info' \| 'message' \| 'thinking' \| 'noStreaming' \| undefined | The type of message or state being represented.                             |
| active                | Boolean                                           | Indicates whether the chat element is active.                               |
| fullReferencesOpen    | Boolean                                           | Indicates whether full references are open for display.                     |
| followUpQuestionsRaw  | String                                            | A raw string containing follow-up questions.                                |
| followUpQuestions     | String[]                                          | An array of follow-up questions parsed from `followUpQuestionsRaw`.         |
| jsonLoading           | Boolean                                           | Indicates whether JSON content is currently being loaded.                   |
| api                   | BaseChatBotServerApi                              | An instance of `BaseChatBotServerApi` for API interactions.                 |

## Methods

| Name                    | Parameters | Return Type | Description                                                                 |
|-------------------------|------------|-------------|-----------------------------------------------------------------------------|
| stopJsonLoading         |            | void        | Stops the JSON loading indicator.                                           |
| handleJsonLoadingStart  |            | void        | Handles the start of JSON loading, setting `jsonLoading` to true.           |
| handleJsonLoadingEnd    | event: any | void        | Handles the end of JSON loading, parsing the JSON content if possible.      |
| isError                 |            | boolean     | Checks if the current message type is an error.                             |
| renderCGImage           |            | TemplateResult | Renders the ChatGPT image icon.                                           |
| renderRoboImage         |            | TemplateResult | Renders the robot image icon.                                             |
| renderJson              |            | TemplateResult | Renders JSON content, if any.                                             |
| renderChatGPT           |            | TemplateResult | Renders the ChatGPT dialog container and its content.                     |
| parseFollowUpQuestions  |            | void        | Parses follow-up questions from the raw string and updates the array.       |
| renderUser              |            | TemplateResult | Renders the user's message dialog.                                        |
| renderNoStreaming       |            | TemplateResult | Renders the no streaming state with appropriate indicators.               |
| renderThinking          |            | TemplateResult | Renders the thinking state with appropriate indicators.                   |
| getThinkingText         |            | String      | Returns the localized text for the thinking state based on detected language. |
| renderMessage           |            | TemplateResult | Renders the appropriate message dialog based on sender and type.          |

## Events

No custom events are defined in this class.

## Example

```typescript
import '@policysynth/webapp/chatBot/ps-ai-chat-element.js';

// Usage in HTML
<ps-ai-chat-element
  message="Hello, how can I assist you today?"
  sender="bot"
  type="message"
></ps-ai-chat-element>
```

This example demonstrates how to use the `ps-ai-chat-element` in an HTML document to display a message from the bot.