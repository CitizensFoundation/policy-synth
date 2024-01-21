# YpUserImage

The `YpUserImage` class is a web component that extends `YpBaseElement` to display user images. It supports various sizes and can source images from a user's profile or Facebook account.

## Properties

| Name            | Type                  | Description                                           |
|-----------------|-----------------------|-------------------------------------------------------|
| veryLarge       | Boolean               | If true, displays a very large version of the image.  |
| large           | Boolean               | If true, displays a large version of the image.       |
| titleFromUser   | String \| undefined   | Optional title for the image from the user.           |
| user            | YpUserData            | The user data object containing image information.    |
| noDefault       | Boolean               | If true, no default image is displayed.               |
| noProfileImage  | Boolean               | If true, indicates that there is no profile image.    |

## Methods

| Name            | Parameters | Return Type | Description                                         |
|-----------------|------------|-------------|-----------------------------------------------------|
| userTitle       | None       | String      | Returns the title for the user image.               |
| profileImageUrl | None       | String \| null | Returns the URL of the user's profile image if available, otherwise null. |
| computeClass    | None       | String      | Computes the CSS class based on the image size.     |
| computeFacebookSrc | None   | String \| undefined | Computes the Facebook image source URL if available. |

## Examples

```typescript
// Example usage of the YpUserImage web component
<yp-user-image
  .user="${yourUserObject}"
  .titleFromUser="${'User Title'}"
  large
  noDefault
></yp-user-image>
```

Please note that the `YpUserData` type and `YpMediaHelpers` class are not defined in the provided code snippet. You would need to refer to the respective definitions in your project to understand the structure of `YpUserData` and the functionality provided by `YpMediaHelpers`.