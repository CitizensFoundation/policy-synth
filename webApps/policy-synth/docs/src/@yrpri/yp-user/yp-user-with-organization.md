# YpUserWithOrganization

A custom element that displays a user with their associated organization information, including the user's image, name, and organization details.

## Properties

| Name          | Type                  | Description                                       |
|---------------|-----------------------|---------------------------------------------------|
| user          | YpUserData            | The user data to display.                         |
| titleDate     | Date \| undefined     | The date to be used in the user's title.          |
| hideImage     | boolean               | Whether to hide the user's image.                 |
| inverted      | boolean               | Whether to use the inverted style for text color. |

## Methods

| Name                 | Parameters | Return Type | Description                                      |
|----------------------|------------|-------------|--------------------------------------------------|
| userTitle            |            | string      | Computes the title for the user.                 |
| organizationName     |            | string \| null | Retrieves the name of the user's organization.   |
| organizationImageUrl |            | string \| undefined | Retrieves the URL of the organization's logo image. |

## Events

- No custom events are emitted by this component.

## Examples

```typescript
// Example usage of the YpUserWithOrganization component
<yp-user-with-organization
  .user="${this.user}"
  .titleDate="${this.titleDate}"
  ?hideImage="${this.hideImage}"
  ?inverted="${this.inverted}"
></yp-user-with-organization>
```

Note: The `YpUserData` type should be defined elsewhere in your codebase, and it should contain the necessary properties to represent a user's data, including their organization information. The `YpMediaHelpers.getImageFormatUrl` method is also assumed to be defined elsewhere and is used to retrieve the appropriate image URL for the organization's logo.