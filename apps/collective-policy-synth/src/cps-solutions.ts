import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import './@yrpri/common/yp-image.js';
import { CpsStageBase } from './cps-stage-base.js';

import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/iconbutton/standard-icon-button.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/chips/input-chip.js';
import '@material/web/textfield/outlined-text-field.js'; // import at the beginning of your file
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js'; // get reference to the class

import { MdOutlinedSelect } from '@material/web/select/outlined-select.js';

@customElement('cps-solutions')
export class CpsSolutions extends CpsStageBase {
  @property({ type: Boolean }) isDropdownVisible = false;
  @property({ type: String }) searchText = '';
  @property({ type: Number }) activeFilteredSolutionIndex: number = null;
  @property({ type: Boolean }) isSearchVisible = false; // add a new property to control the visibility of the search field


  reset() {
    this.searchText = "";
    this.isSearchVisible = false;
    this.isDropdownVisible = false;
    this.activeSolutionIndex = null;
    this.activeSubProblemIndex = null;
  }

  async connectedCallback() {
    super.connectedCallback();
    window.appGlobals.activity(`Solutions - open`);
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('searchText')) {
      this.activeFilteredSolutionIndex = this.filteredSolutions.findIndex(
        solution =>
          solution ===
          this.memory.subProblems[this.activeSubProblemIndex].solutions
            .populations[this.activePopulationIndex][this.activeSolutionIndex]
      );
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.appGlobals.activity(`Solutions - close`);
  }

  static get styles() {
    return [
      super.styles,
      css`
        md-outlined-text-field {
          width: 180px;
          margin-top: -12px;
          margin-left: 8px;
        }

        md-outlined-text-field[middle-open] {
          margin-top: 8px;
        }

        md-outlined-icon-button {
          margin-left: 8px;
          margin-right: 8px;
          margin-top: -4px;
        }

        md-outlined-select {
          margin-top: -12px;
          margin-left: 8px;
          margin-right: 8px;
        }

        .generations {
          margin-top: 24px;
          margin-bottom: 16px;
          max-width: 1100px;
        }

        md-filter-chip {
          margin-bottom: 8px;
        }

        md-filter-chip[more-than-seven-items] {
          margin-bottom: 8px;
          width: 134px;
        }

        .title {
          margin-top: 4px;
        }

        .solutionImage {
          padding: 8px;
          margin-right: 8px;
        }

        .solutionTopImage {
          margin-bottom: 16px;
          margin-top: 16px;
        }

        .solutionItem {
          text-align: left;
          background-color: var(--md-sys-color-on-secondary);
          color: var(--md-sys-color-secondary);
          border-radius: 16px;
          padding: 20px;
          margin: 8px 0;
          max-width: 960px;
          width: 100%;
          font-size: 22px;
          height: 55px;
          display: flex;
          flex-direction: column;
          justify-content: left;
          align-items: left;
          cursor: pointer;
          line-height: 1.4;
          vertical-align: middle;
        }

        .solutionItem[has-image] {
          height: 85px;
        }

        .generationContainer {
          width: 100%;
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

        .solutionItemTitle[has-image] {
          margin-top: 6px;
        }

        .solutionIndex {
          margin-right: 8px;
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
          letter-spacing: 0.1em;
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

        [hidden] {
          display: none !important;
        }
      `,
    ];
  }

  get filteredSolutions() {
    let subProblem = this.memory.subProblems[this.activeSubProblemIndex];
    if (subProblem && subProblem.solutions) {
      let solutions =
        subProblem.solutions.populations[this.activePopulationIndex];

      if (this.searchText) {
        const searchTerms = this.searchText.toLowerCase().split(' ');
        solutions = solutions.filter(solution =>
          searchTerms.some(term =>
            solution.title.toLowerCase().includes(term) ||
            solution.description.toLowerCase().includes(term)
          )
        );
      }

      return solutions;
    } else {
      return [];
    }
  }


  render() {
    const subProblems = this.memory.subProblems || [];
    if (this.activeSolutionIndex !== null) {
      return this.renderSolutionScreen(
        this.activeFilteredSolutionIndex !== null
          ? this.activeFilteredSolutionIndex
          : this.activeSolutionIndex
      );
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
      <div class="topContainer layout vertical self-start">
        <div class="layout horizontal center-center">
          ${this.renderSubProblem(subProblem, false, 0, true, true)}
        </div>
        <div class="layout horizontal center-center">
          <div class="title">${this.t('Evolving Solutions')}</div>
        </div>
        <div class="generationContainer layout vertical center-center">
          ${this.renderChipSet(subProblem)}
          ${this.filteredSolutions.map(
            (solution, index) =>
              html`<div
                class="solutionItem layout horizontal self-start"
                ?has-image="${solution.imageUrl}"
                @click="${(): void => {
                  this.activeSolutionIndex = index;
                  this.activeFilteredSolutionIndex = index;
                  window.scrollTo(0, 0);
                }}"
              >
                ${solution.imageUrl
                  ? html`
                      <div>
                        <img
                          class="solutionImage"
                          height="72"
                          width="72"
                          src="${this.fixImageUrlIfNeeded(solution.imageUrl)}"
                          alt="${solution.title}"
                        />
                      </div>
                    `
                  : html`<div class="solutionIndex">${index + 1}.</div>`}
                <div
                  class="solutionItemTitle"
                  ?has-image="${solution.imageUrl}"
                >
                  ${solution.title}
                </div>
              </div>`
          )}
        </div>
      </div>
    `;
  }

  renderChipSet(subProblem: IEngineSubProblem) {
    if (!subProblem.solutions) {
      return nothing;
    }

    if (subProblem.solutions.populations) {
      let firstItems = subProblem.solutions.populations.slice(0, 3);
      let lastItems = subProblem.solutions.populations.slice(-3);
      let middleItems = subProblem.solutions.populations.slice(3, -3);

      if (subProblem.solutions.populations.length === 7) {
        middleItems = subProblem.solutions.populations.slice(3, 4);
      }

      return html`
        <md-chip-set
          class="generations layout horizontal wrap"
          type="filter"
          single-select
        >
          ${this.renderFilterChips(firstItems, 0)}
          ${this.renderDropdown(middleItems, firstItems.length)}
          ${this.renderFilterChips(
            lastItems,
            subProblem.solutions.populations.length - 3
          )}
          <md-outlined-icon-button
            ?hidden="${this.isSearchVisible}"
            @click="${this.toggleSearchVisibility}"
          >
            <md-icon>search</md-icon>
          </md-outlined-icon-button>
          ${this.isSearchVisible ? this.renderSearchField() : nothing}
        </md-chip-set>
      `;
    } else {
      return nothing;
    }
  }

  toggleSearchVisibility(): void {
    this.isSearchVisible = !this.isSearchVisible;
  }

  renderSearchField() {
    return html`
      <md-outlined-text-field
        ?middle-open="${this.isDropdownVisible}"
        .label="${this.t('Filter')}"
        .value="${this.searchText}"
        @keyup="${(e: Event) =>
          (this.searchText = (e.target as HTMLInputElement).value)}"
        @blur="${this.handleSearchBlur}"
      ></md-outlined-text-field>
    `;
  }

  handleSearchBlur(): void {
    if (this.searchText.trim() === '') {
      this.isSearchVisible = false;
    }
  }

  renderFilterChips(items: IEngineSolution[][], startIndex: number) {
    return items.map(
      (population, index) =>
        html`<md-filter-chip
          class="layout horizontal center-center"
          ?more-than-seven-items="${items.length > 7}"
          label="Generation ${startIndex + index + 1}"
          .selected="${this.activePopulationIndex === startIndex + index}"
          @click="${() => {
            this.activePopulationIndex = startIndex + index;
            this.resetDropdown();
          }}"
        ></md-filter-chip> `
    );
  }

  handleDropdownChange(e: Event) {
    const selectElement = e.target as HTMLSelectElement;
    const newIndex = Number(selectElement.value) - 1;
    if (
      !isNaN(newIndex) &&
      newIndex >= 0 &&
      newIndex < this.memory.subProblems.length
    ) {
      this.activePopulationIndex = newIndex;
    }
  }

  toggleDropdownVisibility(): void {
    this.isDropdownVisible = !this.isDropdownVisible;
    if (this.isDropdownVisible) {
      // add check to ensure activePopulationIndex is valid
      if (this.memory.subProblems.length > 3) {
        this.activePopulationIndex = 3;
      } else if (this.memory.subProblems.length > 0) {
        this.activePopulationIndex = this.memory.subProblems.length - 1;
      } else {
        this.activePopulationIndex = 0;
      }
    }
  }

  resetDropdown() {
    const dropdown = this.shadowRoot.querySelector(
      'md-outlined-select'
    ) as MdOutlinedSelect;
    if (dropdown) {
      this.isDropdownVisible = false;
    }
  }

  renderDropdown(middleItems: IEngineSolution[][], startIndex: number) {
    if (middleItems.length > 0 && !this.isDropdownVisible) {
      return html`
        <md-outlined-icon-button @click="${this.toggleDropdownVisibility}">
          <md-icon>expand_more</md-icon>
        </md-outlined-icon-button>
      `;
    } else if (middleItems.length > 0 && this.isDropdownVisible) {
      return html`
        <md-outlined-select
          label="Generation ..."
          .quick=${true}
          .required=${false}
          .disabled=${false}
          @change=${(e: Event) => this.handleDropdownChange(e)}
        >
          ${middleItems.map(
            (population, index) =>
              html`<md-select-option
                .value="${(startIndex + index + 1).toString()}"
                .headline="Generation ${startIndex + index + 1}"
              ></md-select-option>`
          )}
        </md-outlined-select>
      `;
    } else {
      return nothing;
    }
  }

  renderSolutionNavigationButtons(
    solutionIndex: number,
    solutions: IEngineSolution[]
  ) {
    return html`
      <div class="layout horizontal center-center">
        <md-standard-icon-button
          aria-label="Previous"
          .disabled="${solutionIndex === 0}"
          @click="${(): void => {
            if (solutionIndex > 0) {
              this.activeFilteredSolutionIndex = solutionIndex - 1; // change this line
            }
          }}"
        >
          <md-icon>navigate_before</md-icon>
        </md-standard-icon-button>
        <md-standard-icon-button
          aria-label="Next"
          .disabled="${solutionIndex === solutions.length - 1}"
          @click="${(): void => {
            if (solutionIndex < solutions.length - 1) {
              this.activeFilteredSolutionIndex = solutionIndex + 1; // change this line
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
    `;
  }

  renderSolutionScreen(solutionIndex: number) {
    const solutions = this.filteredSolutions;
    const solution = solutions[solutionIndex];
    return html`
      <div class="topContainer layout vertical center-center">
        ${this.renderSolutionNavigationButtons(solutionIndex, solutions)}
        <div class="solution">
          ${solution.imageUrl
            ? html`<div class="layout horizontal center-center">
                <img
                  class="solutionTopImage"
                  height="250"
                  width="250"
                  src="${this.fixImageUrlIfNeeded(solution.imageUrl)}"
                  alt="${solution.title}"
                />
              </div> `
            : nothing}
          <div class="solutionTitle">
            ${solutionIndex + 1}. ${solution.title}
          </div>
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
              ${(solution.pros as IEngineProCon[])?.map(
                pro => html`<div class="proCon">${pro.description}</div>`
              )}
            </div>
            <div class="cons flexFactor layout vertical center-center">
              <div class="prosConsHeader">${this.t('Cons')}</div>
              ${(solution.cons as IEngineProCon[])?.map(
                con => html`<div class="proCon">${con.description}</div>`
              )}
            </div>
          </div>
        </div>
        ${this.renderSolutionNavigationButtons(solutionIndex, solutions)}
      </div>
    `;
  }
}
