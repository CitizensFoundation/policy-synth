# CpsAppUser

CpsAppUser extends the functionality of YpAppUser to interact with the server API.

## Properties

Inherited properties from YpAppUser.

## Methods

Inherited methods from YpAppUser.

## Examples

```typescript
import { YpServerApi } from "./@yrpri/common/YpServerApi";
import { CpsAppUser } from "./path-to-CpsAppUser";

// Initialize server API instance
const serverApi = new YpServerApi();

// Create a new CpsAppUser instance
const user = new CpsAppUser(serverApi);
```