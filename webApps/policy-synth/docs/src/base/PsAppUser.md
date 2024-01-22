# PsAppUser

`PsAppUser` is an extension of the `YpAppUser` class, designed to interface with a `YpServerApi` instance. It may optionally skip the regular initialization process.

## Properties

No additional properties are documented for `PsAppUser`.

## Methods

| Name       | Parameters                        | Return Type | Description                 |
|------------|-----------------------------------|-------------|-----------------------------|
| constructor | serverApi: YpServerApi, skipRegularInit: boolean = false | void        | Initializes a new instance of `PsAppUser`, optionally skipping the regular initialization by passing `true` for `skipRegularInit`. |

## Events

No events are documented for `PsAppUser`.

## Examples

```typescript
// Example usage of PsAppUser
import { YpServerApi } from "@yrpri/webapp";

// Assuming you have an instance of YpServerApi
const serverApi = new YpServerApi();

// Create a new instance of PsAppUser
const user = new PsAppUser(serverApi);
```