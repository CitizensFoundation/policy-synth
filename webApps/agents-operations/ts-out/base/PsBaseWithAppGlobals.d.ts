import { YpBaseElement } from "@yrpri/webapp/common/yp-base-element";
export declare class PsBaseWithAppGlobalsObserver extends YpBaseElement {
    appGlobalsObserver: MutationObserver;
    constructor();
    connectedCallback(): void;
    observeGlobalState(): void;
    handleMutation(): void;
}
//# sourceMappingURL=PsBaseWithAppGlobals.d.ts.map