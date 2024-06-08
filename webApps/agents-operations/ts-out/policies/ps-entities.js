var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import '@yrpri/webapp/common/yp-image.js';
import { PsStageBase } from '../base/ps-stage-base.js';
//TDOO: Share from db config
const maxNumberOfSubProblems = 7;
let PsEntities = class PsEntities extends PsStageBase {
    constructor() {
        super(...arguments);
        this.activeEntityIndex = null;
        this.maxNumberOfTopEntities = 4;
    }
    async connectedCallback() {
        super.connectedCallback();
        if (this.memory.groupId == 2) {
            this.maxNumberOfTopEntities = 4;
        }
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
        return [
            super.styles,
            css `
        .entity {
          opacity: 1;
          background-color: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
          border-radius: 16px;
          padding: 16px;
          margin: 16px 0;
          max-width: 960px;
          width: 100%;
        }

        .entity.lessProminent {
          opacity: 0.6;
        }

        .entityName {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 16px;
          color: var(--md-sys-color-primary);
        }
      `,
        ];
    }
    render() {
        const subProblems = this.memory.subProblems || [];
        if (this.activeEntityIndex !== null) {
            return this.renderEntityScreen(subProblems[this.activeSubProblemIndex].entities[this.activeEntityIndex]);
        }
        else if (this.activeSubProblemIndex !== null) {
            return this.renderSubProblemScreen(subProblems[this.activeSubProblemIndex]);
        }
        else {
            return this.renderSubProblemList(subProblems, this.t('Sub Problems and Entities'));
        }
    }
    renderSubProblemScreen(subProblem) {
        return html `
      <div class="topContainer layout vertical center-center">
        ${this.renderSubProblem(subProblem, false, 0, true, true)}
        ${subProblem.entities.map((entity, entityIndex) => {
            const isEntityLessProminent = entityIndex >= this.maxNumberOfTopEntities;
            return html `
            <div class="entity ${isEntityLessProminent ? 'lessProminent' : ''}">
              <div class="entityName">${entity.name}</div>
              ${entity.negativeEffects?.length > 0
                ? html `
                    <div>
                      Negative Effects:
                      <ul>
                        ${entity.negativeEffects?.map((effect) => html ` <li>${effect}</li> `)}
                      </ul>
                    </div>
                  `
                : nothing}
              ${entity.positiveEffects?.length > 0
                ? html `
                    <div>
                      Positive Effects:
                      <ul>
                        ${entity.positiveEffects?.map((effect) => html ` <li>${effect}</li> `)}
                      </ul>
                    </div>
                  `
                : nothing}
              ${!isEntityLessProminent
                ? html `
                    ${this.renderSearchQueries(this.t('Search queries for entity'), entity.searchQueries)}
                    ${this.renderSearchResults(this.t('Webpages scanned for solutions to entites problems'), entity.searchResults)}
                  `
                : nothing}
            </div>
          `;
        })}
      </div>
    `;
    }
    renderEntityScreen(entity) {
        return html `
      <div class="topContainer layout vertical">
        <div class="title">${this.t('Problem Statement')}</div>
        <div class="problemStatement">
          ${this.memory.problemStatement.description}
        </div>

        <div class="title">${this.t('Sub Problems')}</div>

      </div>
    `;
    }
};
__decorate([
    property({ type: Number })
], PsEntities.prototype, "activeEntityIndex", void 0);
PsEntities = __decorate([
    customElement('ps-entities')
], PsEntities);
export { PsEntities };
//# sourceMappingURL=ps-entities.js.map