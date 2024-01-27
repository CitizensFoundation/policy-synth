# LtpAiChatElement

`LtpAiChatElement` extends `PsAiChatElement` to provide a custom chat element for handling and displaying refined causes suggestions, managing JSON content loading, and interacting with the LtpServerApi for adding selected causes and assumptions.

## Properties

| Name                      | Type                             | Description                                                                 |
|---------------------------|----------------------------------|-----------------------------------------------------------------------------|
| parentNodeId              | String                           | The ID of the parent node in the current reality tree.                      |
| crtId                     | String \| Number                 | The ID of the current reality tree.                                         |
| refinedCausesSuggestions  | String[] \| undefined            | An array of refined causes suggestions.                                     |
| lastChainCompletedAsValid | Boolean                          | Indicates if the last chain of actions was completed as valid.              |
| lastValidateCauses        | String[] \| undefined            | An array of the last validated causes.                                      |
| isCreatingCauses          | Boolean                          | Indicates if the process of creating causes is currently happening.         |
| api                       | LtpServerApi                     | An instance of `LtpServerApi` for interacting with the server API.         |

## Methods

| Name                 | Parameters | Return Type | Description                                                                                   |
|----------------------|------------|-------------|-----------------------------------------------------------------------------------------------|
| handleJsonLoadingEnd | event: any | void        | Handles the end of JSON loading, parsing the JSON content and updating refined causes suggestions. |
| addSelected          |            | Promise<void> | Adds the selected causes and assumptions to the current reality tree.                        |
| isError              |            | Boolean     | Checks if the current type is an error or moderation error.                                   |
| renderJson           |            | TemplateResult | Overrides the `renderJson` method to render the refined causes suggestions.                  |

## Events

This class does not explicitly define custom events but may fire inherited events from `PsAiChatElement`.

## Example

```typescript
import '@policysynth/webapp/ltp/chat/ltp-ai-chat-element.js';

// Usage within a LitElement render method
render() {
  return html`
    <ltp-ai-chat-element
      .parentNodeId="${this.parentNodeId}"
      .crtId="${this.crtId}"
      .refinedCausesSuggestions="${this.refinedCausesSuggestions}"
      .lastChainCompletedAsValid="${this.lastChainCompletedAsValid}"
      .lastValidateCauses="${this.lastValidateCauses}"
      .isCreatingCauses="${this.isCreatingCauses}"
    ></ltp-ai-chat-element>
  `;
}
```

This example demonstrates how to use the `ltp-ai-chat-element` in a LitElement-based component, passing properties such as `parentNodeId`, `crtId`, `refinedCausesSuggestions`, `lastChainCompletedAsValid`, `lastValidateCauses`, and `isCreatingCauses` to manage the interaction with the current reality tree and the display of refined causes suggestions.