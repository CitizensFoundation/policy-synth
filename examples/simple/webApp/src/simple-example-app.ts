import { PolicySynthWebApp } from '@policysynth/webapp';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PsRouter } from '@policysynth/webapp/cmp/base/router/router.js';

import './simple-chat-bot.js';

@customElement('simple-example-app')
export class SimpleExampleApp extends PolicySynthWebApp {
  override router: PsRouter = new PsRouter(this, [
    {
      path: '/*',
      render: () => {
        return html`<simple-chat-bot></simple-chat-bot>`;
      },
    },
  ]);
}
