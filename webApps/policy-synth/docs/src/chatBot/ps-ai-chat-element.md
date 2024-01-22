# PsAiChatElement

A custom web component that represents a chat interface for AI conversations, including features like message rendering, follow-up questions, and loading indicators.

## Properties

| Name                   | Type                                      | Description                                                                 |
|------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| message                | String                                    | The message content to be displayed.                                        |
| sender                 | 'you' \| 'bot'                            | The sender of the message, either 'you' for the user or 'bot' for the AI.   |
| detectedLanguage       | String                                    | The language detected in the conversation.                                  |
| clusterId              | Number                                    | An identifier for the cluster of messages or conversation context.          |
| type                   | 'start' \| 'error' \| 'moderation_error' \| 'info' \| 'message' \| 'thinking' \| 'noStreaming' \| undefined | The type of message or status being represented.                            |
| active                 | Boolean                                   | Indicates whether the chat element is active or not.                        |
| fullReferencesOpen     | Boolean                                   | Flag to toggle the visibility of full references.                           |
| followUpQuestionsRaw   | String                                    | Raw string containing follow-up questions, possibly with special markers.   |
| followUpQuestions      | String[]                                  | An array of follow-up questions parsed from the raw string.                 |
| jsonLoading            | Boolean                                   | Indicates whether a JSON content is currently being loaded.                 |
| api                    | BaseChatBotServerApi                      | An instance of the BaseChatBotServerApi for API interactions.               |

## Methods

| Name                     | Parameters | Return Type | Description                                                                 |
|--------------------------|------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback        |            | void        | Lifecycle method that runs when the element is added to the DOM.            |
| disconnectedCallback     |            | void        | Lifecycle method that runs when the element is removed from the DOM.        |
| stopJsonLoading          |            | void        | Method to stop the JSON loading indicator.                                  |
| handleJsonLoadingStart   |            | void        | Event handler for the start of JSON loading.                                |
| handleJsonLoadingEnd     | event: any | void        | Event handler for the end of JSON loading, processes the loaded JSON data.  |
| get styles               |            | CSSResult[] | Static method that returns the styles applied to the chat element.          |
| isError                  |            | Boolean     | Getter that determines if the current message type is an error.             |
| renderCGImage            |            | TemplateResult | Method to render the chatbot's image.                                      |
| renderRoboImage          |            | TemplateResult | Method to render the user's image.                                         |
| renderJson               |            | TemplateResult | Method to render JSON content if applicable.                               |
| renderChatGPT            |            | TemplateResult | Method to render the chatbot's message along with any special content.    |
| parseFollowUpQuestions   |            | void        | Method to parse follow-up questions from the raw string.                    |
| updated                  | changedProperties: Map<string \| number \| symbol, unknown> | void | Lifecycle method that runs when the element's properties change. |
| renderUser               |            | TemplateResult | Method to render the user's message.                                       |
| renderNoStreaming        |            | TemplateResult | Method to render the no streaming status message.                          |
| renderThinking           |            | TemplateResult | Method to render the thinking status message.                              |
| getThinkingText          |            | String      | Method to get the localized thinking text based on the detected language.   |
| renderMessage            |            | TemplateResult | Method to render the appropriate message based on the sender and type.    |
| render                   |            | TemplateResult | Lifecycle method that renders the element's HTML template.                 |

## Events (if any)

- **jsonLoadingStart**: Emitted when JSON loading starts.
- **jsonLoadingEnd**: Emitted when JSON loading ends, with the JSON content details.

## Examples

```typescript
// Example usage of the PsAiChatElement
const chatElement = document.createElement('ps-ai-chat-element');
chatElement.message = 'Hello, how can I help you today?';
chatElement.sender = 'bot';
chatElement.type = 'message';
document.body.appendChild(chatElement);
```

Note: The actual usage of the `PsAiChatElement` would typically involve more complex interactions and handling of events, especially for dynamic conversations with an AI chatbot.