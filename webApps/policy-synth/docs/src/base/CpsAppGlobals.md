# CpsAppGlobals

CpsAppGlobals extends YpAppGlobals to provide additional functionality specific to the CPS application. It handles parsing of query strings, setting IDs from events, and tracking user activity.

## Properties

| Name                          | Type                      | Description                                           |
|-------------------------------|---------------------------|-------------------------------------------------------|
| originalQueryParameters       | any                       | Stores the original query parameters from the URL.    |
| originalReferrer              | string                    | The original referrer URL of the document.            |
| questionId                    | number                    | The ID of the current question.                       |
| earlId                        | number                    | The ID of the current earl.                           |
| promptId                      | number                    | The ID of the current prompt.                         |
| earlName                      | string                    | The name of the current earl.                         |
| disableParentConstruction     | boolean                   | Flag to disable parent construction.                  |
| exernalGoalParamsWhiteList    | string \| undefined       | Whitelist of parameters for external goals.           |

## Methods

| Name                  | Parameters                | Return Type | Description                                         |
|-----------------------|---------------------------|-------------|-----------------------------------------------------|
| constructor           | serverApi: CpsServerApi   | void        | Initializes the class with the provided server API. |
| getEarlName           |                           | string \| null | Retrieves the earl name from the URL or path.       |
| setIds                | e: CustomEvent            | void        | Sets the IDs based on the details of the event.     |
| parseQueryString      |                           | void        | Parses the query string from the URL.               |
| getSessionFromCookie  |                           | string      | Retrieves the session ID from the cookie.           |
| getOriginalQueryString|                           | string \| null | Returns the original query string if available.     |
| activity              | type: string, object: any | void        | Tracks user activity and sends it to the server.    |

## Events

- **set-ids**: Emitted to set the questionId, earlId, and promptId based on the event details.

## Examples

```typescript
// Example usage of CpsAppGlobals
const serverApi = new CpsServerApi();
const cpsAppGlobals = new CpsAppGlobals(serverApi);

// Accessing properties
console.log(cpsAppGlobals.originalReferrer);

// Using methods
const earlName = cpsAppGlobals.getEarlName();
console.log(earlName);

// Listening for events
document.addEventListener('set-ids', (event: CustomEvent) => {
  cpsAppGlobals.setIds(event);
});

// Tracking activity
cpsAppGlobals.activity('Voting - left', { detail: 'User voted left on an idea.' });
```