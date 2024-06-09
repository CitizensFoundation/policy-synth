import { YpBaseElement } from "@yrpri/webapp/common/yp-base-element";
export class PsBaseWithAppGlobalsObserver extends YpBaseElement {
    constructor() {
        super();
        this.appGlobalsObserver = new MutationObserver(this.handleMutation.bind(this));
    }
    connectedCallback() {
        super.connectedCallback();
        this.observeGlobalState();
    }
    observeGlobalState() {
        const config = { attributes: true, childList: true, subtree: true };
        this.appGlobalsObserver.observe(window.psAppGlobals, config);
    }
    handleMutation() {
        // Implement by subclass
    }
}
//# sourceMappingURL=PsBaseWithAppGlobals.js.map