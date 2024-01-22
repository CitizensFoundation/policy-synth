import { PolicySynthWebApp } from '@policysynth/webapp';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@lit-labs/router';

import './simple-chat-bot.js';

@customElement('simple-example-app')
export class SimpleExampleApp extends PolicySynthWebApp {
  override router: Router = new Router(this, [
    {
      path: '/',
      render: () => {
        return html`<simple-chat-bot></simple-chat-bot>`;
      },
    },
  ]);
}
