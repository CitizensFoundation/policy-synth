# CpsAppUser

CpsAppUser extends the functionality of YpAppUser to interact with the server API.

## Properties

Inherits all properties from YpAppUser.

## Methods

| Name       | Parameters                        | Return Type | Description                 |
|------------|-----------------------------------|-------------|-----------------------------|
| constructor | serverApi: YpServerApi, skipRegularInit: boolean | void         | Initializes a new instance of CpsAppUser, optionally skipping the regular initialization. |

## Examples

```typescript
import { YpServerApi } from "../@yrpri/common/YpServerApi";
import { CpsAppUser } from "./CpsAppUser";

// Initialize server API
const serverApi = new YpServerApi();

// Create a new CpsAppUser instance
const user = new CpsAppUser(serverApi, true);
```

(Note: The actual usage of `YpServerApi` and `CpsAppUser` may vary depending on the context in which they are used and the implementation details of the `YpServerApi` class.)