# MarkdownDirective

An async directive to render markdown in a LitElement's render function. Images can be included or removed in the executor's options.

## Properties

| Name                     | Type                                      | Description |
|--------------------------|-------------------------------------------|-------------|
| `defaultOptions`         | `Options`                                 | Static property holding the default options for the directive. |
| `inJsonBlock`            | `boolean`                                 | Indicates if the current processing is within a JSON block. |
| `hasCompletedJsonParsing`| `boolean`                                 | Indicates if JSON parsing within a block has been completed. |

## Methods

| Name                      | Parameters                               | Return Type | Description |
|---------------------------|------------------------------------------|-------------|-------------|
| `handleJsonBlocks`        | `rawMarkdown: string, targetElement: YpBaseElement` | `string` | Processes JSON blocks within the markdown, emitting events to the target element. |
| `sanitizeHTMLWithOptions` | `rawHTML: string, options: Options`      | `string`    | Sanitizes the HTML content based on the provided options. Currently returns rawHTML without sanitization. |
| `closeCodeBlockIfNeeded`  | `rawMarkdown: string`                    | `string`    | Closes code blocks in the markdown if they are not properly closed. |
| `removeCitations`         | `rawMarkdown: string`                    | `string`    | Removes citations from the markdown content. |
| `render`                  | `rawMarkdown: string, options?: Partial<Options>` | `unknown` | Renders the markdown content with the provided options, returning the rendered HTML. |

## Events

- `jsonLoadingStart`: Fired when a JSON block starts loading.
- `jsonLoadingEnd`: Fired when a JSON block has finished loading, with the JSON content.
- `jsonPartialContent`: Fired when a part of a JSON block is processed.

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

## Types

### Options

```typescript
type Options = {
  includeImages: boolean;
  includeCodeBlockClassNames: boolean;
  loadingHTML: string;
  skipSanitization: boolean;
  handleJsonBlocks: boolean;
  targetElement: YpBaseElement | undefined;
};
```