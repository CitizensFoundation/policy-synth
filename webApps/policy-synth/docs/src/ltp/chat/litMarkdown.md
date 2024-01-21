# MarkdownDirective

An async directive to render markdown in a LitElement's render function. Images can be included or removed in the executor's options.

## Properties

| Name                     | Type                                  | Description               |
|--------------------------|---------------------------------------|---------------------------|
| defaultOptions           | Options                               | Default options for the directive, including flags for image inclusion, code block class names, loading HTML, sanitization skipping, JSON block handling, and target element. |
| inJsonBlock              | boolean                               | Indicates if the directive is currently within a JSON block. |
| hasCompletedJsonParsing  | boolean                               | Indicates if JSON parsing has been completed. |

## Methods

| Name                     | Parameters                           | Return Type | Description                 |
|--------------------------|--------------------------------------|-------------|-----------------------------|
| handleJsonBlocks         | rawMarkdown: string, targetElement: YpBaseElement | string      | Processes JSON blocks within the markdown, emitting events to the target element. |
| sanitizeHTMLWithOptions  | rawHTML: string, options: Options    | string      | Sanitizes the HTML content based on the provided options. |
| closeCodeBlockIfNeeded   | rawMarkdown: string                  | string      | Ensures that code blocks are properly closed by adding a closing delimiter if necessary. |
| removeCitations          | rawMarkdown: string                  | string      | Removes citations from the markdown content. |
| render                   | rawMarkdown: string, options?: Partial<Options> | TemplateResult | Renders the markdown content with the provided options, returning a Lit template result. |

## Events

- **jsonLoadingStart**: Emitted when the start of a JSON block is detected.
- **jsonLoadingEnd**: Emitted when the end of a JSON block is detected, along with the JSON content.
- **jsonPartialContent**: Emitted when a partial JSON content is processed within a JSON block.

## Examples

```typescript
// Example usage of the MarkdownDirective within a LitElement's render function
import { html } from 'lit';
import { resolveMarkdown } from './path-to-markdown-directive';

class MyElement extends LitElement {
  render() {
    const rawMarkdown = `# Hello World`;
    return html`<article>${resolveMarkdown(rawMarkdown)}</article>`;
  }
}

// Example with options including images and custom loading HTML
class MyElementWithOptions extends LitElement {
  render() {
    const rawMarkdown = `# Hello World
    ![image.jpeg](https://host.com/image.jpeg "image.jpeg")`;
    return html`<article>${resolveMarkdown(rawMarkdown, { includeImages: true, includeCodeBlockClassNames: true, loadingHTML: "<loading-icon></loading-icon>" })}</article>`;
  }
}
```

For the `Options` type, it is defined as the type of `MarkdownDirective.defaultOptions` which includes the following properties:

## Options

| Name                          | Type                     | Description               |
|-------------------------------|--------------------------|---------------------------|
| includeImages                 | boolean                  | Whether to include images in the rendered markdown. |
| includeCodeBlockClassNames    | boolean                  | Whether to include CSS class names for code blocks. |
| loadingHTML                   | string                   | HTML content to display while loading. |
| skipSanitization              | boolean                  | Whether to skip sanitization of the HTML content. |
| handleJsonBlocks              | boolean                  | Whether to handle JSON blocks within the markdown. |
| targetElement                 | YpBaseElement \| undefined | The target element for emitting JSON block events. |

The `Options` type is used in various methods to configure the behavior of the `MarkdownDirective`.