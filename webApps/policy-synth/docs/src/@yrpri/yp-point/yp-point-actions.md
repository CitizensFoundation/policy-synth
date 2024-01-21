# YpPointActions

`YpPointActions` is a custom web component that provides a user interface for interacting with a point, such as voting if a point is helpful or not, and sharing the point. It extends from `YpBaseElement` which likely provides common functionality for the application's web components.

## Properties

| Name              | Type                      | Description                                           |
|-------------------|---------------------------|-------------------------------------------------------|
| point             | YpPointData \| undefined  | The point data associated with the actions.           |
| hideNotHelpful    | Boolean                   | Flag to hide the 'Not Helpful' action.                |
| isUpVoted         | Boolean                   | Indicates whether the point has been upvoted.         |
| allDisabled       | Boolean                   | Disables all actions when set to true.                |
| hideSharing       | Boolean                   | Flag to hide the sharing action.                      |
| configuration     | YpGroupConfiguration \| undefined | Configuration settings for the group.             |
| pointQualityValue | Number \| undefined       | The quality value of the point.                       |
| pointUrl          | String \| undefined       | The URL to the point for sharing purposes.            |

## Methods

| Name                           | Parameters        | Return Type | Description                                                                 |
|--------------------------------|-------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback              | -                 | void        | Lifecycle method that runs when the component is added to the DOM.          |
| disconnectedCallback           | -                 | void        | Lifecycle method that runs when the component is removed from the DOM.      |
| masterHideSharing              | -                 | Boolean     | Computes whether the sharing action should be hidden based on configuration. |
| _sharedContent                 | event: CustomEvent| void        | Handles the content shared event.                                           |
| _shareTap                      | event: CustomEvent| void        | Handles the share tap event.                                                |
| _onPointChanged                | -                 | void        | Called when the point property changes.                                     |
| _updateQualitiesFromSignal     | -                 | void        | Updates the qualities of the point from a signal.                           |
| _updateQualities               | -                 | void        | Updates the qualities of the point.                                         |
| _qualityChanged                | -                 | void        | Called when the quality of the point changes.                               |
| _resetClasses                  | -                 | void        | Resets the CSS classes based on the point quality value.                    |
| _setPointQuality               | value: Number \| undefined | void | Sets the point quality value and updates classes.                       |
| generatePointQuality           | value: Number     | Promise     | Generates a point quality based on the given value.                         |
| _pointQualityResponse          | pointQualityResponse: YpPointQualityResponse | void | Handles the response after setting point quality. |
| generatePointQualityFromLogin  | value: Number     | void        | Generates point quality after a user logs in.                               |
| pointHelpful                   | -                 | void        | Marks the point as helpful and updates the UI accordingly.                   |
| pointNotHelpful                | -                 | void        | Marks the point as not helpful and updates the UI accordingly.               |

## Events (if any)

- **yp-got-endorsements-and-qualities**: Emitted when endorsements and qualities are received, triggering an update in point qualities.

## Examples

```typescript
// Example usage of the YpPointActions component
<yp-point-actions
  .point="${this.pointData}"
  .hideNotHelpful="${false}"
  .isUpVoted="${true}"
  .allDisabled="${false}"
  .hideSharing="${false}"
  .configuration="${this.groupConfiguration}"
  .pointQualityValue="${1}"
  .pointUrl="${'https://example.com/point/123'}">
</yp-point-actions>
```

Note: The above example assumes that `this.pointData`, `this.groupConfiguration`, and other properties are defined in the context where the `YpPointActions` component is used.