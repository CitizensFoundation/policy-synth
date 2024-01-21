# YpPostUserImages

A custom web component that manages and displays user images associated with a post.

## Properties

| Name   | Type                     | Description                                      |
|--------|--------------------------|--------------------------------------------------|
| images | Array<YpImageData> \| undefined | An array of user images data or undefined.       |
| post   | YpPostData \| undefined  | The post data associated with the user images or undefined. |

## Methods

| Name         | Parameters                                | Return Type | Description                                      |
|--------------|-------------------------------------------|-------------|--------------------------------------------------|
| updated      | changedProperties: Map<string \| number \| symbol, unknown> | void        | Lifecycle method called when properties change. |
| render       |                                           | unknown     | Renders the HTML template for the component.     |
| _refresh     |                                           | Promise<void> | Refreshes the images by fetching new data.      |
| _postChanged |                                           | void        | Called when the post property changes.          |
| _newImage    |                                           | void        | Handles the creation of a new user image.       |

## Events

- **yp-post-image-count**: Emitted with the count of images after refreshing the images list.

## Examples

```typescript
// Example usage of the YpPostUserImages component
<yp-post-user-images .images=${this.images} .post=${this.post}></yp-post-user-images>
```

Please note that the actual implementation of `YpImageData`, `YpPostData`, and the `window.serverApi.getImages` method are not provided in the given code snippet. These should be defined elsewhere in your application.