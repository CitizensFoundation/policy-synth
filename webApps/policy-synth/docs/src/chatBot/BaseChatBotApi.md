# BaseChatBotServerApi

The `BaseChatBotServerApi` class extends the `YpServerApi` class to provide a base API for chatbot services. It sets a default base path for long-term processes (LTP) and allows for a custom API base URL path.

## Properties

| Name         | Type   | Description                                      |
|--------------|--------|--------------------------------------------------|
| baseLtpPath  | string | The base path for long-term processes (LTP).     |
| baseUrlPath  | string | The base URL path for the API endpoints.         |

## Methods

This class does not define any new methods beyond those inherited from `YpServerApi`.

## Examples

```typescript
// Example usage of BaseChatBotServerApi
const chatBotApi = new BaseChatBotServerApi('/custom/api/path');
```