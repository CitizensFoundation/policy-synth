import { PolicySynthWebApp } from '@policysynth/webapp';
import { html, css, nothing, TemplateResult } from 'lit';
import { property, customElement, query } from 'lit/decorators.js';
import { Router } from '@lit-labs/router';

@customElement('simple-policy-synth-example-app')
export class SimplePolicySynthExampleApp extends PolicySynthWebApp {
  router: Router = new Router(this, [
    {
      path: '/',
      render: () => {
        return html`<cps-home .memory="${this.currentMemory}"></cps-home>`;
      },
    },
  ]);
}
