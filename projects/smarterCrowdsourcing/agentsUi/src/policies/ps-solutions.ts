import { css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import '@yrpri/webapp/common/yp-image.js';
import { PsStageBase } from '../base/ps-stage-base.js';

import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/chips/input-chip.js';
import '@material/web/textfield/outlined-text-field.js'; // import at the beginning of your file
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js'; // get reference to the class

import { MdOutlinedSelect } from '@material/web/select/outlined-select.js';
import { PsConstants } from '../constants.js';

import './ps-family-tree.js';
import { YpFormattingHelpers } from '@yrpri/webapp/common/YpFormattingHelpers.js';

@customElement('ps-solutions')
export class PsSolutions extends PsStageBase {
  @property({ type: Boolean })
  isDropdownVisible = false;

  @property({ type: String })
  searchText = '';

  @property({ type: Number })
  activeFilteredSolutionIndex: number = null;

  @property({ type: Boolean })
  isSearchVisible = false;

  @property({ type: Boolean })
  hideExtraSolutionInformation = true;

  @property({ type: Boolean })
  isLoadingMiddle: boolean = false;

  @property({ type: Number }) groupListScrollPositionY: number = null;

  lastKeys: any[] = []
  findBarProbablyOpen = false;

  async handleGroupButtonClick(groupIndex: number): Promise<void> {
    if (this.activeGroupIndex === groupIndex) {
      // Deactivating group filter
      this.activeGroupIndex = null;
      await this.updateComplete;
      window.scrollTo(0, this.groupListScrollPositionY);
      this.groupListScrollPositionY = null;
      window.psAppGlobals.activity('Solutions - deactive group filter');
    } else {
      // Activating group filter
      this.groupListScrollPositionY = window.scrollY;
      this.activeGroupIndex = groupIndex;
      await this.updateComplete;
      const solutionListElement =
        this.shadowRoot.getElementById('solutionList');
      const rect = solutionListElement.getBoundingClientRect();
      const docTop = window.pageYOffset;
      window.scrollTo(0, rect.top + docTop);
      window.psAppGlobals.activity('Solutions - activate group filter');
    }
  }

  reset() {
    this.searchText = '';
    this.isSearchVisible = false;
    this.isDropdownVisible = false;
    this.activeSolutionIndex = null;
    this.activeSubProblemIndex = null;
    this.fire('yp-theme-color', this.subProblemColors[7]);
  }

  private touchStartX = 0;
  private minSwipeDistance = 100;
  solutionListScrollPositionX: number = 0;
  solutionListScrollPositionY: number = 0;

  async connectedCallback() {
    super.connectedCallback();
    window.psAppGlobals.activity(`Solutions - open`);

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.psAppGlobals.activity(`Solutions - close`);
    document.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.removeEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  updateSwipeIndex(direction: string) {
    /*console.error(
      `updateSwipeIndex ${this.activeFilteredSolutionIndex} ${this.activeSolutionIndex}`
    );*/
    if (direction === 'right') {
      if (
        this.activeSolutionIndex !== null &&
        this.activeFilteredSolutionIndex < this.filteredSolutions.length - 1
      ) {
        this.activeFilteredSolutionIndex += 1;
        window.psAppGlobals.activity('Solutions - swipe right');
      } else if (
        this.activeSolutionIndex == null &&
        this.activeSubProblemIndex !== null &&
        this.activeSubProblemIndex < PsConstants.maxSubProblems - 1
      ) {
        this.activeSubProblemIndex += 1;
        window.psAppGlobals.activity('Sub problem - swipe right');
      }
    } else if (direction === 'left') {
      if (
        this.activeSolutionIndex !== null &&
        this.activeFilteredSolutionIndex > 0
      ) {
        this.activeFilteredSolutionIndex -= 1;
        window.psAppGlobals.activity('Solutions - swipe left');
      } else if (
        this.activeSolutionIndex == null &&
        this.activeSubProblemIndex !== null &&
        this.activeSubProblemIndex > 0
      ) {
        this.activeSubProblemIndex -= 1;
        window.psAppGlobals.activity('Sub problem - swipe left');
      }
    }
    this.setSubProblemColor(this.activeSubProblemIndex);
  }

  async loadMiddleData() {
    console.log(`loadMiddleData`)
    try {
      for (let i = 0; i < PsConstants.maxSubProblems; i++) {
        const middleData = await window.psServerApi.getMiddleSolutions(this.memory.groupId, i);

        if (middleData && Array.isArray(middleData)) {
          // Check if your populations are already initialized and have more than 6 elements
          if (this.memory.subProblems[i].solutions.populations.length > 6) {
            const firstThree = this.memory.subProblems[i].solutions.populations.slice(0, 3);
            const lastThree = this.memory.subProblems[i].solutions.populations.slice(-3);

            // If middleData is not of the same length as the middle portion to be replaced, you may need to adjust it
            const middle = middleData;  // Or manipulate as needed

            this.memory.subProblems[i].solutions.populations = [...firstThree, ...middle, ...lastThree];
          } else {
            // If populations are not initialized or have less than 6 elements, you might want to just set the middle directly
            this.memory.subProblems[i].solutions.populations = middleData;
          }
        }
      }
    } catch (error) {
      console.error("Failed to load middle data:", error);
      this.isLoadingMiddle = false;
    }
  }


  handleKeyDown(e: KeyboardEvent) {
    this.lastKeys.push(e.key);

    if (this.lastKeys.length > 12) {
      this.lastKeys.shift();
    }

    this.findBarProbablyOpen = this.lastKeys.includes('Control') && this.lastKeys.includes('f');

    if (e.key === 'Escape' && this.findBarProbablyOpen) {
      this.lastKeys = [];
      this.findBarProbablyOpen = false;
      console.log("Doing my escape action.");
      return;
    }

    if (e.key === 'ArrowRight') {
      this.updateSwipeIndex('right');
      e.stopPropagation();
      e.preventDefault();
  } else if (e.key === 'ArrowLeft') {
      this.updateSwipeIndex('left');
      e.stopPropagation();
      e.preventDefault();
  } else if (e.key === 'Escape' && !this.findBarProbablyOpen) {
      if (this.activeSolutionIndex !== null) {
        this.activeSolutionIndex = null;
        this.exitSolutionScreen();
        e.stopPropagation();
        e.preventDefault();
      } else if (this.activeSubProblemIndex !== null) {
        this.activeSubProblemIndex = null;
        this.fire('yp-theme-color', this.subProblemColors[7]);
        this.exitSubProblemScreen();
      }
    }
  }

  exitSolutionScreen() {
    setTimeout(() => {
      window.scrollTo(
        this.solutionListScrollPositionX,
        this.solutionListScrollPositionY
      );
    }, 10);
  }

  handleTouchStart(e: TouchEvent) {
    this.touchStartX = e.touches[0].clientX;
  }

  handleTouchEnd(e: TouchEvent) {
    const diffX = this.touchStartX - e.changedTouches[0].clientX;

    if (Math.abs(diffX) < this.minSwipeDistance) {
      return;
    }

    let actualTarget: EventTarget = e.composedPath()[0];

    let targetElement = actualTarget as Element;
    while (targetElement) {
      console.error(targetElement.tagName);
      if (
        targetElement.getAttribute('data-scrollable') === 'true'
      ) {
        return;
      }
      targetElement = targetElement.parentElement;
    }

    if (diffX > 0) {
      this.updateSwipeIndex('right');
    } else if (diffX < 0) {
      this.updateSwipeIndex('left');
    }

    e.stopPropagation(); // Prevent event bubbling after handling
  }


  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (
      changedProperties.has('searchText') ||
      changedProperties.has('activeSolutionIndex')
    ) {
      this.activeFilteredSolutionIndex = this.filteredSolutions.findIndex(
        solution =>
          solution ===
          this.memory.subProblems[this.activeSubProblemIndex].solutions
            .populations[this.activePopulationIndex][this.activeSolutionIndex]
      );
    }

    if (
      changedProperties.has('activeSolutionIndex') ||
      changedProperties.has('activeSubProblemIndex') ||
      changedProperties.has('activePopulationIndex')
    ) {
      this.updateRoutes();
    }

    if (
      changedProperties.has('activeFilteredSolutionIndex') &&
      this.activeFilteredSolutionIndex !== null &&
      this.activePopulationIndex !== null &&
      this.activeFilteredSolutionIndex !== undefined &&
      this.memory.subProblems[this.activeSubProblemIndex] &&
      this.memory.subProblems[this.activeSubProblemIndex].solutions
    ) {
      const subProblem = this.memory.subProblems[this.activeSubProblemIndex];
      const solutions =
        subProblem.solutions.populations[this.activePopulationIndex];
      const filteredSolution =
        this.filteredSolutions[this.activeFilteredSolutionIndex];

      const solutionIndex = solutions.findIndex(
        solution => solution === filteredSolution
      );

      if (solutionIndex !== undefined && solutionIndex !== -1) {
        this.activeSolutionIndex = solutionIndex;
      }

      /*console.error(
        `activeFilteredSolutionIndex`,
        this.activeFilteredSolutionIndex
      );
      console.error(`activeSolutionIndex`, this.activeSolutionIndex);
      */
    }
  }

  static get styles() {
    return [
      super.styles,
      css`
        .topContainer {
          max-width: 100%;
        }

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

        .solutionImage {
          padding: 8px;
        }

        .solutionTopImage {
          vertical-align: top;
          margin-top: 20px;
        }

        .solutionItem {
          text-align: left;
          background-color: var(--md-sys-color-secondary-container);
          color: var(--md-sys-color-on-secondary-container);
          border-radius: 16px;
          padding: 20px;
          margin: 8px 0;
          max-width: 600px;
          width: 600px;
          font-size: 22px;
          min-height: 100px;
          display: flex;
          flex-direction: column;
          justify-content: left;
          align-items: left;
          cursor: pointer;
          line-height: 1.4;
          vertical-align: middle;
          position: relative;
        }

        .groupInfo {
          position: absolute;
          top: 18px;
          right: 4px;
        }

        .groupInfoText {
          font-size: 18px;
          margin-top: 6px;
          font-family: 'Roboto Condensed', sans-serif;
          opacity: 0.55;
        }

        .solutionItem[has-image] {
          margin-bottom: 16px;
        }

        .solutionItem[group-solo] {
          background-color: var(--md-sys-color-tertiary-container);
          color: var(--md-sys-color-on-tertiary-container);
        }

        .generationContainer {
          width: 100%;
        }

        .solution {
          text-align: left;
          background-color: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
          border-radius: 16px;
          padding: 16px;
          margin: 8px 0;
          max-width: 1360px;
        }

        .solutionImageContainer {
          display: inline-block;
          margin-left: 8px;
        }

        .solutionItemTitle {
          padding: 8px;
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

        .solutionItemEloRating {
          font-size: 18px;
          margin-top: 8px;
          opacity: 0.5;
        }

        .ratingsHeader {
          font-size: 22px;
          margin-bottom: 4px;
          margin-top: 16px;
          color: var(--md-sys-color-secondary);
        }

        .ratings {
          background-color: var(--md-sys-color-on-secondary);
          color: var(--md-sys-color-secondary);
          padding: 32px;
          max-width: 380px;
          width: 380px;
          border-radius: 16px;
          margin: 32px;
          padding-top: 8px;
          padding-bottom: 32px;
        }

        .rating {
          padding: 8px;
          padding-bottom: 0;
        }

        .eloRatings {
          font-size: 24px;
          color: var(--md-sys-color-primary);
          margin-bottom: 24px;
        }

        .prosConsHeader {
          font-size: 24px;
          color: var(--md-sys-color-tertiary);
          font-weight: 500;
          margin-bottom: 8px;
        }

        .solutionTitle {
          font-size: 26px;
          line-height: 1.4;
          margin: 8px;
          margin-left: 8px;
          margin-right: 8px;
          margin-top: 16px;
          font-family: 'Roboto Condensed', sans-serif;
        }

        .solutionTitleDesc {
          max-width: 600px;
          margin-right: 8px;
        }

        .solutionDescription {
          padding: 8px;
          font-size: 20px;
          line-height: 1.4;
          margin-left: 0px;
          margin-right: 8px;
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

        @media (max-width: 960px) {
          .solutionItemTitle {
            margin-top: 0;
            padding-top: 0;
            padding-bottom: 16px;
          }

          .solutionTopImage {
            margin-top: 10px;
          }

          .solution {
            max-width: 100%;
            margin-top: 6px;
          }
          .pros,
          .cons {
            width: 100%;
            padding: 16px;
            margin: 8px;
            font-size: 18px;
            max-width: 100%;
          }

          .proCon {
            font-size: 16px;
            padding: 16px;
            margin: 8px;
          }

          .ratings {
            max-width: 320px;
            width: 100%;
            margin: 16px;
            font-size: 16px;
            margin-right: 0;
            margin-left: 0;
          }

          .solutionItem {
            border-radius: 24px;
            padding: 32px;
            max-width: 300px;
            width: 100%;
            font-size: 18px;
          }

          .solutionItem[has-image] {
            height: unset;
            margin-top: 0;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }

          .solutionDescription {
            font-size: 16px;
            margin-left: 0px;
            margin-right: 0px;
          }

          .solutionTitle {
            font-size: 20px;
            margin-left: 0px;
            margin-right: 0px;
          }

          .solutionAttributes {
            flex-direction: column;
          }

          .groupInfo {
            position: unset;
            top: unset;
            margin-bottom: 4px;
            margin-right: 4px;
          }

          .groupInfoText {
            font-size: 18px;
            margin-top: 6px;
            font-family: 'Roboto Condensed', sans-serif;
            opacity: 0.55;
          }

          .topContainer {
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

      let firstInGroup: Record<number, PsSolution> = {};

      if (solutions) {
        solutions.forEach(solution => {
          if (solution.similarityGroup !== undefined) {
            let groupIndex = solution.similarityGroup.index;
            if (!firstInGroup[groupIndex]) {
              firstInGroup[groupIndex] = solution;
              solution.similarityGroup.isFirst = true;
            } else {
              solution.similarityGroup.isFirst = undefined;
            }
          }
        });

        // Check if the active solution is part of a similarity group and the group is not already active
        if (this.activeSolutionIndex !== null) {
          const activeSolution = solutions[this.activeSolutionIndex];
          if (
            activeSolution?.similarityGroup &&
            this.activeGroupIndex !== activeSolution.similarityGroup.index &&
            !activeSolution.similarityGroup.isFirst
          ) {
            this.activeGroupIndex = activeSolution.similarityGroup.index;
          }
        }

        if (this.activeGroupIndex !== null) {
          // If a group is active, only return solutions from this group
          solutions = solutions.filter(
            solution =>
              solution.similarityGroup?.index === this.activeGroupIndex
          );
        } else {
          // Otherwise, return only the first solution of each group
          solutions = solutions.filter(
            solution =>
              solution.similarityGroup?.isFirst ||
              solution.similarityGroup === undefined
          );
        }

        if (this.searchText) {
          const searchTerms = this.searchText.toLowerCase().split(' ');
          solutions = solutions.filter(solution =>
            searchTerms.every(
              term =>
                solution.title.toLowerCase().includes(term) ||
                solution.description.toLowerCase().includes(term)
            )
          );
        }
      } else {
        return [];
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
        this.t('Sub Problems and Solutions')
      );
    }
  }

  renderSolutionItem(solution: PsSolution, index: number) {
    return html`
      <div
        class="solutionItem layout vertical center-center"
        ?has-image="${solution.imageUrl}"
        ?group-solo="${this.activeGroupIndex !== null}"
        @click="${(): void => {
          //this.activeSolutionIndex = index;
          this.activeFilteredSolutionIndex = index;
          this.solutionListScrollPositionX = window.scrollX;
          this.solutionListScrollPositionY = window.scrollY;
          window.scrollTo(0, 0);
          //console.error(`click`, this.activeFilteredSolutionIndex);
          //console.error(`click`, this.activeSolutionIndex);
          window.psAppGlobals.activity('Solutions - open detail');
        }}"
      >
        ${solution.imageUrl
          ? html`
              <div>
                <img
                  alt="${solution.imagePrompt}"
                  loading="lazy"
                  class="solutionImage"
                  height="${this.wide ? `250` : `200`}"
                  src="${this.fixImageUrlIfNeeded(solution.imageUrl)}"
                />
              </div>
            `
          : html``}
        <div class="solutionItemTitle" ?has-image="${solution.imageUrl}">
          ${solution.title}
        </div>
        <div
          class="solutionItemEloRating"
          ?hidden="${this.activeGroupIndex === null}"
        >
          ${YpFormattingHelpers.number(solution.eloRating)}
        </div>
        ${solution.similarityGroup?.isFirst !== undefined &&
        solution.similarityGroup.isFirst
          ? html`
              <div
                class="groupInfo layout ${this.wide
                  ? 'vertical center-center'
                  : 'horizontal'}"
              >
                <md-outlined-icon-button
                  toggle
                  ?selected="${this.activeGroupIndex ===
                  solution.similarityGroup.index}"
                  class="groupButton"
                  @click="${(e: CustomEvent): void => {
                    e.stopPropagation();
                    this.handleGroupButtonClick(solution.similarityGroup.index);
                  }}"
                >
                  <md-icon>unfold_more_double</md-icon>
                  <md-icon slot="selectedIcon">close</md-icon>
                </md-outlined-icon-button>
                <div class="groupInfoText">
                  ${this.activeGroupIndex === null
                    ? html`+${solution.similarityGroup.totalCount}`
                    : nothing}
                </div>
              </div>
            `
          : html``}
      </div>
    `;
  }

  renderSubProblemScreen(subProblem: PsSubProblem) {
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
          <div id="solutionList">
            ${this.filteredSolutions.map((solution, index) =>
              this.renderSolutionItem(solution, index)
            )}
          </div>
        </div>
      </div>
    `;
  }

  renderChipSet(subProblem: PsSubProblem) {
    if (!subProblem.solutions) {
      return nothing;
    }

    if (subProblem.solutions.populations) {
      let firstItems,
        lastItems: PsSolution[][],
        middleItems: PsSolution[][];

      if (!this.wide) {
        firstItems = subProblem.solutions.populations.slice(0, 1);
        lastItems = subProblem.solutions.populations.slice(-1);
        middleItems = subProblem.solutions.populations.slice(1, -1);
      } else {
        firstItems = subProblem.solutions.populations.slice(0, 3);
        if (subProblem.solutions.populations.length > 3) {
          lastItems = subProblem.solutions.populations.slice(3, 6);
          if (subProblem.solutions.populations.length > 6) {
            lastItems = subProblem.solutions.populations.slice(-3);
            middleItems = subProblem.solutions.populations.slice(3, -3);
          } else {
            middleItems = [];
          }
        } else {
          lastItems = [];
          middleItems = [];
        }

        if (subProblem.solutions.populations.length === 7) {
          middleItems = subProblem.solutions.populations.slice(3, 4);
        }
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
            subProblem.solutions.populations.length - lastItems.length
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
    window.psAppGlobals.activity('Solutions - toggle search');
  }

  renderSearchField() {
    return html`
      <md-outlined-text-field
        ?middle-open="${this.isDropdownVisible}"
        .label="${this.t('Filter')}"
        .value="${this.searchText}"
        @keyup="${(e: Event) => {
          this.searchText = (e.target as HTMLInputElement).value;
        }}"
        @keydown="${(e: KeyboardEvent) => {
          if (e.key == 'Escape') {
            e.stopPropagation();
            e.preventDefault();
          }
        }}"
        @blur="${this.handleSearchBlur}"
      ></md-outlined-text-field>
    `;
  }

  handleSearchBlur(): void {
    if (this.searchText.trim() === '') {
      this.isSearchVisible = false;
    }
  }

  renderFilterChips(items: PsSolution[][], startIndex: number) {
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
            window.psAppGlobals.activity('Solutions - chose generation');
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

  async toggleDropdownVisibility() {
    window.psAppGlobals.activity('Solutions - toggle dropdown');
    this.isLoadingMiddle = true;
    await this.loadMiddleData();
    this.isLoadingMiddle = false;
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

  renderDropdown(middleItems: PsSolution[][], startIndex: number) {
    if (this.isLoadingMiddle) {
      return html`<md-circular-progress indeterminate></md-circular-progress>`;
    } else if (middleItems.length > 0 && !this.isDropdownVisible) {
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

  camelCaseToRegular(text: string) {
    let result = text.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  renderRatings(solution: PsSolution) {
    return html`
      <div class="ratings">
        <div class="ratingsHeader eloRatings layout horizontal center-center">
          <div>
            ${this.t('Elo Rating')}:
            ${YpFormattingHelpers.number(solution.eloRating)}
          </div>
        </div>

        ${solution.ratings
          ? html`
              ${Object.entries(solution.ratings).map(
                ([category, ratings]) => html`
                  <div class="ratingsHeader">
                    ${this.camelCaseToRegular(category)}
                  </div>
                  ${Object.entries(ratings).map(
                    ([key, value]) => html`
                      <div class="rating">
                        ${this.camelCaseToRegular(key)}: ${value}
                      </div>
                    `
                  )}
                `
              )}
            `
          : nothing}
      </div>
    `;
  }

  renderSolutionNavigationButtons(
    solutionIndex: number,
    solutions: PsSolution[]
  ) {
    return html`
      <div class="layout horizontal center-center">
        <md-icon-button
          aria-label="Previous"
          .disabled="${solutionIndex === 0}"
          @click="${(): void => {
            if (solutionIndex > 0) {
              this.activeFilteredSolutionIndex = solutionIndex - 1;
              window.psAppGlobals.activity('Solutions - click previous solution');
            }
          }}"
        >
          <md-icon>navigate_before</md-icon>
        </md-icon-button>
        <md-icon-button
          aria-label="Next"
          .disabled="${solutionIndex === solutions.length - 1}"
          @click="${(): void => {
            if (solutionIndex < solutions.length - 1) {
              this.activeFilteredSolutionIndex = solutionIndex + 1;
              window.psAppGlobals.activity('Solutions - click next solution');
            }
          }}"
        >
          <md-icon>navigate_next</md-icon>
        </md-icon-button>
        <md-icon-button
          aria-label="Close"
          @click="${(): void => {
            this.activeSolutionIndex = null;
            this.activeFilteredSolutionIndex = null;

            this.exitSolutionScreen();
            window.psAppGlobals.activity('Solutions - exit solution detail');
          }}"
        >
          <md-icon>close</md-icon>
        </md-icon-button>
      </div>
    `;
  }

  getSolutionImgHeight() {
    if (this.wide) {
      return 314;
    } else {
      return 150;
    }
  }

  getSolutionImgWidth() {
    if (this.wide) {
      return 550;
    } else {
      return 263;
    }
  }

  renderSolutionImage(solution: PsSolution) {
    return html`
      <div class="solutionImageContainer">
        <img
          loading="lazy"
          alt="${solution.imagePrompt}"
          title="${solution.imagePrompt}"
          class="solutionTopImage"
          height="${this.getSolutionImgHeight()}"
          width="${this.getSolutionImgWidth()}"
          src="${this.fixImageUrlIfNeeded(solution.imageUrl)}"
          .key="${solution.imageUrl}"
        />
      </div>
    `;
  }

  renderSolutionScreen(solutionIndex: number) {
    const solutions = this.filteredSolutions;
    const solution = solutions[solutionIndex];
    if (solution) {
      return html`
        ${!solution.reaped
          ? html`
              <div class="topContainer layout vertical center-center">
                ${this.renderSolutionNavigationButtons(
                  solutionIndex,
                  solutions
                )}
                <div
                  class="solution layout ${this.wide
                    ? 'horizontal'
                    : 'vertical'} center-cener"
                >
                  ${solution.imageUrl && !this.wide
                    ? this.renderSolutionImage(solution)
                    : nothing}

                  <div class="solutionTitleDesc">
                    <div class="solutionTitle">${solution.title}</div>
                    <div class="solutionDescription">
                      ${solution.description}
                    </div>
                  </div>
                  ${solution.imageUrl && this.wide
                    ? this.renderSolutionImage(solution)
                    : nothing}
                  <div
                    class="solutionDescription"
                    ?hidden="${this.hideExtraSolutionInformation}"
                  >
                    ${solution.mainBenefitOfSolution}
                  </div>
                  <div
                    class="solutionDescription"
                    ?hidden="${this.hideExtraSolutionInformation}"
                  >
                    ${solution.mainObstacleToSolutionAdoption}
                  </div>
                </div>
                <div class="prosCons">
                  <div class="solutionAttributes layout horizontal wrap">
                    <div class="pros flexFactor layout vertical center-center">
                      <div class="prosConsHeader">${this.t('Pros')}</div>
                      ${(solution.pros as PsProCon[])?.map(
                        pro =>
                          html`<div class="proCon">${pro.description}</div>`
                      )}
                    </div>
                    <div class="cons flexFactor layout vertical center-center">
                      <div class="prosConsHeader">${this.t('Cons')}</div>
                      ${(solution.cons as PsProCon[])?.map(
                        con =>
                          html`<div class="proCon">${con.description}</div>`
                      )}
                    </div>
                  </div>
                </div>
                ${this.renderRatings(solution)}
                ${this.renderSolutionNavigationButtons(
                  solutionIndex,
                  solutions
                )}
                <ps-family-tree
                  .memory="${this.memory}"
                  .subProblemIndex="${this.activeSubProblemIndex}"
                  .solution="${solution}"
                ></ps-family-tree>
              </div>
            `
          : html`<div class="reapedInfo layout horizontal center-center">
              <div>REAPED</div>
            </div>`}
      `;
    } else {
      return nothing;
    }
  }
}
