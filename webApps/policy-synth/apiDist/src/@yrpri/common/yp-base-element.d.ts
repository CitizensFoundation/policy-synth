import { LitElement } from 'lit';
export declare class YpBaseElement extends LitElement {
    language: string;
    wide: boolean;
    rtl: boolean;
    largeFont: boolean;
    themeColor: string;
    themeDarkMode: boolean | undefined;
    static get styles(): any;
    connectedCallback(): void;
    disconnectedCallback(): void;
    get isAppleDevice(): boolean;
    _changeThemeColor(event: CustomEvent): void;
    _changeThemeDarkMode(event: CustomEvent): void;
    updated(changedProperties: Map<string | number | symbol, unknown>): void;
    static get rtlLanguages(): string[];
    languageChanged(): void;
    _setupRtl(): void;
    _largeFont(event: CustomEvent): void;
    _languageEvent(event: CustomEvent): void;
    fire(eventName: string, data?: object | string | boolean | number | null, target?: LitElement | Document): void;
    fireGlobal(eventName: string, data?: object | string | boolean | number | null): void;
    addListener(name: string, callback: Function, target?: LitElement | Document): void;
    addGlobalListener(name: string, callback: Function): void;
    removeListener(name: string, callback: Function, target?: LitElement | Document): void;
    removeGlobalListener(name: string, callback: Function): void;
    t(...args: Array<string>): string;
    $$(id: string): HTMLElement | null;
}
//# sourceMappingURL=yp-base-element.d.ts.map