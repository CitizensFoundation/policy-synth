# CpsAppGlobals

CpsAppGlobals extends YpAppGlobals to provide global application state and utility methods specific to the CPS application.

## Properties

| Name                          | Type                      | Description                                       |
|-------------------------------|---------------------------|---------------------------------------------------|
| originalQueryParameters       | any                       | Stores the original query parameters from the URL.|
| originalReferrer              | string                    | The original referrer URL of the document.        |
| questionId                    | number                    | The ID of the current question.                   |
| earlId                        | number                    | The ID of the current earl.                       |
| promptId                      | number                    | The ID of the current prompt.                     |
| earlName                      | string                    | The name of the current earl.                     |
| disableParentConstruction     | boolean                   | Flag to disable parent class construction.        |
| exernalGoalParamsWhiteList    | string \| undefined       | Whitelist for external goal parameters.           |

## Methods

| Name                  | Parameters                | Return Type | Description                                         |
|-----------------------|---------------------------|-------------|-----------------------------------------------------|
| constructor           | serverApi: CpsServerApi   | void        | Initializes the class with the provided server API. |
| getEarlName           | -                         | string \| null | Retrieves the earl name from the URL or path.       |
| setIds                | e: CustomEvent            | void        | Sets the IDs for question, earl, and prompt.        |
| parseQueryString      | -                         | void        | Parses the query string from the URL.               |
| getSessionFromCookie  | -                         | string      | Retrieves the session ID from the cookie.           |
| getOriginalQueryString| -                         | string \| null | Returns the original query string.                  |
| activity              | type: string, object: any | void        | Logs activity and triggers external goal if needed. |

## Events

- **set-ids**: Emitted to set the IDs for question, earl, and prompt based on the details provided in the event.

## Examples

```typescript
// Example usage of CpsAppGlobals
const serverApi = new CpsServerApi();
const cpsAppGlobals = new CpsAppGlobals(serverApi);

// Accessing a property
console.log(cpsAppGlobals.originalReferrer);

// Using a method
const earlName = cpsAppGlobals.getEarlName();
console.log(earlName);

// Listening to an event
document.addEventListener('set-ids', (event: CustomEvent) => {
  cpsAppGlobals.setIds(event);
});
```