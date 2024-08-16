# PsAiChatElement

This class extends `YpBaseElement` to create a custom chat element for AI interactions. It manages the display of messages, loading states, and the rendering of different message types such as errors, information, and follow-up questions.

## Properties

| Name                  | Type                                  | Description |
|-----------------------|---------------------------------------|-------------|
| message               | `string`                              | The message content to be displayed. |
| wsMessage             | `PsAiChatWsMessage`                   | WebSocket message object. |
| updateMessage         | `string`                              | An additional message to be displayed, typically used for updates. |
| sender                | `'you' \| 'bot'`                      | Indicates the sender of the message. |
| detectedLanguage      | `string`                              | The language detected in the message. |
| clusterId             | `number`                              | Identifier for the cluster from which the message originates. |
| type                  | `'start' \| 'error' \| 'moderation_error' \| 'info' \| 'welcomeMessage' \| 'message' \| 'thinking' \| 'noStreaming' \| undefined` | The type of message being displayed. |
| spinnerActive         | `boolean`                             | Indicates whether a loading spinner should be active. |
| fullReferencesOpen    | `boolean`                             | Flag to toggle the visibility of full references. |
| followUpQuestionsRaw  | `string`                              | Raw string containing follow-up questions. |
| followUpQuestions     | `string[]`                            | An array of follow-up questions parsed from `followUpQuestionsRaw`. |
| jsonLoading           | `boolean`                             | Indicates whether JSON content is currently being loaded. |
| api                   | `BaseChatBotServerApi`                | An instance of `BaseChatBotServerApi` for API interactions. |

## Methods

| Name                    | Parameters        | Return Type | Description |
|-------------------------|-------------------|-------------|-------------|
| stopJsonLoading         |                   | `void`      | Stops the JSON loading process. |
| handleJsonLoadingStart  |                   | `void`      | Handles the start of JSON loading. |
| handleJsonLoadingEnd    | `event: any`      | `void`      | Handles the end of JSON loading, parsing the JSON content. |
| isError                 |                   | `boolean`   | Checks if the current message type is an error. |
| renderCGImage           |                   | `TemplateResult` | Renders the ChatGPT image. |
| renderRoboImage         |                   | `TemplateResult` | Renders the robot image. |
| renderJson              |                   | `TemplateResult` | Renders JSON content. |
| renderInfo              |                   | `TemplateResult` | Renders information based on WebSocket message data. |
| shortenText             | `text: string, maxLength: number` | `string` | Shortens a given text to a specified maximum length. |
| capitalizeFirstLetter   | `text: string`    | `string`   | Capitalizes the first letter of a given text. |
| stripDomainForFacIcon   | `url: string`     | `string`   | Extracts the domain from a URL for favicon purposes. |
| renderChatGPT           |                   | `TemplateResult` | Renders the ChatGPT dialog. |
| parseFollowUpQuestions  |                   | `void`      | Parses follow-up questions from a raw string. |
| renderUser              |                   | `TemplateResult` | Renders the user's message. |
| renderNoStreaming       |                   | `TemplateResult` | Renders the no streaming message. |
| renderThinking          |                   | `TemplateResult` | Renders the thinking message. |
| getThinkingText         |                   | `string`    | Returns the thinking text based on the detected language. |
| renderMessage           |                   | `TemplateResult` | Renders the message based on the sender and message type. |

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
    .sender=${"you"}
    .type=${"message"}
  ></ps-ai-chat-element>
`;
```

This example demonstrates how to use the `ps-ai-chat-element` in a LitElement-based project. It sets the message, sender, and type properties to display a simple message from the user.