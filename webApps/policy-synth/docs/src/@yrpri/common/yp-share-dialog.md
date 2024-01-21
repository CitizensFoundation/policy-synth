# YpShareDialog

`YpShareDialog` is a web component that extends `YpBaseElement` to provide a share dialog functionality. It uses the `share-menu` component to allow users to share content via various social media platforms and other means like email or clipboard.

## Properties

| Name          | Type     | Description                                       |
|---------------|----------|---------------------------------------------------|
| sharedContent | Function | A function to be called when the share event occurs. |
| url           | String   | The URL to be shared.                             |
| label         | String   | A label for the share dialog.                     |

## Methods

| Name   | Parameters                                  | Return Type | Description                                                                 |
|--------|---------------------------------------------|-------------|-----------------------------------------------------------------------------|
| open   | url: string, label: string, sharedContent: Function | Promise<void> | Opens the share dialog with the provided URL, label, and sharedContent function. |

## Events

- **share**: Emitted when the share action is triggered.

## Examples

```typescript
// Example usage of the YpShareDialog web component
const shareDialog = document.createElement('yp-share-dialog');
document.body.appendChild(shareDialog);

const urlToShare = 'https://example.com';
const shareLabel = 'Check this out!';
const shareFunction = () => {
  console.log('Content shared!');
};

shareDialog.open(urlToShare, shareLabel, shareFunction);
```

Note: The `open` method also updates the socials array for the `share-menu` component and triggers the share functionality. The `TODO` comment indicates that there is a pending fix related to the `shareButton` element.