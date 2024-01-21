# YpPostMap

The `YpPostMap` class is a custom element that extends `YpBaseElement` to display a map with markers representing posts. It uses `lit-google-map` to render the map and custom markers for each post. The class provides functionality to handle changes in group or community IDs, refresh the map, and respond to marker clicks.

## Properties

| Name           | Type                     | Description                                                                 |
|----------------|--------------------------|-----------------------------------------------------------------------------|
| posts          | Array<YpPostData>        | An array of post data to be displayed on the map.                           |
| groupId        | number                   | The ID of the group whose posts are to be displayed on the map.             |
| communityId    | number                   | The ID of the community whose posts are to be displayed on the map.         |
| noPosts        | boolean                  | A flag indicating whether there are no posts to display on the map.         |
| selectedPost   | YpPostData               | The post data that is currently selected.                                   |
| collectionId   | number                   | The ID of the collection (group or community) whose posts are to be shown.  |
| collectionType | string                   | The type of the collection (group or community).                            |
| skipFitToMarkersNext | boolean            | A flag to skip fitting the map to markers on the next update.               |

## Methods

| Name             | Parameters                  | Return Type | Description                                                                 |
|------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| updated          | changedProperties: Map      | void        | Called when the properties of the component change.                         |
| renderInfoCard   | post: YpPostData            | TemplateResult | Renders an info card for the given post.                                   |
| render           | -                           | TemplateResult | Renders the component.                                                      |
| resetMapHeight   | -                           | void        | Resets the height of the map based on the window size.                      |
| connectedCallback| -                           | void        | Lifecycle method called when the element is added to the document's DOM.    |
| disconnectedCallback | -                       | void        | Lifecycle method called when the element is removed from the document's DOM.|
| _groupChanged    | -                           | Promise<void> | Handles changes to the `groupId` property.                                 |
| _communityChanged| -                           | Promise<void> | Handles changes to the `communityId` property.                             |
| _refreshAjax     | -                           | void        | Refreshes the map data based on the current group or community ID.          |
| _response        | response: Array<YpPostData> | void        | Handles the response from the server API for post locations.                |
| markerClick      | post: YpPostData            | void        | Handles click events on map markers.                                        |

## Events (if any)

- **yp-refresh-group-posts**: Emitted when the group posts need to be refreshed.

## Examples

```typescript
// Example usage of the YpPostMap custom element
<yp-post-map
  .posts="${this.posts}"
  .groupId="${this.groupId}"
  .communityId="${this.communityId}"
  .noPosts="${this.noPosts}"
  .selectedPost="${this.selectedPost}"
  .collectionId="${this.collectionId}"
  .collectionType="${this.collectionType}"
  .skipFitToMarkersNext="${this.skipFitToMarkersNext}">
</yp-post-map>
```

Please note that the above example assumes that you have the necessary properties (`posts`, `groupId`, etc.) available in your context to pass to the `YpPostMap` element.