# YpAppGlobals

The `YpAppGlobals` class is responsible for managing global application state and configurations. It handles various tasks such as user sessions, language settings, analytics, and interactions with the server API.

## Properties

| Name                          | Type                                      | Description                                                                 |
|-------------------------------|-------------------------------------------|-----------------------------------------------------------------------------|
| seenWelcome                   | boolean                                   | Indicates if the welcome message has been seen.                             |
| resetSeenWelcome              | boolean                                   | Flag to reset the seen welcome status.                                      |
| disableWelcome                | boolean                                   | Flag to disable the welcome message.                                        |
| activityHost                  | string                                    | Host for activity tracking.                                                 |
| domain                        | YpDomainData \| undefined                 | Domain data for the application.                                            |
| groupConfigOverrides          | Record<number, Record<string, string \| boolean>> | Overrides for group configurations.                                         |
| currentAnonymousUser          | YpUserData \| undefined                   | Data for the current anonymous user.                                        |
| currentGroup                  | YpGroupData \| undefined                  | Data for the current group.                                                 |
| registrationQuestionsGroup    | YpGroupData \| undefined                  | Group data containing registration questions.                               |
| currentAnonymousGroup         | YpGroupData \| undefined                  | Data for the current anonymous group.                                       |
| currentForceSaml              | boolean                                   | Flag to force SAML authentication.                                          |
| disableFacebookLoginForGroup  | boolean                                   | Flag to disable Facebook login for a group.                                 |
| currentSamlDeniedMessage      | string \| undefined                       | Message for denied SAML authentication.                                     |
| currentSamlLoginMessage       | string \| undefined                       | Message for SAML login.                                                     |
| originalQueryParameters       | Record<string, string \| number \| undefined> | Original query parameters from the URL.                                     |
| externalGoalTriggerUrl        | string \| undefined                       | URL for triggering external goals.                                          |
| externalGoalCounter           | number                                    | Counter for external goal triggers.                                         |
| appStartTime                  | Date                                      | Timestamp when the application started.                                     |
| autoTranslate                 | boolean                                   | Flag for auto-translation feature.                                          |
| goalTriggerEvents             | Array<string>                             | List of events that can trigger goals.                                      |
| haveLoadedLanguages           | boolean                                   | Flag indicating if languages have been loaded.                              |
| hasTranscriptSupport          | boolean                                   | Flag indicating if transcript support is available.                         |
| hasVideoUpload                | boolean                                   | Flag indicating if video upload is supported.                               |
| hasAudioUpload                | boolean                                   | Flag indicating if audio upload is supported.                               |
| locale                        | string \| undefined                       | Selected locale for translations.                                           |
| i18nTranslation               | any \| undefined                          | Translation object from i18next.                                            |
| serverApi                     | YpServerApi                               | Instance of the server API.                                                 |
| recommendations               | YpRecommendations                         | Instance for handling recommendations.                                      |
| cache                         | YpCache                                   | Instance for caching data.                                                  |
| offline                       | YpOffline                                 | Instance for managing offline capabilities.                                 |
| analytics                     | YpAnalytics                               | Instance for handling analytics.                                            |
| theme                         | YpThemeManager                            | Instance for managing themes.                                               |
| highlightedLanguages          | string \| undefined                       | Highlighted languages for the application.                                  |
| magicTextIronResizeDebouncer  | number \| undefined                       | Debouncer for resizing text areas.                                          |
| signupTermsPageId             | number \| undefined                       | Page ID for signup terms.                                                   |
| retryMethodAfter401Login      | Function \| undefined                     | Method to retry after a 401 login error.                                    |
| groupLoadNewPost              | boolean                                   | Flag to indicate if a new post should be loaded for a group.                |

## Methods

| Name                          | Parameters                                | Return Type | Description                                                                 |
|-------------------------------|-------------------------------------------|-------------|-----------------------------------------------------------------------------|
| showRecommendationInfoIfNeeded|                                           | void        | Shows recommendation info if needed.                                        |
| showSpeechToTextInfoIfNeeded  |                                           | void        | Shows speech-to-text info if needed.                                        |
| hasVideoUploadSupport         |                                           | Promise<void> | Checks for video upload support.                                            |
| sendVideoView                 | videoId: number \| string                 | void        | Sends a video view event.                                                   |
| sendLongVideoView             | videoId: number \| string                 | void        | Sends a long video view event.                                              |
| hasAudioUploadSupport         |                                           | Promise<void> | Checks for audio upload support.                                            |
| sendAudioListen               | audioId: number \| string                 | void        | Sends an audio listen event.                                                |
| sendLongAudioListen           | audioId: number \| string                 | void        | Sends a long audio listen event.                                            |
| changeLocaleIfNeededAfterWait | locale: string, force: boolean            | void        | Changes the locale if needed after a delay.                                 |
| setHighlightedLanguages       | languages: string \| undefined            | void        | Sets the highlighted languages.                                             |
| changeLocaleIfNeeded          | locale: string, force: boolean            | void        | Changes the locale if needed.                                               |
| parseQueryString              |                                           | void        | Parses the query string from the URL.                                       |
| setAnonymousUser              | user: YpUserData \| undefined             | void        | Sets the current anonymous user.                                            |
| setRegistrationQuestionGroup  | group: YpGroupData \| undefined           | void        | Sets the registration questions group.                                      |
| setAnonymousGroupStatus       | group: YpGroupData \| undefined           | void        | Sets the status of the current anonymous group.                             |
| _domainChanged                | domain: YpDomainData \| undefined         | void        | Handles domain changes.                                                     |
| notifyUserViaToast            | text: string                              | void        | Notifies the user via a toast message.                                      |
| reBoot                        |                                           | void        | Reboots the application.                                                    |
| _userLoggedIn                 | event: CustomEvent                        | void        | Handles user login events.                                                  |
| setupTranslationSystem        | loadPathPrefix: string                    | void        | Sets up the translation system.                                             |
| startTranslation              |                                           | void        | Starts the auto-translation feature.                                        |
| stopTranslation               |                                           | void        | Stops the auto-translation feature.                                         |
| boot                          |                                           | Promise<void> | Boots the application.                                                      |
| setupGroupConfigOverride      | groupId: number, configOverride: string   | void        | Sets up group configuration overrides.                                      |
| overrideGroupConfigIfNeeded   | groupId: number, configuration: YpGroupConfiguration | YpGroupConfiguration | Overrides group configuration if needed.                                    |
| checkExternalGoalTrigger      | type: string                              | void        | Checks and triggers external goals.                                         |
| activity                      | type: string, object: object \| string, context: string \| object \| number \| undefined, target: string \| object \| undefined | void        | Logs activity and sends it to analytics and server API.                     |
| setSeenWelcome                |                                           | void        | Sets the seen welcome status.                                               |
| getSessionFromCookie          |                                           | string      | Retrieves the session ID from the cookie.                                   |

## Events (if any)

- **yp-logged-in**: Emitted when a user logs in.
- **yp-notify-dialog**: Emitted to show a notification dialog.
- **yp-has-video-upload**: Emitted when video upload support is determined.
- **yp-has-audio-upload**: Emitted when audio upload support is determined.
- **yp-language-loaded**: Emitted when a language is loaded.
- **yp-change-header**: Emitted to change the header information.
- **yp-external-goal-trigger**: Emitted when an external goal is triggered.
- **yp-auto-translate**: Emitted when auto-translate is started or stopped.
- **yp-open-toast**: Emitted to open a toast message.
- **yp-refresh-language-selection**: Emitted to refresh language selection.
- **yp-domain-changed**: Emitted when the domain changes.

## Examples

```typescript
// Example usage of the YpAppGlobals class
const serverApi = new YpServerApi();
const appGlobals = new YpAppGlobals(serverApi);

// Setting up translation system
appGlobals.setupTranslationSystem('/base/path');

// Checking for video upload support
appGlobals.hasVideoUploadSupport().then(() => {
  console.log('Video upload support status:', appGlobals.hasVideoUpload);
});

// Changing the locale if needed
appGlobals.changeLocaleIfNeeded('en', true);

// Booting the application
appGlobals.boot().then(() => {
  console.log('Application booted successfully');
});
```