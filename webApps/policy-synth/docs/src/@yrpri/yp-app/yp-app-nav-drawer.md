# YpAppNavDrawer

The `YpAppNavDrawer` class is a custom element that extends `YpBaseElement` to create a navigation drawer for an application. It includes properties for user data, admin rights, group and community memberships, and methods for navigation and state management.

## Properties

| Name                | Type                  | Description                                           |
|---------------------|-----------------------|-------------------------------------------------------|
| homeLink            | YpHomeLinkData        | Data for the home link in the navigation drawer.      |
| user                | YpUserData            | Data for the current user.                            |
| opened              | boolean               | Indicates if the navigation drawer is open.           |
| spinner             | boolean               | Indicates if a spinner should be shown.               |
| route               | string                | The current route of the application.                 |
| myAdminGroups       | YpGroupData[]         | List of groups where the user has admin rights.       |
| myAdminCommunities  | YpCommunityData[]     | List of communities where the user has admin rights.  |
| myGroups            | YpGroupData[]         | List of groups the user is a member of.               |
| myCommunities       | YpCommunityData[]     | List of communities the user is a member of.          |
| myDomains           | YpDomainData[]        | List of domains the user is a member of.              |
| adminRights         | YpAdminRights         | Admin rights of the user.                             |
| memberships         | YpMemberships         | Memberships of the user in various groups and domains.|

## Methods

| Name          | Parameters                        | Return Type | Description                                      |
|---------------|-----------------------------------|-------------|--------------------------------------------------|
| updated       | changedProperties: Map            | void        | Lifecycle method called when properties change.  |
| _openChanged  |                                   | Promise<void> | Handles the state change when the drawer is opened. |
| _selectedLocale |                               | string      | Returns the selected language locale.           |
| _goBack       |                                   | void        | Navigates back to the home link.                |
| _goToGroup    | event: CustomEvent                | void        | Navigates to a specific group.                  |
| _goToCommunity| event: CustomEvent                | void        | Navigates to a specific community.              |
| _goToDomain   | event: CustomEvent                | void        | Navigates to a specific domain.                 |
| _userChanged  |                                   | void        | Called when the user property changes.          |
| _reset        |                                   | void        | Resets the navigation drawer data.              |

## Events (if any)

- **yp-toggle-nav-drawer**: Emitted when the navigation drawer needs to be toggled.

## Examples

```typescript
// Example usage of the YpAppNavDrawer
const navDrawer = document.createElement('yp-app-nav-drawer');
navDrawer.homeLink = { id: 'home', type: 'dashboard', name: 'Home' };
navDrawer.user = { id: 'user1', name: 'John Doe' };
navDrawer.opened = true;
document.body.appendChild(navDrawer);
```

Please note that the above example assumes that the custom elements `yp-app-nav-drawer` and `yp-base-element` are already defined in the global custom elements registry, and that the relevant data types such as `YpHomeLinkData`, `YpUserData`, etc., are defined in the application's TypeScript context.