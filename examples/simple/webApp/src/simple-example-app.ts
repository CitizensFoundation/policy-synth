import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PsRouter } from '@policysynth/webapp/base/router/router.js';

import './simple-chat-bot.js';
import { PolicySynthWebApp } from '@policysynth/webapp/ps-app.js';

@customElement('simple-example-app')
export class SimpleExampleApp extends PolicySynthWebApp {
  static override get styles() {
    return [
      ...super.styles,
      css`
        simple-chat-bot {
          width: 100vw;
          height: 100%;
        }
      `,
    ];
  }

  override router: PsRouter = new PsRouter(this, [
    {
      path: '/*',
      render: () => {
        return html`<div class="layout vertical center-center">
          <simple-chat-bot></simple-chat-bot>
          <div class="layout horizontal center-center">
            ${this.renderThemeToggle()}
          </div>
        </div>`;
      },
    },
  ]);
}
