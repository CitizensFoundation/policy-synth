# BaseChatBotServerApi

The `BaseChatBotServerApi` class extends the `YpServerApi` class to provide API functionalities specific to a chatbot server. It sets a base path for long-term processes (LTP) and allows for the customization of the base URL path for API requests.

## Properties

| Name         | Type   | Description                                      |
|--------------|--------|--------------------------------------------------|
| baseLtpPath  | string | The base path for long-term processes (LTP).     |
| baseUrlPath  | string | The base URL path for API requests.              |

## Methods

This class does not define additional methods beyond those inherited from `YpServerApi`.

## Events

There are no events defined for this class.

## Examples

```typescript
// Example usage of BaseChatBotServerApi
const chatBotApi = new BaseChatBotServerApi('/custom-api-path');
```