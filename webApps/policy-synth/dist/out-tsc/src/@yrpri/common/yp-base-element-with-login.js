import { __decorate, __metadata } from "tslib";
import { property } from 'lit/decorators.js';
import { YpBaseElement } from './yp-base-element.js';
export class YpBaseElementWithLogin extends YpBaseElement {
    constructor() {
        super();
        if (window.appUser && window.appUser.user) {
            this.loggedInUser = window.appUser.user;
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.addGlobalListener('yp-logged-in', this._loggedIn.bind(this));
        this.addGlobalListener('yp-got-admin-rights', this.requestUpdate.bind(this));
    }
    disconnectedCallback() {
        super.connectedCallback();
        this.removeGlobalListener('yp-logged-in', this._loggedIn.bind(this));
        this.removeGlobalListener('yp-got-admin-rights', this.requestUpdate.bind(this));
    }
    get isLoggedIn() {
        return this.loggedInUser != undefined;
    }
    _loggedIn(event) {
        this.loggedInUser = event.detail;
        this.requestUpdate();
    }
}
__decorate([
    property({ type: Object }),
    __metadata("design:type", Object)
], YpBaseElementWithLogin.prototype, "loggedInUser", void 0);
//# sourceMappingURL=yp-base-element-with-login.js.map