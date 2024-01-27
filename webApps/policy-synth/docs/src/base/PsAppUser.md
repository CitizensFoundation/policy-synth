# PsAppUser

This class extends `YpAppUser` from the `@yrpri/webapp/yp-app/YpAppUser` package. It is designed to initialize a user with the option to skip regular initialization processes.

## Properties

No public properties are defined in `PsAppUser` that are different from those in `YpAppUser`.

## Methods

| Name       | Parameters                          | Return Type | Description                                                                 |
|------------|-------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor| serverApi: YpServerApi, skipRegularInit: boolean = false | void        | Initializes a new instance of `PsAppUser`, optionally skipping regular initialization. |

## Events

No events are defined in `PsAppUser`.

## Example

```typescript
import { YpServerApi } from "@yrpri/webapp/common/YpServerApi";
import { PsAppUser } from '@policysynth/webapp/base/PsAppUser.js';

const serverApi = new YpServerApi();
const skipRegularInit = true;
const user = new PsAppUser(serverApi, skipRegularInit);

// Use the `user` instance as needed
```