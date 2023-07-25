import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import './@yrpri/common/yp-image.js';

import '@material/web/checkbox/checkbox.js';
import { Checkbox } from '@material/web/checkbox/lib/checkbox.js';
import '@material/web/button/outlined-button.js';
import '@material/web/circularprogress/circular-progress.js';
import { CpsStageBase } from './cps-stage-base.js';

@customElement('cps-problem-statement')
export class CpsProblemStatement extends CpsStageBase {
  async connectedCallback() {
    super.connectedCallback();
    window.appGlobals.activity(`Problem Statment - open`);
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.appGlobals.activity(`Problem Statment - close`);
  }

  static get styles() {
    return [
      super.styles,
      css`
      `,
    ];
  }

  render() {
    return html`
      <div class="topContainer layout vertical center-center">
        ${this.renderProblemStatement()}

        ${this.renderSearchQueries(
          this.t('Search queries for problem statement'),
          this.memory.problemStatement.searchQueries
        )}
        ${this.renderSearchResults(
          this.t('Webpages scanned for solutions to problem statement'),
          this.memory.problemStatement.searchResults
        )}
      </div>
    `;
  }
}
