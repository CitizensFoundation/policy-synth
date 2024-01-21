# YpUserInfo

The `YpUserInfo` class is a web component that extends `YpBaseElement` to display user information including their avatar, name, email, and provides buttons to edit user details, view content moderation, and logout.

## Properties

| Name   | Type      | Description                           |
|--------|-----------|---------------------------------------|
| user   | YpUserData | The user data to display in the component. |

## Methods

| Name                      | Parameters | Return Type | Description                                         |
|---------------------------|------------|-------------|-----------------------------------------------------|
| _openAllContentModeration |            | void        | Opens the all content moderation activity.          |
| _openEdit                 |            | void        | Emits an event to open the user edit interface.     |
| _logout                   |            | void        | Logs out the user by calling the logout method on `appUser`. |

## Events

- **open-user-edit**: Description of when and why the event is emitted.

## Examples

```typescript
// Example usage of the YpUserInfo web component
<yp-user-info .user="${this.userData}"></yp-user-info>
```

Note: The `YpUserData` type is not defined in the provided code snippet. It should be defined elsewhere in the application. The `appGlobals` and `appUser` objects are also used in the methods but are not defined within the provided code. These are likely part of the application's global state or services.