import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@yrpri/webapp/common/yp-image.js';

import '@material/web/checkbox/checkbox.js';
import '@material/web/button/outlined-button.js';
import '@material/web/progress/circular-progress.js';
import { PsStageBase } from '../base/ps-stage-base.js';

@customElement('ps-problem-statement')
export class PsProblemStatement extends PsStageBase {
  async connectedCallback() {
    super.connectedCallback();
    window.psAppGlobals.activity(`Problem Statment - open`);
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.psAppGlobals.activity(`Problem Statment - close`);
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
