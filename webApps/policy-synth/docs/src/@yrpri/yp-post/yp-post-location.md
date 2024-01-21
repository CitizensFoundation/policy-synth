# YpPostLocation

A custom element that provides a map interface for selecting a location, typically used for associating a geographical location with a post.

## Properties

| Name                    | Type                        | Description                                                                 |
|-------------------------|-----------------------------|-----------------------------------------------------------------------------|
| map                     | YpLitGoogleMapElement       | The map element used for displaying the location.                           |
| group                   | YpGroupData                 | The group data which may contain default location settings.                 |
| post                    | YpPostData                  | The post data which may be associated with a location.                      |
| defaultLatitude         | Number                      | The default latitude to center the map on.                                  |
| defaultLongitude        | Number                      | The default longitude to center the map on.                                 |
| mapSearchString         | String                      | The current search string input by the user for finding a location on the map. |
| mapSearchResultAddress  | String                      | The address result from the map search.                                     |
| location                | YpLocationData              | The selected location data.                                                 |
| encodedLocation         | String                      | A JSON string representation of the selected location data.                 |
| marker                  | HTMLElement                 | The map marker element.                                                     |
| active                  | Boolean                     | Indicates if the element is active.                                         |
| narrowPad               | Boolean                     | Indicates if the element should use a narrow padding style.                 |

## Methods

| Name             | Parameters                  | Return Type | Description                                                                 |
|------------------|-----------------------------|-------------|-----------------------------------------------------------------------------|
| updated          | changedProperties: Map      | void        | Lifecycle method called after the element’s properties have been updated.   |
| render           | -                           | TemplateResult | Renders the element template.                                               |
| _mapZoomChanged  | event: CustomEvent          | void        | Handles changes to the map zoom level.                                      |
| mapZoom          | -                           | Number      | Gets the current zoom level of the map.                                     |
| _submitOnEnter   | event: KeyboardEvent        | void        | Submits the map search when the Enter key is pressed.                       |
| _searchMap       | -                           | void        | Initiates a search on the map based on the current search string.           |
| connectedCallback| -                           | void        | Lifecycle method called when the element is added to the document’s DOM.    |
| _zoomChanged     | event: CustomEvent          | void        | Handles changes to the map zoom level.                                      |
| _mapTypeChanged  | event: CustomEvent          | void        | Handles changes to the map type.                                            |
| _locationChanged | -                           | void        | Handles changes to the selected location.                                   |
| _setLocation     | event: CustomEvent          | void        | Sets the selected location based on a map event.                            |
| _groupChanged    | -                           | void        | Handles changes to the group data and updates default location accordingly. |
| _postChanged     | -                           | void        | Handles changes to the post data and updates location accordingly.          |

## Events

- **map-zoom-changed**: Emitted when the zoom level of the map changes.
- **map-type-changed**: Emitted when the type of the map changes.
- **zoom-changed**: Emitted when the zoom level of the map changes.

## Examples

```typescript
// Example usage of the YpPostLocation element
<yp-post-location
  .group="${this.group}"
  .post="${this.post}"
  .location="${this.location}"
  .active="${this.active}"
></yp-post-location>
```

Please note that the actual usage of the element would depend on the context within which it is used, including the availability of the required properties and the setup of the event listeners.