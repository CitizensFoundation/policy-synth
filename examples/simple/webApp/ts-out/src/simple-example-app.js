import { __decorate } from "tslib";
import { PolicySynthWebApp } from '@policysynth/webapp';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PsRouter } from '@policysynth/webapp/cmp/base/router/router.js';
import './simple-chat-bot.js';
let SimpleExampleApp = class SimpleExampleApp extends PolicySynthWebApp {
    constructor() {
        super(...arguments);
        this.router = new PsRouter(this, [
            {
                path: '/*',
                render: () => {
                    return html `<simple-chat-bot></simple-chat-bot>`;
                },
            },
        ]);
    }
};
SimpleExampleApp = __decorate([
    customElement('simple-example-app')
], SimpleExampleApp);
export { SimpleExampleApp };
//# sourceMappingURL=simple-example-app.js.map