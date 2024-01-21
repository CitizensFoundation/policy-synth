import { __decorate } from "tslib";
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './@yrpri/common/yp-image.js';
import { CpsStageBase } from './cps-stage-base.js';
let CpsSubProblems = class CpsSubProblems extends CpsStageBase {
    async connectedCallback() {
        super.connectedCallback();
        window.appGlobals.activity(`Sub Problems - open`);
    }
    updated(changedProperties) {
        super.updated(changedProperties);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.appGlobals.activity(`Sub Problems - close`);
    }
    static get styles() {
        return [super.styles, css ``];
    }
    render() {
        const subProblems = this.memory.subProblems || [];
        if (this.activeSubProblemIndex !== null) {
            return this.renderSubProblemScreen(subProblems[this.activeSubProblemIndex]);
        }
        else {
            return this.renderSubProblemList(subProblems, this.t('Sub problems'));
        }
    }
    renderSubProblemScreen(subProblem) {
        return html `
      <div class="topContainer layout vertical center-center">
        ${this.renderSubProblem(subProblem, false, 0, true, true)}
        ${this.renderSearchQueries(this.t('Search queries for sub problem'), subProblem.searchQueries)}
        ${this.renderSearchResults(this.t('Webpages scanned for solutions to sub problem'), subProblem.searchResults)}
      </div>
    `;
    }
};
CpsSubProblems = __decorate([
    customElement('cps-sub-problems')
], CpsSubProblems);
export { CpsSubProblems };
//# sourceMappingURL=cps-sub-problems.js.map