# YpOffline

The `YpOffline` class extends `YpCodeBase` and provides functionality to handle offline situations by storing content to be sent later and sending it when the user is back online.

## Properties

| Name                    | Type   | Description                                       |
|-------------------------|--------|---------------------------------------------------|
| sendLaterStoragePrefix  | string | Prefix used for keys in local storage.            |

## Methods

| Name                               | Parameters                              | Return Type | Description                                                                 |
|------------------------------------|-----------------------------------------|-------------|-----------------------------------------------------------------------------|
| _onlineEvent                       |                                         | void        | Shows a toast message when the user comes online and checks for content to send. |
| _offlineEvent                      |                                         | void        | Shows a toast message when the user goes offline.                            |
| _urlWithQuery                      | url: string, params: any                | string      | Constructs a URL with query parameters.                                     |
| _getItemsFromLocalStorage          |                                         | YpLocaleStorageItemToSendLater[] | Retrieves items from local storage that are marked to be sent later.        |
| _sendItems                         | items: YpLocaleStorageItemToSendLater[] | void        | Sends the items that were stored for later sending.                         |
| _checkContentToSend                |                                         | void        | Checks if there is any content to send and handles it based on the user's online status and login state. |
| checkContentToSendForLoggedInUser  |                                         | void        | Checks and sends content if the user is logged in.                           |
| sendWhenOnlineNext                 | contentToSendLater: YpContentToSendLater | void        | Stores content to be sent later when the user is online.                    |
| constructor                        |                                         | void        | Adds event listeners for online and offline events and checks for content to send. |

## Events

- **online**: Emitted when the user comes back online.
- **offline**: Emitted when the user goes offline.

## Examples

```typescript
// Example usage of YpOffline class
const offlineHandler = new YpOffline();

// To store content to be sent when the user is back online
const contentToSendLater = {
  url: 'https://api.example.com/data',
  method: 'POST',
  body: { key: 'value' }
};
offlineHandler.sendWhenOnlineNext(contentToSendLater);

// To manually check and send content for a logged-in user
offlineHandler.checkContentToSendForLoggedInUser();
```

Note: The `YpLocaleStorageItemToSendLater` and `YpContentToSendLater` types are not defined in the provided code snippet. They should be defined elsewhere in the codebase for the above documentation to be accurate.