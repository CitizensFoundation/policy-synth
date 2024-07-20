import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import '@yrpri/webapp/common/yp-image.js';

import { PsStageBase } from '../base/ps-stage-base.js';
import { Layouts } from '../flexbox-literals/classes.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';

@customElement('ps-family-tree')
export class PsFamilyTree extends YpBaseElement {
  @property({ type: Object })
  memory!: PsSmarterCrowdsourcingMemoryData;

  @property({ type: Number })
  subProblemIndex!: number;

  @property({ type: Object })
  solution!: PsSolution;

  async connectedCallback() {
    super.connectedCallback();
    window.psAppGlobals.activity(`Family tree - open`);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.psAppGlobals.activity(`Family tree - close`);
  }

  static get styles() {
    return [
      super.styles,
      Layouts,
      css`
        :host {
        }
        .tree-structure {
          color: var(--md-sys-color-primary);
        }

        .treeContainer {
          box-sizing: border-box;
          overflow-x: auto;
          max-width: 100%;
          width: 100%;
          margin: 0 auto;
        }

        @media (max-width: 600px) {
          .treeContainer {
            width: 100%;
            max-width: 100%;
          }
        }

        .family-level {
          display: flex;
          flex-direction: row;
          margin: 8px;
          margin-top: 6px;
          align-items: start;
          min-width: 220px;
          max-width: 100%;
        }

        .family-box {
          border: 1px solid var(--md-sys-color-secondary);
          padding: 10px;
          margin: 5px;
          border-radius: 8px;
          max-width: 320px;
        }
        .solution-box {
          padding: 10px;
          margin: 5px;
        }
        .url-link {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 60ch;
          color: var(--md-sys-color-on-primary-container);
        }
        a {
          color: var(--md-sys-color-on-primary-container);
        }

        .familyTreeTitle {
          padding: 16px;
          font-size: 26px;
          color: var(--md-sys-color-primary);
          background-color: var(--md-sys-color-on-primary);
          border-radius: 16px;
          margin: 16px;
          margin-bottom: 24px;
          width: 100%;
          max-width: 320px;
          text-align: center;
          text-transform: uppercase;
          font-family: 'Cabin', sans-serif;
        }

        .solution-title {
          font-size: 1.2em;
          padding: 5px;
          border-radius: 5px;
          margin-bottom: 10px;
        }

        .generation {
          font-size: 0.43em;
          margin-left: 1px;
          opacity: 0.75;
        }

        .parent-container {
          align-items: start !important;
        }

        .no-parent {
          background-color: var(--md-sys-color-surface-variant);
          color: var(--md-sys-color-on-surface-variant);
        }

        .is-mutated-from {
          background-color: var(--md-sys-color-secondary-container);
          color: var(--md-sys-color-on-secondary-container);
        }
        .seed-url-parent {
          background-color: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
        }

        .first {
          background-color: var(--md-sys-color-tertiary-container);
          color: var(--md-sys-color-on-tertiary-container);
        }

        .mutationRate {
          text-transform: capitalize;
        }

        .familyIcon {
          margin-top: 40px;
          margin-bottom: 8px;
          font-size: 48px;
          color: var(--md-sys-color-primary);
        }

        @media (max-width: 600px) {
          .url-link {
            max-width: 25ch;
          }

          .family-box {
          }

          .family-level {
            max-width: 360px;
          }

          .treeContainer {
            max-width: 360px;
          }

          .familyTreeTitle {
          }

          .treeContainer {
          }
        }
      `,
    ];
  }

  getParentSolution(parent: string): PsSolution {
    const splitParentIndex = parent.split(':');
    const populationIndex = parseInt(splitParentIndex[0]);
    const solutionIndex = parseInt(splitParentIndex[1]);

    return this.memory.subProblems[this.subProblemIndex].solutions.populations[
      populationIndex
    ][solutionIndex];
  }

  renderFamilyTree(
    currentSolution: PsSolution,
    first = false,
    isMutatedFrom = false
  ): any {
    const hasParentB = currentSolution.family?.parentB ? true : false;
    return html`
      <div class="tree-structure layout vertical center-center">
        <div
          class="family-level layout vertical center-center"
          data-scrollable="true"
        >
          <div
            class="family-box ${first ? 'first' : ''} ${!currentSolution.family
              ? 'no-parent'
              : ''} ${isMutatedFrom
              ? 'is-mutated-from'
              : ''} ${!currentSolution.family
              ? 'no-parent'
              : ''} ${currentSolution.family?.seedUrls &&
            !currentSolution.family.parentA &&
            !currentSolution.family.parentB
              ? 'seed-url-parent'
              : ''}"
          >
            <div class="solution-title" ?first="${first}">
              ${currentSolution.title}
              ${currentSolution.family?.gen !== undefined
                ? html`<span class="generation"
                    >(${currentSolution.family.gen + 1})</span
                  >`
                : ''}
            </div>

            ${!currentSolution.family
              ? html`<div class="layout horizontal center-center">
                  ... parent data not collected
                </div>`
              : html`
                  ${currentSolution.family.mutationRate
                    ? html`<div>
                        Mutation rate:
                        <span class="mutationRate"
                          >${currentSolution.family.mutationRate}</span
                        >
                      </div>`
                    : ''}
                  ${currentSolution.family.seedUrls &&
                  currentSolution.family.seedUrls.length > 0
                    ? html`
                        <div class="solution-box">
                          Seed URLs:
                          ${currentSolution.family.seedUrls.map(
                            url =>
                              html`<a
                                href="${url}"
                                target="_blank"
                                class="url-link"
                                >${url}</a
                              >`
                          )}
                        </div>
                      `
                    : ''}
                `}
          </div>
        </div>

        <div
          class="layout ${hasParentB
            ? 'horizontal'
            : 'vertical'} center-center parent-container"
        >
          <div
            class="family-level ${hasParentB ? 'two-parents' : ''}"
            data-scrollable="true"
          >
            ${currentSolution.family?.parentA
              ? html`
                  ${this.renderFamilyTree(
                    this.getParentSolution(currentSolution.family.parentA),
                    false,
                    !hasParentB
                  )}
                `
              : ''}
            ${currentSolution.family?.parentB
              ? html`
                  ${this.renderFamilyTree(
                    this.getParentSolution(currentSolution.family.parentB)
                  )}
                `
              : ''}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <div class="layout vertical center-center">
        <md-icon class="familyIcon">family_history</md-icon>
        <div class="familyTreeTitle">${this.t('Evolutionary Tree')}</div>
        <div class="treeContainer" data-scrollable="true">
          ${this.renderFamilyTree(this.solution, true)}
        </div>
      </div>
    `;
  }
}
