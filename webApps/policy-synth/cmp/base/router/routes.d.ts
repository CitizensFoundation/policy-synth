/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/// <reference types="urlpattern-polyfill" />
import type { ReactiveController, ReactiveControllerHost } from 'lit';
export interface BaseRouteConfig {
    name?: string | undefined;
    render?: (params: {
        [key: string]: string | undefined;
    }) => unknown;
    enter?: (params: {
        [key: string]: string | undefined;
    }) => Promise<boolean> | boolean;
}
/**
 * A RouteConfig that matches against a `path` string. `path` must be a
 * [`URLPattern` compatible pathname pattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern/pathname).
 */
export interface PathRouteConfig extends BaseRouteConfig {
    path: string;
}
/**
 * A RouteConfig that matches against a given [`URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)
 *
 * While `URLPattern` can match against protocols, hostnames, and ports,
 * routes will only be checked for matches if they're part of the current
 * origin. This means that the pattern is limited to checking `pathname` and
 * `search`.
 */
export interface URLPatternRouteConfig extends BaseRouteConfig {
    pattern: URLPattern;
}
/**
 * A description of a route, which path or pattern to match against, and a
 * render() callback used to render a match to the outlet.
 */
export type RouteConfig = PathRouteConfig | URLPatternRouteConfig;
/**
 * A reactive controller that performs location-based routing using a
 * configuration of URL patterns and associated render callbacks.
 */
export declare class Routes implements ReactiveController {
    private readonly _host;
    routes: Array<RouteConfig>;
    /**
     * A default fallback route which will always be matched if none of the
     * {@link routes} match. Implicitly matches to the path "/*".
     */
    fallback?: BaseRouteConfig;
    private readonly _childRoutes;
    private _parentRoutes;
    private _currentPathname;
    private _currentRoute;
    private _currentParams;
    /**
     * Callback to call when this controller is disconnected.
     *
     * It's critical to call this immediately in hostDisconnected so that this
     * controller instance doesn't receive a tail match meant for another route.
     */
    private _onDisconnect;
    constructor(host: ReactiveControllerHost & HTMLElement, routes: Array<RouteConfig>, options?: {
        fallback?: BaseRouteConfig;
    });
    /**
     * Returns a URL string of the current route, including parent routes,
     * optionally replacing the local path with `pathname`.
     */
    link(pathname?: string): string;
    /**
     * Navigates this routes controller to `pathname`.
     *
     * This does not navigate parent routes, so it isn't (yet) a general page
     * navigation API. It does navigate child routes if pathname matches a
     * pattern with a tail wildcard pattern (`/*`).
     */
    goto(pathname: string): Promise<void>;
    /**
     * The result of calling the current route's render() callback.
     */
    outlet(): unknown;
    /**
     * The current parsed route parameters.
     */
    get params(): {
        [key: string]: string;
    };
    /**
     * Matches `url` against the installed routes and returns the first match.
     */
    private _getRoute;
    hostConnected(): void;
    hostDisconnected(): void;
    private _onRoutesConnected;
}
/**
 * This event is fired from Routes controllers when their host is connected to
 * announce the child route and potentially connect to a parent routes controller.
 */
export declare class RoutesConnectedEvent extends Event {
    static readonly eventName = "lit-routes-connected";
    readonly routes: Routes;
    onDisconnect?: () => void;
    constructor(routes: Routes);
}
declare global {
    interface HTMLElementEventMap {
        [RoutesConnectedEvent.eventName]: RoutesConnectedEvent;
    }
}
//# sourceMappingURL=routes.d.ts.map