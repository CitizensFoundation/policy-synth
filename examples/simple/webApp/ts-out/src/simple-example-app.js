import { __decorate } from "tslib";
import { PolicySynthWebApp } from '@policysynth/webapp';
import { html, css } from 'lit';
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
                    return html ` <div class="layout vertical center-center">
          <simple-chat-bot></simple-chat-bot>
          <div class="layout horizontal center-center">
            ${this.renderThemeToggle()}
          </div>
        </div>`;
                },
            },
        ]);
    }
    static get styles() {
        return [
            ...super.styles,
            css `
        simple-chat-bot {
          width: 100vw;
          height: 100%;
        }
      `,
        ];
    }
};
SimpleExampleApp = __decorate([
    customElement('simple-example-app')
], SimpleExampleApp);
export { SimpleExampleApp };
//# sourceMappingURL=simple-example-app.js.map