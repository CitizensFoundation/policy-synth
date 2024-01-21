# YpCollectionHeader

The `YpCollectionHeader` class is a custom element that extends `YpBaseElement` to display a header for a collection, which can be a domain, community, or group. It includes properties for the collection data, type, and various UI elements such as images, videos, and welcome HTML content. It also includes methods for rendering the header, stats, menu, and footer, as well as event listeners for media playback and menu interactions.

## Properties

| Name                 | Type                      | Description                                                                 |
|----------------------|---------------------------|-----------------------------------------------------------------------------|
| collection           | YpCollectionData\|undefined | The data object for the collection being displayed.                         |
| collectionType       | string\|undefined          | The type of collection, such as 'domain', 'community', or 'group'.         |
| hideImage            | boolean                   | A flag to hide or show the collection image.                                |
| flaggedContentCount  | number\|undefined          | The count of flagged content within the collection.                         |
| collectionVideoId    | number\|undefined          | The ID of the video associated with the collection.                         |
| welcomeHTML          | string\|undefined          | HTML content to be displayed as a welcome message for the collection.       |
| playStartedAt        | Date\|undefined            | The date and time when video playback started.                              |
| videoPlayListener    | Function\|undefined        | A function to handle video play events.                                     |
| videoPauseListener   | Function\|undefined        | A function to handle video pause events.                                    |
| videoEndedListener   | Function\|undefined        | A function to handle video ended events.                                    |
| audioPlayListener    | Function\|undefined        | A function to handle audio play events.                                     |
| audioPauseListener   | Function\|undefined        | A function to handle audio pause events.                                    |
| audioEndedListener   | Function\|undefined        | A function to handle audio ended events.                                    |
| hasCollectionAccess  | boolean                   | A computed property indicating if the user has access to the collection.    |
| collectionVideos     | Array\<YpVideoData\>\|undefined | A computed property providing the collection's videos.                     |
| openMenuLabel        | string                    | A computed property providing the label for the menu button.                 |
| collectionHeaderImages | Array\<YpImageData\>\|undefined | A computed property providing the collection's header images.             |
| collectionVideoURL   | string\|undefined          | A computed property providing the URL of the collection's cover video.      |
| collectionVideoPosterURL | string\|undefined      | A computed property providing the URL of the collection's video poster.     |
| collectionHeaderImagePath | string\|undefined     | A computed property providing the URL of the collection's header image.     |

## Methods

| Name               | Parameters | Return Type | Description                                                                 |
|--------------------|------------|-------------|-----------------------------------------------------------------------------|
| renderStats        | -          | TemplateResult\|nothing | Renders the stats for the collection based on its type.                    |
| renderFirstBoxContent | -      | TemplateResult\|nothing | Renders the content for the first box, which can be welcome HTML, video, or image. |
| _openMenu          | -          | void        | Opens the collection menu.                                                  |
| renderMenu         | -          | TemplateResult | Renders the menu for the collection.                                       |
| renderFooter       | -          | TemplateResult | Renders the footer for the collection.                                     |
| render             | -          | TemplateResult | Renders the entire collection header.                                      |
| connectedCallback  | -          | void        | Lifecycle callback that runs when the element is added to the DOM.         |
| disconnectedCallback | -        | void        | Lifecycle callback that runs when the element is removed from the DOM.     |
| firstUpdated       | changedProperties: Map<string\|number\|symbol, unknown> | void | Lifecycle callback that runs after the element's first render.           |
| updated            | changedProperties: Map<string\|number\|symbol, unknown> | void | Lifecycle callback that runs after the element's properties have changed. |
| _pauseMediaPlayback | -         | void        | Pauses media playback.                                                      |
| _menuSelection     | event: CustomEvent | void | Handles menu selection events.                                             |

## Events (if any)

- **yp-got-admin-rights**: Emitted when the user gains admin rights, prompting an update.
- **yp-pause-media-playback**: Emitted to pause media playback.

## Examples

```typescript
// Example usage of the YpCollectionHeader element
<yp-collection-header
  .collection=${myCollectionData}
  collectionType="community"
  hideImage=${false}
></yp-collection-header>
```

Note: The actual usage of the element would depend on the context within the application and the data provided to it.