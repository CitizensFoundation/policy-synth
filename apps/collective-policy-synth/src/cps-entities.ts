import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import './@yrpri/common/yp-image.js';

import { CpsStageBase } from './cps-stage-base.js';

//TDOO: Share from db config
const maxNumberOfSubProblems = 7;
const maxNumberOfTopEntities = 3;

@customElement('cps-entities')
export class CpsEntities extends CpsStageBase {
  @property({ type: Number })
  activeEntityIndex: number | null = null;

  async connectedCallback() {
    super.connectedCallback();
    window.appGlobals.activity(`Sub Problems - open`);
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.appGlobals.activity(`Sub Problems - close`);
  }

  static get styles() {
    return [
      super.styles,
      css`
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
      return this.renderEntityScreen(
        subProblems[this.activeSubProblemIndex]!.entities[this.activeEntityIndex]!
      );
    } else if (this.activeSubProblemIndex !== null) {
      return this.renderSubProblemScreen(
        subProblems[this.activeSubProblemIndex]
      );
    } else {
      return this.renderSubProblemList(subProblems, this.t('Sub Problems and Entities'));
    }
  }

  renderSubProblemScreen(subProblem: IEngineSubProblem) {
    return html`
      <div class="topContainer layout vertical center-center">
        ${this.renderSubProblem(subProblem, false, 0, true, true)}
        ${subProblem.entities.map((entity, entityIndex) => {
          const isEntityLessProminent = entityIndex >= maxNumberOfTopEntities;
          return html`
            <div class="entity ${isEntityLessProminent ? 'lessProminent' : ''}">
              <div class="entityName">${entity.name}</div>
              ${entity.negativeEffects?.length > 0
                ? html`
                    <div>
                      Negative Effects:
                      <ul>
                        ${entity.negativeEffects?.map(
                          (effect) => html` <li>${effect}</li> `
                        )}
                      </ul>
                    </div>
                  `
                : nothing}
              ${entity.positiveEffects?.length > 0
                ? html`
                    <div>
                      Positive Effects:
                      <ul>
                        ${entity.positiveEffects?.map(
                          (effect) => html` <li>${effect}</li> `
                        )}
                      </ul>
                    </div>
                  `
                : nothing}
              ${!isEntityLessProminent
                ? html`
                    ${this.renderSearchQueries(
                      this.t('Search queries for entity'),
                      entity.searchQueries
                    )}
                    ${this.renderSearchResults(
                      this.t('Webpages scanned for solutions to entites problems'),
                      entity.searchResults
                    )}
                  `
                : nothing}
            </div>
          `;
        })}
      </div>
    `;
  }

  renderEntityScreen(entity: IEngineAffectedEntity) {
    return html`
      <div class="topContainer layout vertical">
        <div class="title">${this.t('Problem Statement')}</div>
        <div class="problemStatement">
          ${this.memory.problemStatement.description}
        </div>

        <div class="title">${this.t('Sub Problems')}</div>

      </div>
    `;
  }
}
