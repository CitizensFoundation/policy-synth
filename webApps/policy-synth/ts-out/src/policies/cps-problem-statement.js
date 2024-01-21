import { __decorate } from "tslib";
import { css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../@yrpri/common/yp-image.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/button/outlined-button.js';
import '@material/web/progress/circular-progress.js';
import { CpsStageBase } from '../base/cps-stage-base.js';
let CpsProblemStatement = class CpsProblemStatement extends CpsStageBase {
    async connectedCallback() {
        super.connectedCallback();
        window.appGlobals.activity(`Problem Statment - open`);
    }
    updated(changedProperties) {
        super.updated(changedProperties);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.appGlobals.activity(`Problem Statment - close`);
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
CpsProblemStatement = __decorate([
    customElement('cps-problem-statement')
], CpsProblemStatement);
export { CpsProblemStatement };
//# sourceMappingURL=cps-problem-statement.js.map