import { AsyncDirective } from 'lit/async-directive';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element';
type Options = typeof MarkdownDirective.defaultOptions;
/**
 * An async directive to render markdown in a LitElement's render function.
 * Images can be included or removed in the executor's options.
 */
export declare class MarkdownDirective extends AsyncDirective {
    static defaultOptions: {
        includeImages: boolean;
        includeCodeBlockClassNames: boolean;
        loadingHTML: string;
        skipSanitization: boolean;
        handleJsonBlocks: boolean;
        targetElement: YpBaseElement;
    };
    inJsonBlock: boolean;
    hasCompletedJsonParsing: boolean;
    handleJsonBlocks(rawMarkdown: string, targetElement: YpBaseElement): string;
    private sanitizeHTMLWithOptions;
    private closeCodeBlockIfNeeded;
    private removeCitations;
    render(rawMarkdown: string, options?: Partial<Options>): import("lit/directive").DirectiveResult<typeof import("lit/directives/unsafe-html").UnsafeHTMLDirective>;
}
/**
 * An asyn directive used to render markedown in a LitElement's render function.
 *
 * Rendering pictures can be enabled through the settings.
 * Css class names for code blocks may also be enabled through settings.
 *
 * setting the "skipSanitization" option to true will skip the sanitization process and render markdown as raw HTML.
 * _Use with caution!_
 *
 * The default loading html may also be replaced.
 * This default HTML is also sanitized by default.
 * If the "skipSanitization" option is true, the default HTML will also not be sanitized.
 *
 * @example render() {
 *            const rawMarkdown = `# Hello World`
 *            return html`<article>${resolveMarkdown(rawMarkdown)}</article>`
 * }
 *
 * @example render() {
 *            const rawMarkdown = `# Hello World
 *            ![image.jpeg](https://host.com/image.jpeg "image.jpeg")`;
 *            return html`<article>${resolveMarkdown(rawMarkdown, { includeImages: true, includeCodeBlockClassNames: true, loadingHTML: "<loading-icon></loading-icon>" })}</article>`
 * }
 * @typedef {Parameters<InstanceType<typeof MarkdownDirective>['render']>} RenderParameters
 * @param {RenderParameters[0]} rawMarkdown Markdown to be rendered.
 * @param {RenderParameters[1]} options
 */
export declare const resolveMarkdown: (rawMarkdown: string, options?: Partial<{
    includeImages: boolean;
    includeCodeBlockClassNames: boolean;
    loadingHTML: string;
    skipSanitization: boolean;
    handleJsonBlocks: boolean;
    targetElement: YpBaseElement;
}>) => import("lit/directive").DirectiveResult<typeof MarkdownDirective>;
export {};
//# sourceMappingURL=litMarkdown.d.ts.map