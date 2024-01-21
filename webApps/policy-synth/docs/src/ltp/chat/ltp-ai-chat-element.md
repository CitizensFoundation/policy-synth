# LtpAiChatElement

A custom element that represents an AI chat interface, which is part of a larger application. It is responsible for displaying messages, handling user interactions, and rendering suggestions for direct causes and assumptions based on AI responses.

## Properties

| Name                      | Type                                      | Description                                                                                   |
|---------------------------|-------------------------------------------|-----------------------------------------------------------------------------------------------|
| message                   | String                                    | The message content to be displayed.                                                          |
| sender                    | 'you' \| 'bot'                            | The sender of the message, indicating whether it's from the user or the bot.                  |
| detectedLanguage          | String                                    | The language detected for the message.                                                        |
| parentNodeId              | String                                    | The ID of the parent node in the conversation tree.                                           |
| crtId                     | String \| Number                          | The ID of the current reality tree.                                                           |
| clusterId                 | Number                                    | The ID of the cluster to which the message belongs.                                           |
| type                      | 'start' \| 'error' \| 'moderation_error' \| 'info' \| 'message' \| 'thinking' \| 'noStreaming' \| undefined | The type of message being displayed.                                                          |
| active                    | Boolean                                   | Indicates whether the chat element is active or not.                                          |
| fullReferencesOpen        | Boolean                                   | Indicates whether the full references are open or not.                                        |
| followUpQuestionsRaw      | String                                    | The raw string containing follow-up questions.                                                |
| followUpQuestions         | String[]                                  | An array of follow-up questions parsed from the raw string.                                   |
| refinedCausesSuggestions  | String[] \| undefined                     | An array of refined causes suggestions or undefined if not available.                         |
| jsonLoading               | Boolean                                   | Indicates whether JSON content is currently being loaded.                                     |
| lastChainCompletedAsValid | Boolean                                   | Indicates whether the last chain of actions was completed as valid.                           |
| lastValidateCauses        | String[] \| undefined                     | An array of the last validated causes or undefined if not available.                          |
| isCreatingCauses          | Boolean                                   | Indicates whether the element is currently in the process of creating causes.                 |

## Methods

| Name                    | Parameters | Return Type | Description                                                                                   |
|-------------------------|------------|-------------|-----------------------------------------------------------------------------------------------|
| stopJsonLoading         |            | void        | Stops the JSON loading animation.                                                             |
| handleJsonLoadingStart  |            | void        | Handles the start of JSON loading by setting the `jsonLoading` property to true.              |
| handleJsonLoadingEnd    | event: any | void        | Handles the end of JSON loading by parsing the JSON content and updating suggestions.         |
| addSelected             |            | Promise<void> | Adds the selected causes and assumptions to the conversation tree.                            |
| isError                 |            | Boolean     | Determines if the current message type is an error or moderation error.                       |
| renderCGImage           |            | TemplateResult | Renders the image for the chatbot.                                                           |
| renderRoboImage         |            | TemplateResult | Renders the image for the user.                                                              |
| renderRefinedSuggestions|            | TemplateResult \| typeof nothing | Renders the refined suggestions for direct causes and assumptions.                           |
| renderChatGPT           |            | TemplateResult | Renders the chat interface for the bot's messages, including refined suggestions.            |
| parseFollowUpQuestions  |            | void        | Parses the raw follow-up questions string and populates the `followUpQuestions` array.       |
| getThinkingText         |            | String      | Returns the localized text for the 'Thinking...' status based on the detected language.       |
| renderUser              |            | TemplateResult | Renders the chat interface for the user's messages.                                          |
| renderNoStreaming       |            | TemplateResult | Renders the interface when there is no streaming activity.                                   |
| renderThinking          |            | TemplateResult | Renders the interface for the 'Thinking...' status with an optional progress ring.           |
| renderMessage           |            | TemplateResult | Renders the appropriate message interface based on the sender and message type.              |

## Events (if any)

- **jsonLoadingStart**: Emitted when JSON loading starts.
- **jsonLoadingEnd**: Emitted when JSON loading ends with the JSON content.
- **add-nodes**: Emitted when new nodes are added to the conversation tree.
- **close-add-cause-dialog**: Emitted to close the add cause dialog.
- **validate-selected-causes**: Emitted to validate the selected causes.
- **scroll-down-enabled**: Emitted to enable scrolling down in the chat interface.
- **followup-question**: Emitted when a follow-up question is selected.

## Examples

```typescript
// Example usage of the LtpAiChatElement
const chatElement = document.createElement('ltp-ai-chat-element');
chatElement.message = 'Hello, how can I help you today?';
chatElement.sender = 'bot';
chatElement.detectedLanguage = 'en';
chatElement.type = 'message';
document.body.appendChild(chatElement);
```

Note: The above example demonstrates how to create and use the `LtpAiChatElement` in a web page. The actual implementation details such as event handling and dynamic updates would depend on the larger application context in which this element is used.