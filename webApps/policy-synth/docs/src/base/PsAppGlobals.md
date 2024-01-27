# PsAppGlobals

`PsAppGlobals` extends `YpAppGlobals` to provide global application state and utility methods specific to the application. It includes functionality for parsing query strings, managing session data, and logging activities.

## Properties

| Name                          | Type                                  | Description                                           |
|-------------------------------|---------------------------------------|-------------------------------------------------------|
| originalQueryParameters       | any                                   | Stores the original query parameters as a key-value map. |
| originalReferrer              | string                                | The original referrer URL of the document.            |
| questionId                    | number                                | ID of the current question.                           |
| earlId                        | number                                | ID of the current earl.                               |
| promptId                      | number                                | ID of the current prompt.                             |
| earlName                      | string                                | Name of the current earl.                             |
| disableParentConstruction     | boolean                               | Flag to disable parent constructor call. Set to true. |
| exernalGoalParamsWhiteList    | string \| undefined                   | Whitelist for external goal parameters.               |

## Methods

| Name                  | Parameters                            | Return Type | Description                                                                 |
|-----------------------|---------------------------------------|-------------|-----------------------------------------------------------------------------|
| getEarlName           |                                       | string \| null | Returns the earl name from URL or path. Logs error if not found.            |
| setIds                | e: CustomEvent                        | void        | Sets the `questionId`, `earlId`, and `promptId` from a custom event.        |
| parseQueryString      |                                       | void        | Parses the query string from the URL and stores it in `originalQueryParameters`. |
| getSessionFromCookie  |                                       | string      | Retrieves the session ID from a cookie.                                    |
| getOriginalQueryString|                                       | string \| null | Returns the original query string constructed from `originalQueryParameters`. |
| activity              | type: string, object: any \| undefined | void        | Logs an activity with various parameters including type, object, and session data. |

## Example

```typescript
import { PsAppGlobals } from '@policysynth/webapp/base/PsAppGlobals.js';
import { PsServerApi } from './PsServerApi.js';

const serverApi = new PsServerApi();
const appGlobals = new PsAppGlobals(serverApi);

// Example usage of getEarlName
const earlName = appGlobals.getEarlName();
console.log(earlName);

// Example usage of activity logging
appGlobals.activity('Page View');
```