import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import './@yrpri/common/yp-image.js';

import { CpsStageBase } from './cps-stage-base.js';
import { IEngineConstants } from './constants.js';

@customElement('cps-web-research')
export class CpsWebResearch extends CpsStageBase {
  maxNumberOfTopEntities = 4;

  async connectedCallback() {
    super.connectedCallback();
    window.appGlobals.activity(`Web research - open`);
    if (this.memory.groupId === 1) {
      this.maxNumberOfTopEntities = 3;
    }
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.appGlobals.activity(`Web research - close`);
  }

  static get styles() {
    return [
      super.styles,
      css`
        .subProblemContainer {
          margin-top: 64px;
        }

        .entity {
          width: 940px;
          max-width: 100%;
          color: var(--md-sys-color-on-surface);
          background-color: var(--md-sys-color-surface);
        }

        .entity[not-scanned] {
          opacity: 0.50;
        }


        .entityName {
          margin-top: 24px;
          margin-bottom: 8px;
          width: 100%;
          font-size: 20px;
          font-weight: bold;
        }

        .entityName[not-scanned] {
          font-weight: 300;
        }

        .negPos {
          width: 100%;
          margin-top: 16px;
        }

        @media (max-width: 960px) {
          .entity {
            width: 100%;
          }

          .entityName {
            font-size: 18px;
          }
      `,
    ];
  }

  render() {
    return html`
      <div class="topContainer layout vertical center-center">
        ${this.renderProblemStatement(this.t('Automated Web Research'))}
        ${this.renderSearchQueries(
          this.t('Search queries for problem statement'),
          this.memory.problemStatement.searchQueries
        )}
        ${this.renderSearchResults(
          this.t('Webpages scanned for solutions to problem statement'),
          this.memory.problemStatement.searchResults
        )}
        ${this.renderSubProblemsWithAll()}
      </div>
    `;
  }

  renderEntities(subProblem: IEngineSubProblem) {
    return html`
      ${subProblem.entities.map((entity, entityIndex) => {
        const isEntityLessProminent =
          entityIndex >= this.maxNumberOfTopEntities;
        return html`
          <div class="layout vertical center-center">
            <div
              class="entity ${isEntityLessProminent ? 'lessProminent' : ''}"
              ?not-scanned="${isEntityLessProminent}"
            >
              <div class="entityName" ?not-scanned="${isEntityLessProminent}">
                ${entity.name}
              </div>
              <div class="negPos">
                ${entity.negativeEffects?.length > 0
                  ? html`
                      <div>
                        Negative Effects:
                        <ul>
                          ${entity.negativeEffects?.map(
                            effect => html` <li>${effect}</li> `
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
                            effect => html` <li>${effect}</li> `
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
                        this.t(
                          'Webpages scanned for solutions to entites problems'
                        ),
                        entity.searchResults
                      )}
                    `
                  : nothing}
              </div>
            </div>
          </div>
        `;
      })}
    `;
  }

  renderSubProblemsWithAll() {
    const topSubProblems = this.memory.subProblems.slice(
      0,
      IEngineConstants.maxSubProblems
    );

    return html`
      ${topSubProblems.map(
        subProblem =>
          html`
            <div class="subProblemContainer layout vertical center-center">
              ${this.renderSubProblem(subProblem, false, 0, true, true, true)}
              ${this.renderSearchQueries(
                this.t('Search queries for sub problem'),
                subProblem.searchQueries
              )}
              ${this.renderSearchResults(
                this.t('Webpages scanned for solutions to sub problem'),
                subProblem.searchResults
              )}
              ${this.renderEntities(subProblem)}
            </div>
          `
      )}
    `;
  }
}
