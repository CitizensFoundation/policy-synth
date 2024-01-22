# PsAppGlobals

Brief description of the class.

## Properties

| Name                          | Type                          | Description               |
|-------------------------------|-------------------------------|---------------------------|
| originalQueryParameters       | any                           | Brief description.        |
| originalReferrer              | string                        | Brief description.        |
| questionId                    | number                        | Brief description.        |
| earlId                        | number                        | Brief description.        |
| promptId                      | number                        | Brief description.        |
| earlName                      | string                        | Brief description.        |
| disableParentConstruction     | boolean                       | Brief description.        |
| exernalGoalParamsWhiteList    | string \| undefined           | Brief description.        |

## Methods

| Name                  | Parameters                    | Return Type | Description                 |
|-----------------------|-------------------------------|-------------|-----------------------------|
| constructor           | serverApi: PsServerApi        | void        | Brief description of method |
| getEarlName           | -                             | string \| null | Brief description of method |
| setIds                | e: CustomEvent                | void        | Brief description of method |
| parseQueryString      | -                             | void        | Brief description of method |
| getSessionFromCookie  | -                             | string      | Brief description of method |
| getOriginalQueryString| -                             | string \| null | Brief description of method |
| activity              | type: string, object: any \| undefined | void | Brief description of method |

## Events

- **set-ids**: Description of when and why the event is emitted.

## Examples

```typescript
// Example usage of PsAppGlobals
const serverApi = new PsServerApi();
const appGlobals = new PsAppGlobals(serverApi);

// Accessing properties
console.log(appGlobals.originalReferrer);

// Using methods
const earlName = appGlobals.getEarlName();
appGlobals.activity('Voting - left');
```