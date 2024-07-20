var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@yrpri/webapp/common/yp-image.js';
import { PsStageBase } from '../base/ps-stage-base.js';
let PsSubProblems = class PsSubProblems extends PsStageBase {
    async connectedCallback() {
        super.connectedCallback();
        window.psAppGlobals.activity(`Sub Problems - open`);
    }
    updated(changedProperties) {
        super.updated(changedProperties);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.psAppGlobals.activity(`Sub Problems - close`);
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
PsSubProblems = __decorate([
    customElement('ps-sub-problems')
], PsSubProblems);
export { PsSubProblems };
//# sourceMappingURL=ps-sub-problems.js.map