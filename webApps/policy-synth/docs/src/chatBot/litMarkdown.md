# MarkdownDirective

An async directive to render markdown in a LitElement's render function. Images can be included or removed in the executor's options.

## Properties

| Name                     | Type                                      | Description |
|--------------------------|-------------------------------------------|-------------|
| `defaultOptions`         | `Options`                                 | Static property containing the default options for the directive. |
| `inJsonBlock`            | `boolean`                                 | Indicates if the current processing is within a JSON block. |
| `hasCompletedJsonParsing`| `boolean`                                 | Indicates if JSON parsing within a block has been completed. |

## Methods

| Name                      | Parameters                               | Return Type | Description |
|---------------------------|------------------------------------------|-------------|-------------|
| `handleJsonBlocks`        | `rawMarkdown: string, targetElement: YpBaseElement` | `string` | Processes markdown to handle JSON blocks, emitting events to the target element. |
| `sanitizeHTMLWithOptions` | `rawHTML: string, options: Options`      | `string`    | Sanitizes the HTML content based on the provided options. Currently returns the raw HTML without sanitization. |
| `closeCodeBlockIfNeeded`  | `rawMarkdown: string`                    | `string`    | Ensures that code blocks are properly closed by adding a closing delimiter if needed. |
| `removeCitations`         | `rawMarkdown: string`                    | `string`    | Removes citations from the markdown content. Currently not used in the `render` method. |
| `render`                  | `rawMarkdown: string, options?: Partial<Options>` | `TemplateResult` | Processes the markdown content, applies markdown parsing, and returns the rendered HTML as a Lit template result. |

## Events

- `jsonLoadingStart`: Fired when a JSON block starts being processed.
- `jsonLoadingEnd`: Fired when a JSON block has been fully processed, with the JSON content as detail.
- `jsonPartialContent`: Fired when a part of a JSON block is processed, with the partial JSON content as detail.

## Example

```typescript
import { html } from 'lit';
import { resolveMarkdown } from '@policysynth/webapp/chatBot/litMarkdown.js';

class MyElement extends LitElement {
  render() {
    const rawMarkdown = `# Hello World
    ![image.jpeg](https://host.com/image.jpeg "image.jpeg")`;
    return html`<article>${resolveMarkdown(rawMarkdown, { includeImages: true, includeCodeBlockClassNames: true, loadingHTML: "<loading-icon></loading-icon>" })}</article>`;
  }
}
```

```typescript
import { html } from 'lit';
import { resolveMarkdown } from '@policysynth/webapp/chatBot/litMarkdown.js';

class AnotherElement extends LitElement {
  render() {
    const rawMarkdown = `# Hello World`;
    return html`<article>${resolveMarkdown(rawMarkdown)}</article>`;
  }
}
```