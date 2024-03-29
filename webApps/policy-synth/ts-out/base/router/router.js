/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { Routes } from './routes.js';
// We cache the origin since it can't change
const origin = location.origin || location.protocol + '//' + location.host;
/**
 * A root-level router that installs global event listeners to intercept
 * navigation.
 *
 * This class extends Routes so that it can also have a route configuration.
 *
 * There should only be one Router instance on a page, since the Router
 * installs global event listeners on `window` and `document`. Nested
 * routes should be configured with the `Routes` class.
 */
export class PsRouter extends Routes {
    constructor() {
        super(...arguments);
        this._onClick = (e) => {
            const isNonNavigationClick = e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey;
            if (e.defaultPrevented || isNonNavigationClick) {
                return;
            }
            const anchor = e
                .composedPath()
                .find((n) => n.tagName === 'A');
            if (anchor === undefined ||
                anchor.target !== '' ||
                anchor.hasAttribute('download') ||
                anchor.getAttribute('rel') === 'external') {
                return;
            }
            const href = anchor.href;
            if (href === '' || href.startsWith('mailto:')) {
                return;
            }
            const location = window.location;
            if (anchor.origin !== origin) {
                return;
            }
            e.preventDefault();
            if (href !== location.href) {
                window.history.pushState({}, '', href);
                this.goto(anchor.pathname);
            }
        };
        this._onPopState = (_e) => {
            this.goto(window.location.pathname);
        };
    }
    hostConnected() {
        super.hostConnected();
        window.addEventListener('click', this._onClick);
        window.addEventListener('popstate', this._onPopState);
        // Kick off routed rendering by going to the current URL
        this.goto(window.location.pathname);
    }
    hostDisconnected() {
        super.hostDisconnected();
        window.removeEventListener('click', this._onClick);
        window.removeEventListener('popstate', this._onPopState);
    }
}
//# sourceMappingURL=router.js.map