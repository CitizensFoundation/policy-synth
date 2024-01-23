import { PolicySynthWebApp } from '@policysynth/webapp';
import { html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PsRouter } from '@policysynth/webapp/cmp/base/router/router.js';

import './live-research-chat-bot.js';

@customElement('live-research-app')
export class LiveResearchApp extends PolicySynthWebApp {
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
          <div class="layout horizontal center-center">
            ${this.renderThemeToggle()}
          </div>
          <live-research-chat-bot></live-research-chat-bot>
        </div>`;
      },
    },
  ]);
}
