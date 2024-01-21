# YpImage

`YpImage` is an element for displaying an image that provides useful sizing and preloading options not found on the standard `<img>` tag.

## Properties

| Name          | Type                | Description                                                                                   |
|---------------|---------------------|-----------------------------------------------------------------------------------------------|
| src           | string \| undefined | The URL of an image.                                                                          |
| alt           | string \| undefined | A short text alternative for the image.                                                       |
| crossorigin   | string \| undefined | CORS enabled images support.                                                                  |
| preventLoad   | boolean             | When true, prevents the image from loading and shows any placeholder.                         |
| sizing        | string \| undefined | Sets a sizing option for the image. Valid values are `contain`, `cover`, or `null`.           |
| position      | string              | Determines how the image is aligned within the element bounds when a sizing option is used.   |
| preload       | boolean             | When true, shows the placeholder image until the new image has loaded.                        |
| placeholder   | string \| undefined | The image to be used as a background/placeholder until the src image has loaded.              |
| fade          | boolean             | When true and `preload` is true, causes the placeholder to fade into place.                   |
| loaded        | boolean             | Read-only value that is true when the image is loaded.                                        |
| loading       | boolean             | Read-only value that tracks the loading state of the image when the `preload` option is used. |
| error         | boolean             | Read-only value that indicates that the last set `src` failed to load.                        |
| width         | string \| undefined | Can be used to set the width of the image; size may also be set via CSS.                      |
| height        | string \| undefined | Can be used to set the height of the image; size may also be set via CSS.                     |

## Methods

| Name          | Parameters | Return Type | Description |
|---------------|------------|-------------|-------------|
| $$(id: string) | id: string | HTMLElement \| null | Selects and returns the element with the given id from the shadow DOM. |

## Events

- **load**: Emitted when the image is successfully loaded.
- **error**: Emitted when the image fails to load.

## Examples

```typescript
// Example usage of the yp-image element with cover sizing
<yp-image style="width:400px; height:400px;" sizing="cover" src="http://lorempixel.com/600/400"></yp-image>

// Example usage of the yp-image element with contain sizing
<yp-image style="width:400px; height:400px;" sizing="contain" src="http://lorempixel.com/600/400"></yp-image>

// Example usage of the yp-image element with preload and fade options
<yp-image style="width:400px; height:400px; background-color: lightgray;" sizing="cover" preload fade src="http://lorempixel.com/600/400"></yp-image>
```