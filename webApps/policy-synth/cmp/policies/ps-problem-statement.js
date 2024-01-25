var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@yrpri/webapp/common/yp-image.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/button/outlined-button.js';
import '@material/web/progress/circular-progress.js';
import { PsStageBase } from '../base/ps-stage-base.js';
let PsProblemStatement = class PsProblemStatement extends PsStageBase {
    async connectedCallback() {
        super.connectedCallback();
        window.psAppGlobals.activity(`Problem Statment - open`);
    }
    updated(changedProperties) {
        super.updated(changedProperties);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.psAppGlobals.activity(`Problem Statment - close`);
    }
    static get styles() {
        return [
            super.styles,
            css `
      `,
        ];
    }
    render() {
        return html `
      <div class="topContainer layout vertical center-center">
        ${this.renderProblemStatement()}

        ${this.renderSearchQueries(this.t('Search queries for problem statement'), this.memory.problemStatement.searchQueries)}
        ${this.renderSearchResults(this.t('Webpages scanned for solutions to problem statement'), this.memory.problemStatement.searchResults)}
      </div>
    `;
    }
};
PsProblemStatement = __decorate([
    customElement('ps-problem-statement')
], PsProblemStatement);
export { PsProblemStatement };
//# sourceMappingURL=ps-problem-statement.js.map