# YpAccessHelpers

A utility class providing static methods to check access rights for various objects like images, posts, points, groups, communities, and domains based on user permissions and admin rights.

## Properties

This class does not have properties as all methods are static.

## Methods

| Name                     | Parameters                                                                 | Return Type | Description                                                                                   |
|--------------------------|----------------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------|
| _hasAdminRights          | objectId: number, adminRights: Array\<YpCollectionData\>                   | boolean     | Checks if the user has admin rights for the given object ID.                                  |
| _hasAccess               | object: YpCollectionData \| YpImageData \| YpPointData \| YpPostData, objectId: number, adminRights: Array\<YpCollectionData\> | boolean     | Determines if the user has access to the specified object.                                    |
| hasImageAccess           | image: YpImageData, post: YpPostData                                       | boolean     | Checks if the user has access to the specified image within a post.                           |
| checkPostAccess          | post: YpPostData                                                           | boolean     | Verifies if the user has access to the specified post.                                        |
| checkPointAccess         | point: YpPointData                                                         | boolean     | Determines if the user has access to the specified point.                                     |
| checkPostAdminOnlyAccess | post: YpPostData                                                           | boolean     | Checks if the user has admin-only access to the specified post.                               |
| checkGroupAccess         | group: YpGroupData                                                         | boolean     | Verifies if the user has access to the specified group.                                       |
| checkCommunityAccess     | community: YpCommunityData                                                 | boolean     | Determines if the user has access to the specified community.                                 |
| checkDomainAccess        | domain: YpDomainData                                                       | boolean     | Checks if the user has access to the specified domain.                                        |
| hasUserAccess            | user: YpUserData                                                           | boolean     | Determines if the current user has access to the specified user object (typically their own). |

## Examples

```typescript
// Example usage of checking if a user has admin rights
const hasAdmin = YpAccessHelpers._hasAdminRights(someObjectId, userAdminRights);

// Example usage of checking if a user has access to a post
const canAccessPost = YpAccessHelpers.checkPostAccess(somePostData);

// Example usage of checking if a user has access to a group
const canAccessGroup = YpAccessHelpers.checkGroupAccess(someGroupData);
```

Note: The actual implementation of `YpCollectionData`, `YpImageData`, `YpPointData`, `YpPostData`, `YpGroupData`, `YpCommunityData`, `YpDomainData`, and `YpUserData` are not provided in this documentation. These should be defined elsewhere in your project's type definitions. Additionally, `window.appUser` is assumed to be a global object containing user and admin rights information.