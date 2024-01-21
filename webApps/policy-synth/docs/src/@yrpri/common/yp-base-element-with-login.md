# YpBaseElementWithLogin

This class extends `YpBaseElement` to include functionality related to a logged-in user.

## Properties

| Name         | Type            | Description                           |
|--------------|-----------------|---------------------------------------|
| loggedInUser | YpUserData\|undefined | The data of the logged-in user, if any. |

## Methods

| Name                | Parameters        | Return Type | Description                                             |
|---------------------|-------------------|-------------|---------------------------------------------------------|
| connectedCallback   |                   | void        | Lifecycle method called when the element is connected to the DOM. Sets up listeners related to login events. |
| disconnectedCallback|                   | void        | Lifecycle method called when the element is disconnected from the DOM. Removes listeners related to login events. |
| isLoggedIn          |                   | boolean     | Getter that returns true if a user is logged in.         |
| _loggedIn           | event: CustomEvent| void        | Handles the 'yp-logged-in' event and updates the `loggedInUser` property. |

## Events

- **yp-logged-in**: Emitted when a user logs in. The `loggedInUser` property is updated in response to this event.
- **yp-got-admin-rights**: Emitted when a user gets admin rights. Triggers a request to update the element.

## Examples

```typescript
// Example usage of YpBaseElementWithLogin
class MyCustomElement extends YpBaseElementWithLogin {
  // Custom logic for a component that requires user login information
}
```