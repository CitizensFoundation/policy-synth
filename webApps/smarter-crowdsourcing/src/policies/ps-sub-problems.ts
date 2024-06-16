import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@yrpri/webapp/common/yp-image.js';

import { PsStageBase } from '../base/ps-stage-base.js';

@customElement('ps-sub-problems')
export class PsSubProblems extends PsStageBase {
  async connectedCallback() {
    super.connectedCallback();
    window.psAppGlobals.activity(`Sub Problems - open`);
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.psAppGlobals.activity(`Sub Problems - close`);
  }

  static get styles() {
    return [super.styles, css``];
  }

  render() {
    const subProblems = this.memory.subProblems || [];
    if (this.activeSubProblemIndex !== null) {
      return this.renderSubProblemScreen(
        subProblems[this.activeSubProblemIndex]
      );
    } else {
      return this.renderSubProblemList(subProblems, this.t('Sub problems'));
    }
  }

  renderSubProblemScreen(subProblem: PsSubProblem) {
    return html`
      <div class="topContainer layout vertical center-center">
        ${this.renderSubProblem(subProblem, false, 0, true, true)}
        ${this.renderSearchQueries(
          this.t('Search queries for sub problem'),
          subProblem.searchQueries
        )}
        ${this.renderSearchResults(
          this.t('Webpages scanned for solutions to sub problem'),
          subProblem.searchResults
        )}
      </div>
    `;
  }
}
