# YpServerApi

The `YpServerApi` class extends `YpServerApiBase` and provides methods to interact with a server API. It includes a variety of methods for user authentication, content management, media handling, and more.

## Properties

| Name        | Type   | Description                           |
|-------------|--------|---------------------------------------|
| baseUrlPath | string | The base URL path for the API calls.  |

## Methods

| Name                            | Parameters                                  | Return Type | Description                                                                 |
|---------------------------------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| constructor                     | urlPath: string = '/api'                    |             | Initializes the class with an optional base URL path.                       |
| boot                            |                                             | Promise     | Fetches the domain information.                                             |
| isloggedin                      |                                             | Promise     | Checks if the user is logged in.                                            |
| getAdminRights                  |                                             | Promise     | Retrieves the admin rights of the logged-in user.                           |
| getMemberships                  |                                             | Promise     | Gets the memberships of the logged-in user.                                 |
| getAdminRightsWithNames         |                                             | Promise     | Fetches the admin rights with names for the logged-in user.                 |
| getMembershipsWithNames         |                                             | Promise     | Retrieves the memberships with names for the logged-in user.                |
| logout                          |                                             | Promise     | Logs out the current user.                                                  |
| setLocale                       | body: Record<string, unknown>               | Promise     | Sets the locale for the logged-in user.                                     |
| getRecommendationsForGroup      | groupId: number                             | Promise     | Gets post recommendations for a specific group.                             |
| hasVideoUploadSupport           |                                             | Promise     | Checks if video upload is supported.                                        |
| hasAudioUploadSupport           |                                             | Promise     | Checks if audio upload is supported.                                        |
| sendVideoView                   | body: Record<string, unknown>               | Promise     | Sends a video view event.                                                   |
| sendAudioView                   | body: Record<string, unknown>               | Promise     | Sends an audio view event.                                                  |
| createActivityFromApp           | body: Record<string, unknown>               | Promise     | Creates an activity from the app.                                           |
| marketingTrackingOpen           | groupId: number, body: Record<string, unknown> | Promise     | Tracks marketing open events for a group.                                   |
| createApiKey                    |                                             | Promise     | Creates an API key for the user.                                            |
| triggerTrackingGoal             | groupId: number, body: Record<string, unknown> | Promise     | Triggers a tracking goal for a group.                                       |
| getCollection                   | collectionType: string, collectionId: number | Promise     | Retrieves a collection by type and ID.                                      |
| getCategoriesCount              | id: number, tabName: string \| undefined    | Promise     | Gets the count of categories for a group.                                   |
| getGroupPosts                   | searchUrl: string                           | Promise     | Fetches posts for a group based on a search URL.                            |
| getPost                         | postId: number                              | Promise     | Retrieves a post by its ID.                                                 |
| getGroup                        | groupId: number                             | Promise     | Fetches a group by its ID.                                                  |
| endorsePost                     | postId: number, method: string, body: Record<string, unknown> | Promise     | Endorses a post.                                                            |
| getHasNonOpenPosts              | groupId: number                             | Promise     | Checks if a group has non-open posts.                                       |
| getHelpPages                    | collectionType: string, collectionId: number | Promise     | Retrieves help pages for a collection.                                      |
| getTranslation                  | translateUrl: string                        | Promise     | Fetches a translation.                                                      |
| getTranslatedRegistrationQuestions | groupId: number, targetLanguage: string   | Promise     | Gets translated registration questions for a group.                         |
| sendRegistrationQuestions       | registrationAnswers: Array<Record<string,string>> | Promise     | Sends registration questions.                                               |
| savePostTranscript              | postId: number, body: Record<string, unknown> | Promise     | Saves a transcript for a post.                                              |
| getPostTranscriptStatus         | groupId: number, tabName: string \| undefined | Promise     | Gets the transcript status for a post.                                      |
| addPoint                        | groupId: number, body: Record<string, unknown> | Promise     | Adds a point to a group.                                                    |
| completeMediaPoint              | mediaType: string, pointId: number, body: Record<string, unknown> | Promise     | Completes a media point and adds it to a point.                             |
| completeMediaPost               | mediaType: string, method: string, postId: number, body: Record<string, unknown> | Promise     | Completes a media post and adds it to a post.                               |
| getPoints                       | postId: number                              | Promise     | Retrieves points for a post.                                                |
| getMorePoints                   | postId: number, offsetUp: number, offsetDown: number | Promise     | Fetches more points for a post.                                             |
| getNewPoints                    | postId: number, latestPointCreatedAt: Date  | Promise     | Gets new points for a post.                                                 |
| getSurveyTranslations           | post: YpPostData, language: string          | Promise     | Retrieves survey translations.                                              |
| getVideoFormatsAndImages        | videoId: number                             | Promise     | Gets video formats and images.                                              |
| getGroupConfiguration           | groupId: number                             | Promise     | Fetches the configuration for a group.                                      |
| setVideoCover                   | videoId: number, body: Record<string, unknown> | Promise     | Sets the video cover.                                                       |
| getTranscodingJobStatus         | mediaType: string, mediaId: number, jobId: string | Promise     | Gets the status of a transcoding job.                                       |
| startTranscoding                | mediaType: string, mediaId: number, startType: string, body: Record<string, unknown> | Promise     | Starts transcoding for media.                                               |
| createPresignUrl                | mediaUrl: string, body = {}                 | Promise     | Creates a presigned URL for media.                                          |
| updatePoint                     | pointId: number, body: Record<string, unknown> | Promise     | Updates a point.                                                            |
| updatePointAdminComment         | groupId: number, pointId: number, body: Record<string, unknown> | Promise     | Updates the admin comment for a point.                                      |
| deletePoint                     | pointId: number                             | Promise     | Deletes a point.                                                            |
| checkPointTranscriptStatus      | type: string, pointId: number               | Promise     | Checks the transcript status for a point.                                   |
| registerUser                    | body: Record<string, unknown>               | Promise     | Registers a new user.                                                       |
| loginUser                       | body: Record<string, unknown>               | Promise     | Logs in a user.                                                             |
| submitForm                      | url: string, method: string, headers: Record<string, string>, body: string | Promise     | Submits a form.                                                             |
| getSurveyGroup                  | surveyGroupId: number                       | Promise     | Retrieves a survey group.                                                   |
| postSurvey                      | surveyGroupId: number, body: Record<string, unknown> | Promise     | Posts a survey for a group.                                                 |
| deleteActivity                  | type: string, collectionId: number, activityId: number | Promise     | Deletes an activity.                                                        |
| getAcActivities                 | url: string                                 | Promise     | Fetches activities.                                                         |
| getRecommendations              | typeName: string, typeId: number            | Promise     | Gets recommendations.                                                       |
| setNotificationsAsViewed        | body: Record<string, unknown>               | Promise     | Marks notifications as viewed.                                              |
| setNotificationsAllAsViewed     |                                             | Promise     | Marks all notifications as viewed.                                          |
| getAcNotifications              | url: string                                 | Promise     | Fetches notifications.                                                      |
| getComments                     | type: string, pointId: number               | Promise     | Retrieves comments for a point.                                             |
| getCommentsCount                | type: string, pointId: number               | Promise     | Gets the count of comments for a point.                                     |
| postComment                     | type: string, id: number, body: Record<string, unknown> | Promise     | Posts a comment.                                                            |
| setPointQuality                 | pointId: number, method: string, body: Record<string, unknown> | Promise     | Sets the quality of a point.                                                |
| postNewsStory                   | url: string, body: Record<string, unknown>  | Promise     | Posts a news story.                                                         |
| pointUrlPreview                 | urlParams: string                           | Promise     | Previews a URL for a point.                                                 |
| disconnectSamlLogin             |                                             | Promise     | Disconnects SAML login.                                                     |
| disconnectFacebookLogin         |                                             | Promise     | Disconnects Facebook login.                                                 |
| deleteUser                      |                                             | Promise     | Deletes the current user.                                                   |
| anonymizeUser                   |                                             | Promise     | Anonymizes the current user.                                                |
| resetPassword                   | token: string, body: Record<string, unknown> | Promise     | Resets the password for a user.                                             |
| setEmail                        | body: Record<string, unknown>               | Promise     | Sets the email for a user.                                                  |
| linkAccounts                    | body: Record<string, unknown>               | Promise     | Links user accounts.                                                        |
| confirmEmailShown               |                                             | Promise     | Confirms that the email has been shown.                                     |
| forgotPassword                  | body: Record<string, unknown>               | Promise     | Initiates the forgot password process.                                      |
| acceptInvite                    | token: string                               | Promise     | Accepts an invite.                                                          |
| getInviteSender                 | token: string                               | Promise     | Gets the sender of an invite.                                               |
| getPostLocations                | type: string, id: number                    | Promise     | Retrieves post locations.                                                   |
| hasAutoTranslation              |                                             | Promise     | Checks if auto-translation is available.                                    |
| apiAction                       | url: string, method: string, body: Record<string, unknown> | Promise     | Performs a generic API action.                                              |
| getImages                       | postId: number                              | Promise     | Retrieves images for a post.                                                |
| postRating                      | postId: number, ratingIndex: number, body: Record<string, unknown> | Promise     | Posts a rating for a post.                                                  |
| deleteRating                    | postId: number, ratingIndex: number         | Promise     | Deletes a rating for a post.                                                |

## Examples

```typescript
// Example usage of the YpServerApi class to check if a user is logged in
const api = new YpServerApi();
api.isloggedin().then(response => {
  console.log('Is logged in:', response);
});
```

```typescript
// Example usage of the YpServerApi class to log out a user
const api = new YpServerApi();
api.logout().then(response => {
  console.log('User logged out:', response);
});
```

```typescript
// Example usage of the YpServerApi class to get the admin rights of the logged-in user
const api = new YpServerApi();
api.getAdminRights().then(adminRights => {
  console.log('Admin rights:', adminRights);
});
```

```typescript
// Example usage of the YpServerApi class to set the locale for the logged-in user
const api = new YpServerApi();
const body = { locale: 'en-US' };
api.setLocale(body).then(response => {
  console.log('Locale set:', response);
});
```

```typescript
// Example usage of the YpServerApi class to get recommendations for a specific group
const api = new YpServerApi();
const groupId = 123;
api.getRecommendationsForGroup(groupId).then(recommendations => {
  console.log('Recommendations:', recommendations);
});
```

Please note that the return type for all methods is `Promise`, indicating that these methods return promises that resolve with the response from the API calls. The actual type of the resolved value is not specified here and would depend on the API's response format.