declare namespace twemoji {
    export const base: string;
    export const ext: string;
    export const size: string;
    export const className: string;
    export namespace convert {
        export { fromCodePoint };
        export { toCodePoint };
    }
    export function onerror(): void;
    export { parse };
    export { replace };
    export { test };
}
declare function fromCodePoint(codepoint: any): string;
declare function toCodePoint(unicodeSurrogates: any, sep: any): string;
declare function parse(what: any, how: any): any;
declare function replace(text: any, callback: any): string;
//# sourceMappingURL=twemoji.min.d.ts.map