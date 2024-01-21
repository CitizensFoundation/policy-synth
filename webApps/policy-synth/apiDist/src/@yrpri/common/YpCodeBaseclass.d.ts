import { LitElement } from 'lit';
import { YpAppUser } from '../yp-app/YpAppUser.js';
import { CpsServerApi } from '../../base/CpsServerApi.js';
declare global {
    interface Window {
        appGlobals: any;
        appUser: YpAppUser;
        appDialogs: any;
        serverApi: CpsServerApi;
        app: any;
        locale: string;
        MSStream: any;
        PasswordCredential?: any;
        autoTranslate: boolean;
        FederatedCredential?: any;
    }
}
export declare class YpCodeBase {
    language: string | undefined;
    constructor();
    _languageEvent(event: CustomEvent): void;
    fire(eventName: string, data: object | string | boolean | number | null, target: LitElement | Document): void;
    fireGlobal(eventName: string, data?: object | string | boolean | number | null): void;
    addListener(name: string, callback: Function, target: LitElement | Document): void;
    addGlobalListener(name: string, callback: Function): void;
    showToast(text: string, timeout?: number): void;
    removeListener(name: string, callback: Function, target: LitElement | Document): void;
    removeGlobalListener(name: string, callback: Function): void;
    t(...args: Array<string>): string;
}
//# sourceMappingURL=YpCodeBaseclass.d.ts.map