import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import './@yrpri/common/yp-image.js';
import { CpsStageBase } from './cps-stage-base.js';

import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/iconbutton/standard-icon-button.js';

@customElement('cps-solutions')
export class CpsSolutions extends CpsStageBase {
  async connectedCallback() {
    super.connectedCallback();
    window.appGlobals.activity(`Solutions - open`);
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.appGlobals.activity(`Solutions - close`);
  }

  static get styles() {
    return [
      super.styles,
      css`
        .generations {
          margin-top: 16px;
          margin-bottom: 16px;
        }

        .title {
          margin-top: 4px;
        }

        .solutionItem {
          text-align: left;
          background-color: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          border-radius: 16px;
          padding: 20px;
          margin: 8px 0;
          max-width: 960px;
          width: 100%;
          font-size: 22px;
          height: 52px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: left;
          cursor: pointer;
          line-height: 1.4;
          vertical-align: middle;
        }

        .solution {
          text-align: left;
          background-color: var(--md-sys-color-on-primary);
          color: var(--md-sys-color-primary);
          border-radius: 16px;
          padding: 16px;
          margin: 8px 0;
          max-width: 960px;
          width: 100%;
        }

        .proCon {
          margin: 8px;
          padding: 24px;
          max-width: 410px;
          width: 100%;
          background-color: var(--md-sys-color-on-tertiary);
          color: var(--md-sys-color-tertiary);
          border-radius: 16px;
          font-size: 20px;
          align-items: self-start;
          line-height: 1.4;
        }

        .prosConsHeader {
          font-size: 24px;
          color: var(--md-sys-color-tertiary);
          font-weight: 500;
          margin-bottom: 8px;
        }

        .solutionTitle {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.10em;
          line-height: 1.4;
          margin: 8px;
        }

        .solutionDescription {
          padding: 8px;
          font-size: 22px;
          line-height: 1.4;
        }

        .solutionAttributes {
          display: flex;
          justify-content: space-between;
          align-items: self-start;
        }

        .pros,
        .cons {
          width: 45%;
          padding: 10px;
          margin: 10px 0;
        }

        @media (max-width: 600px) {
          .solutionAttributes {
            flex-direction: column;
          }
        }
      `,
    ];
  }

  render() {
    const subProblems = this.memory.subProblems || [];
    if (this.activeSolutionIndex !== null) {
      return this.renderSolutionScreen(this.activeSolutionIndex);
    } else if (this.activeSubProblemIndex !== null) {
      return this.renderSubProblemScreen(
        subProblems[this.activeSubProblemIndex]
      );
    } else {
      return this.renderSubProblemList(
        subProblems,
        this.t('Sub problems and Solutions')
      );
    }
  }

  renderSubProblemScreen(subProblem: IEngineSubProblem) {
    return html`
      <div class="topContainer layout vertical center-center">
        ${this.renderSubProblem(subProblem, false, 0, true, true)}
        <div class="title">${this.t('Solutions')}</div>
        <md-chip-set class="generations" type="filter" single-select>
          ${subProblem.solutions.populations.map(
            (population, index) =>
              html`
                <md-filter-chip
                  label="Generation ${index + 1}"
                  .selected="${this.activePopulationIndex === index}"
                  @click="${() => (this.activePopulationIndex = index)}"
                ></md-filter-chip>
              `
          )}
        </md-chip-set>
        ${subProblem.solutions.populations[this.activePopulationIndex].map(
          (solution, index) =>
            html`<div
              class="solutionItem"
              @click="${(): void => {
                this.activeSolutionIndex = index;
                window.scrollTo(0, 0);
              }}"
            >
              ${index+1}. ${solution.title}
            </div>`
        )}
      </div>
    `;
  }

  renderSolutionScreen(solutionIndex: number) {
    const solutions =
      this.memory.subProblems[this.activeSubProblemIndex].solutions.populations[
        this.activePopulationIndex
      ];
    const solution = solutions[solutionIndex];
    return html`
      <div class="topContainer layout vertical center-center">
        <div class="layout horizontal center-center">
          <md-standard-icon-button
            aria-label="Previous"
            @click="${(): void => {
              if (solutionIndex > 0) {
                this.activeSolutionIndex = solutionIndex - 1;
              }
            }}"
          >
            <md-icon>navigate_before</md-icon>
          </md-standard-icon-button>
          <md-standard-icon-button
            aria-label="Next"
            @click="${(): void => {
              if (solutionIndex < solutions.length - 1) {
                this.activeSolutionIndex = solutionIndex + 1;
              }
            }}"
          >
            <md-icon>navigate_next</md-icon>
          </md-standard-icon-button>
          <md-standard-icon-button
            aria-label="Close"
            @click="${(): void => (this.activeSolutionIndex = null)}"
          >
            <md-icon>close</md-icon>
          </md-standard-icon-button>
        </div>
        <div class="solution">
          <div class="solutionTitle">${solutionIndex+1}. ${solution.title}</div>
          <div class="solutionDescription">${solution.description}</div>
          <div class="solutionDescription">
            ${solution.mainBenefitOfSolution}
          </div>
          <div class="solutionDescription">
            ${solution.mainObstacleToSolutionAdoption}
          </div>
        </div>
        <div class="prosCons">
          <div class="solutionAttributes layout horizontal wrap">
            <div class="pros flexFactor layout vertical center-center">
              <div class="prosConsHeader">${this.t('Pros')}</div>
              ${(solution.pros as IEngineProCon[]).map(
                pro => html`<div class="proCon">${pro.description}</div>`
              )}
            </div>
            <div class="cons flexFactor layout vertical center-center">
              <div class="prosConsHeader">${this.t('Cons')}</div>
              ${(solution.cons as IEngineProCon[]).map(
                con => html`<div class="proCon">${con.description}</div>`
              )}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
