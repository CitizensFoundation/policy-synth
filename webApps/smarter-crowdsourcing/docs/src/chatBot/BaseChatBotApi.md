# BaseChatBotServerApi

This class extends the `YpServerApi` to provide functionalities specific to the Base Chat Bot Server API, including setting a base path for API requests.

## Properties

| Name        | Type   | Description                                   |
|-------------|--------|-----------------------------------------------|
| baseLtpPath | string | The base path for LTP (Language Technology Platform) related requests. |

## Methods

| Name       | Parameters         | Return Type | Description |
|------------|--------------------|-------------|-------------|
| constructor| urlPath: string = '/api' | void      | Initializes the BaseChatBotServerApi with an optional URL path for the base URL. |

## Example

```typescript
import { BaseChatBotServerApi } from '@policysynth/webapp/chatBot/BaseChatBotApi.js';

const chatBotApi = new BaseChatBotServerApi();
// or with a custom API path
const customChatBotApi = new BaseChatBotServerApi('/custom/api/path');
```