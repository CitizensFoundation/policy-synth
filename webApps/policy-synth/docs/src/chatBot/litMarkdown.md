# MarkdownDirective

An async directive to render markdown in a LitElement's render function. Images can be included or removed in the executor's options.

## Properties

| Name                     | Type                                  | Description               |
|--------------------------|---------------------------------------|---------------------------|
| defaultOptions           | Options                               | Default options for the directive. |
| inJsonBlock              | boolean                               | Indicates if currently inside a JSON block. |
| hasCompletedJsonParsing  | boolean                               | Indicates if JSON parsing has completed. |

## Methods

| Name                      | Parameters                                    | Return Type | Description                 |
|---------------------------|-----------------------------------------------|-------------|-----------------------------|
| handleJsonBlocks          | rawMarkdown: string, targetElement: YpBaseElement | string      | Handles JSON blocks within the markdown, firing events on the target element. |
| sanitizeHTMLWithOptions   | rawHTML: string, options: Options             | string      | Sanitizes the HTML with the given options. Currently returns rawHTML without sanitization. |
| closeCodeBlockIfNeeded    | rawMarkdown: string                           | string      | Closes code blocks if they are left open in the markdown. |
| removeCitations           | rawMarkdown: string                           | string      | Removes citations from the markdown. Currently not implemented in the render method. |
| render                    | rawMarkdown: string, options?: Partial<Options> | TemplateResult | Renders the markdown with the given options, returning a TemplateResult. |

## Events

- **jsonLoadingStart**: Fired when a JSON block starts loading.
- **jsonLoadingEnd**: Fired when a JSON block has finished loading, with the JSON content.
- **jsonPartialContent**: Fired when a partial JSON content is processed.

## Examples

```typescript
// Example usage of the MarkdownDirective within a LitElement's render function
import { html } from 'lit';
import { resolveMarkdown } from './path-to-markdown-directive';

class MyCustomElement extends LitElement {
  render() {
    const rawMarkdown = `# Hello World`;
    return html`<article>${resolveMarkdown(rawMarkdown)}</article>`;
  }
}

// Example with options, including images and custom loading HTML
class MyCustomElementWithOptions extends LitElement {
  render() {
    const rawMarkdown = `# Hello World
    ![image.jpeg](https://host.com/image.jpeg "image.jpeg")`;
    const options = { includeImages: true, includeCodeBlockClassNames: true, loadingHTML: "<loading-icon></loading-icon>" };
    return html`<article>${resolveMarkdown(rawMarkdown, options)}</article>`;
  }
}
```

# resolveMarkdown

An async directive used to render markdown in a LitElement's render function.

## Methods

| Name       | Parameters                                    | Return Type | Description                 |
|------------|-----------------------------------------------|-------------|-----------------------------|
| directive  | MarkdownDirective                             | Function    | Returns a function that can be used in a LitElement's render method to render markdown content. |

## Examples

```typescript
// Example usage of resolveMarkdown in a LitElement's render function
import { html } from 'lit';
import { resolveMarkdown } from './path-to-markdown-directive';

class MyCustomElement extends LitElement {
  render() {
    const rawMarkdown = `# Hello World`;
    return html`<article>${resolveMarkdown(rawMarkdown)}</article>`;
  }
}

// Example with options, including images and custom loading HTML
class MyCustomElementWithOptions extends LitElement {
  render() {
    const rawMarkdown = `# Hello World
    ![image.jpeg](https://host.com/image.jpeg "image.jpeg")`;
    const options = { includeImages: true, includeCodeBlockClassNames: true, loadingHTML: "<loading-icon></loading-icon>" };
    return html`<article>${resolveMarkdown(rawMarkdown, options)}</article>`;
  }
}
```