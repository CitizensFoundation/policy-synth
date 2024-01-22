/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
import { Routes } from './routes.js';
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
export declare class PsRouter extends Routes {
    hostConnected(): void;
    hostDisconnected(): void;
    private _onClick;
    private _onPopState;
}
//# sourceMappingURL=router.d.ts.map