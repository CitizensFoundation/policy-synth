# YpAppUser

The `YpAppUser` class manages user-related operations such as login, logout, session management, and user data within the application. It extends the `YpCodeBase` class and interacts with the `YpServerApi` to perform server-side operations.

## Properties

| Name                                  | Type                                      | Description                                                                 |
|---------------------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| serverApi                             | YpServerApi                               | The server API instance used for backend communication.                     |
| loginForAcceptInviteParams            | { token: string; editDialog: HTMLElement; } \| null | Parameters for login when accepting an invite.                              |
| loginForEditParams                    | { editDialog: HTMLElement; newOrUpdate: boolean; params: object; refreshFunction: Function; } \| null | Parameters for login when editing content.                                  |
| loginForNewPointParams                | { postPointsElement: HTMLElement; params: { value: number; content: string; }; } \| null | Parameters for login when creating a new point.                             |
| loginForEndorseParams                 | { postActionElement: HTMLElement; params: { value: number; }; } \| null | Parameters for login when endorsing a post.                                 |
| loginForRatingsParams                 | { postActionElement: HTMLElement; } \| null | Parameters for login when rating a post.                                    |
| loginForPointQualityParams            | { pointActionElement: HTMLElement; params: { value: number; }; } \| null | Parameters for login when setting point quality.                            |
| loginForMembershipParams              | { membershipActionElement: HTMLElement; params: { value: string; content: string; }; } \| null | Parameters for login when managing membership.                              |
| loginFor401refreshFunction            | Function \| undefined                     | Function to call after login due to a 401 response.                         |
| loginForNotificationSettingsParams    | boolean                                   | Indicates if login is for notification settings.                            |
| toastLoginTextCombined                | string \| undefined                       | Combined text for login toast message.                                      |
| toastLogoutTextCombined               | string \| undefined                       | Combined text for logout toast message.                                     |
| user                                  | YpUserData \| null \| undefined           | The current user data.                                                      |
| endorsementPostsIndex                 | Record<number, YpEndorsement>             | Index of endorsement posts by user.                                         |
| groupCurrentVoteCountIndex            | Record<number, number>                    | Index of current vote counts by group.                                      |
| ratingPostsIndex                      | Record<number, Record<number, YpRatingData>> | Index of rating posts by user.                                              |
| membershipsIndex                      | Record<string, Record<number, boolean>>   | Index of memberships by type and ID.                                        |
| pointQualitiesIndex                   | Record<number, YpPointQuality>            | Index of point qualities by point ID.                                       |
| adminRights                           | YpAdminRights \| undefined                | The admin rights of the current user.                                       |
| memberships                           | YpMemberships \| undefined                | The memberships of the current user.                                        |
| completeExternalLoginText             | string \| undefined                       | Text to display after completing an external login.                         |
| isPollingForLogin                     | boolean                                   | Indicates if the system is currently polling for login status.              |
| lastLoginMethod                       | string \| undefined                       | The last method used for login.                                             |
| facebookPopupWindow                   | Window \| null                            | Reference to the Facebook login popup window.                               |
| samlPopupWindow                       | Window \| null                            | Reference to the SAML login popup window.                                   |
| pollingStartedAt                      | number \| undefined                       | Timestamp when polling for login started.                                   |
| hasIssuedLogout                       | boolean                                   | Indicates if a logout has been issued.                                      |
| sessionPrefix                         | string                                    | Prefix for session storage keys.                                            |
| sessionStorage                        | Storage                                   | Reference to the session storage, defaults to `window.localStorage`.        |
| browserFingerprint                    | string \| undefined                       | The browser fingerprint ID.                                                 |
| browserFingerprintConfidence          | number \| undefined                       | Confidence score for the browser fingerprint.                               |

## Methods

| Name                          | Parameters                                                                 | Return Type | Description                                                                 |
|-------------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------|
| getBrowserId                  |                                                                            | string      | Retrieves the browser ID from local storage or generates a new one.         |
| _setupBrowserFingerprint      |                                                                            | void        | Sets up the browser fingerprint using FingerprintJS.                        |
| _generateRandomString         | length: number                                                             | string      | Generates a random string of the specified length.                          |
| sessionHas                    | key: string                                                                | boolean     | Checks if a session key exists.                                             |
| sessionGet                    | key: string                                                                | any         | Retrieves a session value by key.                                           |
| sessionSet                    | key: string, value: string \| object                                       | void        | Sets a session value by key.                                                |
| sessionUnset                  | key: string                                                                | void        | Removes a session value by key.                                             |
| sessionClear                  |                                                                            | void        | Clears all session values.                                                  |
| loginForAcceptInvite          | editDialog: HTMLElement, token: string, email: string, collectionConfiguration: object \| undefined | void        | Initiates login for accepting an invite.                                    |
| loginForEdit                  | editDialog: HTMLElement, newOrUpdate: boolean, params: object, refreshFunction: Function | void        | Initiates login for editing content.                                        |
| loginForNewPoint              | postPointsElement: HTMLElement, params: { value: number; content: string; } | void        | Initiates login for creating a new point.                                   |
| loginForEndorse               | postActionElement: HTMLElement, params: { value: number; }                  | void        | Initiates login for endorsing a post.                                       |
| loginForRatings               | postActionElement: HTMLElement                                              | void        | Initiates login for rating a post.                                          |
| loginForPointQuality          | pointActionElement: HTMLElement, params: { value: number; }                 | void        | Initiates login for setting point quality.                                  |
| loginForMembership            | membershipActionElement: HTMLElement, params: { value: string; content: string; } | void        | Initiates login for managing membership.                                    |
| loginFor401                   | refreshFunction: Function                                                   | void        | Initiates login after a 401 response.                                       |
| loginForNotificationSettings  |                                                                            | void        | Initiates login for notification settings.                                  |
| openUserlogin                 | email: string \| undefined, collectionConfiguration: object \| undefined    | void        | Opens the user login dialog.                                                |
| autoAnonymousLogin            |                                                                            | void        | Automatically logs in an anonymous user.                                    |
| _closeUserLogin               |                                                                            | void        | Closes the user login dialog.                                               |
| _setUserLoginSpinner          |                                                                            | void        | Sets the spinner state for the user login dialog.                           |
| _handleLogin                  | user: YpUserData                                                           | void        | Handles the login process after successful authentication.                  |
| _checkLoginForParameters      |                                                                            | void        | Checks and processes any pending login parameters.                          |
| openNotificationSettings      |                                                                            | void        | Opens the notification settings dialog.                                     |
| _forgotPassword               | event: CustomEvent                                                         | void        | Opens the forgot password dialog.                                           |
| _resetPassword                | event: CustomEvent                                                         | void        | Opens the reset password dialog.                                            |
| getUser                       |                                                                            | YpUserData \| null | Retrieves the current user from session storage.                            |
| setLoggedInUser               | user: YpUserData                                                           | void        | Sets the current user and updates session storage.                          |
| removeAnonymousUser           |                                                                            | void        | Removes the anonymous user from session storage.                            |
| removeUserSession             |                                                                            | void        | Removes the user session from session storage.                              |
| loggedIn                      |                                                                            | boolean     | Checks if the user is logged in.                                            |
| setLocale                     | locale: string                                                             | Promise<void> | Sets the user's locale.                                                     |
| cancelLoginPolling            |                                                                            | void        | Cancels the login polling process.                                          |
| _closeAllPopups               |                                                                            | void        | Closes all popup windows.                                                   |
| pollForLogin                  |                                                                            | Promise<void> | Polls the server to check if the user is logged in.                         |
| startPollingForLogin          |                                                                            | void        | Starts the login polling process.                                           |
| loginFromFacebook             |                                                                            | void        | Handles login from Facebook.                                                |
| loginFromSaml                 |                                                                            | void        | Handles login from SAML.                                                    |
| _completeExternalLogin        | fromString: string                                                         | void        | Completes the external login process.                                       |
| checkLogin                    |                                                                            | void        | Checks the login status of the user.                                        |
| recheckAdminRights            |                                                                            | void        | Rechecks the admin rights of the current user.                              |
| updateEndorsementForPost      | postId: number, newEndorsement: YpEndorsement, group: YpGroupData \| undefined | void        | Updates the endorsement for a post.                                         |
| calculateVotesLeftForGroup    | group: YpGroupData                                                         | void        | Calculates the remaining votes for a group.                                 |
| _updateEndorsementPostsIndex  | user: YpUserData                                                           | void        | Updates the index of endorsement posts.                                     |
| _updateRatingPostsIndex       | user: YpUserData                                                           | void        | Updates the index of rating posts.                                          |
| updateRatingForPost           | postId: number, typeIndex: number, newRating: YpRatingData \| undefined    | void        | Updates the rating for a post.                                              |
| updatePointQualityForPost     | pointId: number, newPointQuality: YpPointQuality                           | void        | Updates the point quality for a post.                                       |
| _updatePointQualitiesIndex    | user: YpUserData                                                           | void        | Updates the index of point qualities.                                       |
| _onUserChanged                | user: YpUserData \| null                                                   | void        | Handles changes to the user data.                                           |
| logout                        |                                                                            | Promise<void> | Logs out the current user.                                                  |
| checkRegistrationAnswersCurrent |                                                                            | void        | Checks if the current user has answered registration questions.             |
| setHasRegistrationAnswers     |                                                                            | void        | Sets the flag indicating the user has answered registration questions.      |
| _checkRegistrationAnswers     | user: YpUserData                                                           | void        | Checks if the user needs to answer registration questions.                   |
| isloggedin                    |                                                                            | Promise<void> | Checks if the user is logged in and updates session storage accordingly.    |
| getAdminRights                |                                                                            | Promise<void> | Retrieves the admin rights of the current user.                             |
| _updateMembershipsIndex       | memberships: YpMemberships                                                 | void        | Updates the index of memberships.                                           |
| getMemberShips                |                                                                            | Promise<void> | Retrieves the memberships of the current user.                              |

## Events (if any)

- **yp-forgot-password**: Emitted when the user requests to reset their password.
- **yp-reset-password**: Emitted when the user is resetting their password.
- **yp-logged-in**: Emitted when the user logs in.
- **yp-open-toast**: Emitted to display a toast message.
- **yp-close-right-drawer**: Emitted to close the right drawer.
- **yp-got-admin-rights**: Emitted when admin rights are retrieved.
- **yp-have-checked-admin-rights**: Emitted after checking admin rights.
- **yp-got-memberships**: Emitted when memberships are retrieved.
- **yp-got-endorsements-and-qualities**: Emitted when endorsements and point qualities are updated.

## Examples

```typescript
// Example usage of the YpAppUser class
const serverApi = new YpServerApi();
const appUser = new YpAppUser(serverApi);

// Check if the user is logged in
if (appUser.loggedIn()) {
  console.log('User is logged in');
}

// Log in the user for editing content
appUser.loginForEdit(editDialogElement, true, editParams, refreshFunction);

// Log out the user
appUser.logout().then(() => {
  console.log('User has been logged out');
});
```