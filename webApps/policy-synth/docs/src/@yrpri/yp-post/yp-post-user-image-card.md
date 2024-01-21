# YpPostUserImageCard

A custom web component that represents a card containing a user image, its description, and photographer name, with edit and delete options if the user has access to the image.

## Properties

| Name   | Type         | Description                                                                 |
|--------|--------------|-----------------------------------------------------------------------------|
| image  | YpImageData  | The image data object containing details like description and photographer. |
| post   | YpPostData   | The post data object associated with the image.                             |

## Methods

| Name       | Parameters | Return Type | Description                                                                 |
|------------|------------|-------------|-----------------------------------------------------------------------------|
| _openEdit  |            | void        | Opens the edit dialog for the image.                                        |
| _openDelete|            | void        | Opens the delete confirmation dialog for the image.                         |
| _refresh   |            | void        | Emits a 'refresh' event to notify the need for refreshing the component.    |
| imageUrl   |            | string      | Computes and returns the URL for the image based on the provided image data.|

## Events

- **refresh**: Description of when and why the event is emitted.

## Examples

```typescript
// Example usage of the YpPostUserImageCard
<yp-post-user-image-card .image="{...}" .post="{...}"></yp-post-user-image-card>
```

Please note that the actual implementation of the `_openEdit` and `_openDelete` methods, as well as the `YpImageData` and `YpPostData` types, are not fully provided in the given code snippet. The methods `_openEdit` and `_openDelete` are placeholders for functionality that would be implemented to handle editing and deleting the image, respectively. The `YpImageData` and `YpPostData` types would need to be defined elsewhere in the codebase.