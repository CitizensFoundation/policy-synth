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
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/chips/input-chip.js';
import '@material/web/textfield/outlined-text-field.js'; // import at the beginning of your file
import { PsConstants } from '../constants.js';
import './ps-family-tree.js';
import './ps-raw-evidence.js';
import { cache } from 'lit/directives/cache.js';
import { YpFormattingHelpers } from '@yrpri/webapp/common/YpFormattingHelpers.js';
let PsPolicies = class PsPolicies extends PsStageBase {
    constructor() {
        super(...arguments);
        this.isDropdownVisible = false;
        this.searchText = '';
        this.activeFilteredPolicyIndex = null;
        this.isSearchVisible = false;
        this.hideExtraPolicyInformation = false;
        this.groupListScrollPositionY = null;
        this.lastKeys = [];
        this.findBarProbablyOpen = false;
        this.touchStartX = 0;
        this.minSwipeDistance = 100;
        this.policyListScrollPositionX = 0;
        this.policyListScrollPositionY = 0;
    }
    updateRoutes() {
        this.fire('update-route', {
            activePolicyIndex: this.activePolicyIndex,
            activeSubProblemIndex: this.activeSubProblemIndex,
            activePopulationIndex: this.activePopulationIndex,
        });
    }
    setSubProblem(index) {
        this.activeSubProblemIndex = index;
        this.subProblemListScrollPositionX = window.scrollX;
        this.subProblemListScrollPositionY = window.scrollY;
        window.scrollTo(0, 0);
        if (this.firstTimeSubProblemClick || this.activePopulationIndex === null) {
            this.firstTimeSubProblemClick = false;
            if (this.memory.subProblems.length > 0 &&
                this.memory.subProblems[this.activeSubProblemIndex].policies) {
                this.activePopulationIndex =
                    this.memory.subProblems[this.activeSubProblemIndex].policies
                        .populations.length - 1;
            }
        }
        this.updateRoutes();
        window.psAppGlobals.activity('Sub Problem - click');
    }
    async handleGroupButtonClick(groupIndex) {
        if (this.activeGroupIndex === groupIndex) {
            // Deactivating group filter
            this.activeGroupIndex = null;
            await this.updateComplete;
            window.scrollTo(0, this.groupListScrollPositionY);
            this.groupListScrollPositionY = null;
            window.psAppGlobals.activity('Policies - deactive group filter');
        }
        else {
            // Activating group filter
            this.groupListScrollPositionY = window.scrollY;
            this.activeGroupIndex = groupIndex;
            await this.updateComplete;
            const policyListElement = this.shadowRoot.getElementById('policyList');
            const rect = policyListElement.getBoundingClientRect();
            const docTop = window.pageYOffset;
            window.scrollTo(0, rect.top + docTop);
            window.psAppGlobals.activity('Policies - activate group filter');
        }
    }
    reset() {
        this.searchText = '';
        this.isSearchVisible = false;
        this.isDropdownVisible = false;
        this.activePolicyIndex = null;
        this.activeSubProblemIndex = null;
        this.fire('yp-theme-color', this.subProblemColors[7]);
    }
    async connectedCallback() {
        super.connectedCallback();
        this.childType = 'policy';
        window.psAppGlobals.activity(`Policies - open`);
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.psAppGlobals.activity(`Policies - close`);
        document.removeEventListener('keydown', this.handleKeyDown);
        this.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        this.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    updateSwipeIndex(direction) {
        /*console.error(
          `updateSwipeIndex ${this.activeFilteredPolicyIndex} ${this.activePolicyIndex}`
        );*/
        if (direction === 'right') {
            if (this.activePolicyIndex !== null &&
                this.activeFilteredPolicyIndex < this.filteredPolicies.length - 1) {
                this.activeFilteredPolicyIndex += 1;
                window.psAppGlobals.activity('Policies - swipe right');
            }
            else if (this.activePolicyIndex == null &&
                this.activeSubProblemIndex !== null &&
                this.activeSubProblemIndex < PsConstants.maxSubProblems - 1) {
                this.activeSubProblemIndex += 1;
                window.psAppGlobals.activity('Sub problem - swipe right');
            }
        }
        else if (direction === 'left') {
            if (this.activePolicyIndex !== null &&
                this.activeFilteredPolicyIndex > 0) {
                this.activeFilteredPolicyIndex -= 1;
                window.psAppGlobals.activity('Policies - swipe left');
            }
            else if (this.activePolicyIndex == null &&
                this.activeSubProblemIndex !== null &&
                this.activeSubProblemIndex > 0) {
                this.activeSubProblemIndex -= 1;
                window.psAppGlobals.activity('Sub problem - swipe left');
            }
        }
        this.setSubProblemColor(this.activeSubProblemIndex);
    }
    handleKeyDown(e) {
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
        }
        else if (e.key === 'ArrowLeft') {
            this.updateSwipeIndex('left');
            e.stopPropagation();
            e.preventDefault();
        }
        else if (e.key === 'Escape' && !this.findBarProbablyOpen) {
            if (this.activePolicyIndex !== null) {
                this.activePolicyIndex = null;
                this.exitPolicyScreen();
                e.stopPropagation();
                e.preventDefault();
            }
            else if (this.activeSubProblemIndex !== null) {
                this.activeSubProblemIndex = null;
                this.fire('yp-theme-color', this.subProblemColors[7]);
                this.exitSubProblemScreen();
            }
        }
    }
    exitPolicyScreen() {
        setTimeout(() => {
            window.scrollTo(this.policyListScrollPositionX, this.policyListScrollPositionY);
        }, 10);
    }
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
    }
    handleTouchEnd(e) {
        const diffX = this.touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diffX) < this.minSwipeDistance) {
            return;
        }
        let actualTarget = e.composedPath()[0];
        let targetElement = actualTarget;
        while (targetElement) {
            console.error(targetElement.tagName);
            if (targetElement.getAttribute('data-scrollable') === 'true') {
                return;
            }
            targetElement = targetElement.parentElement;
        }
        if (diffX > 0) {
            this.updateSwipeIndex('right');
        }
        else if (diffX < 0) {
            this.updateSwipeIndex('left');
        }
        e.stopPropagation(); // Prevent event bubbling after handling
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has('searchText') ||
            changedProperties.has('activePolicyIndex')) {
            this.activeFilteredPolicyIndex = this.filteredPolicies.findIndex(policy => policy ===
                this.memory.subProblems[this.activeSubProblemIndex].policies
                    .populations[this.activePopulationIndex][this.activePolicyIndex]);
        }
        if (changedProperties.has('activePolicyIndex') ||
            changedProperties.has('activeSubProblemIndex') ||
            changedProperties.has('activePopulationIndex')) {
            this.updateRoutes();
        }
        if (changedProperties.has('activeFilteredPolicyIndex') &&
            this.activeFilteredPolicyIndex !== null &&
            this.activePopulationIndex !== null &&
            this.activeFilteredPolicyIndex !== undefined &&
            this.memory.subProblems[this.activeSubProblemIndex] &&
            this.memory.subProblems[this.activeSubProblemIndex].policies) {
            const subProblem = this.memory.subProblems[this.activeSubProblemIndex];
            const policies = subProblem.policies.populations[this.activePopulationIndex];
            const filteredPolicy = this.filteredPolicies[this.activeFilteredPolicyIndex];
            const policyIndex = policies.findIndex(policy => policy === filteredPolicy);
            if (policyIndex !== undefined && policyIndex !== -1) {
                this.activePolicyIndex = policyIndex;
            }
            /*console.error(
              `activeFilteredPolicyIndex`,
              this.activeFilteredPolicyIndex
            );
            console.error(`activePolicyIndex`, this.activePolicyIndex);
            */
        }
    }
    static get styles() {
        return [
            super.styles,
            css `
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

        .policyImage {
          padding: 0;
          margin-top: -20px;
        }

        .policyTopImage {
          vertical-align: top;
          margin-top: 20px;
        }

        .policyItem {
          text-align: left;
          background-color: var(--md-sys-color-secondary-container);
          color: var(--md-sys-color-on-secondary-container);
          border-radius: 16px;
          padding: 20px;
          margin: 16px;
          max-width: 600px;
          width: 600px;
          font-size: 22px;
          min-height: 110px;
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

        .policyAttributeHeader {
          font-size: 22px;
          margin-top: 6px;
          margin-bottom: 6px;
          font-family: 'Cabin', sans-serif;
        }

        .groupInfoText {
          font-size: 18px;
          margin-top: 6px;
          font-family: 'Roboto Condensed', sans-serif;
          opacity: 0.55;
        }

        .policyItem[has-image] {
          margin-bottom: 24px;
        }

        .policyItem[group-solo] {
          background-color: var(--md-sys-color-tertiary-container);
          color: var(--md-sys-color-on-tertiary-container);
        }

        .generationContainer {
          width: 100%;
        }

        .policy {
          text-align: left;
          background-color: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
          border-radius: 16px;
          padding: 16px;
          margin: 8px 0;
          max-width: 1360px;
        }

        .policyImageContainer {
          display: inline-block;
          margin-left: 8px;
        }

        .policyItemTitle {
          padding: 8px;
          font-size: 28px;
          font-family: 'Roboto Condensed', sans-serif;
        }

        .policyItemTitle[has-image] {
          margin-top: 6px;
        }

        .policyIndex {
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

        .policyItemEloRating {
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

        .policyTitle {
          font-size: 26px;
          line-height: 1.4;
          margin: 8px;
          margin-left: 8px;
          margin-right: 8px;
          margin-top: 16px;
          font-family: 'Roboto Condensed', sans-serif;
        }

        .policyTitleDesc {
          max-width: 600px;
          margin-right: 8px;
        }

        .policyDescription {
          padding: 8px;
          font-size: 20px;
          line-height: 1.4;
          margin-left: 0px;
          margin-right: 8px;
        }

        .policyAttributes {
          color: var(--md-sys-color-on-surface);
        }

        .policyAttributeHeader {
          color: var(--md-sys-color-primary);
        }

        .policyInfoContainer {
          max-width: 600px;
        }

        .pros,
        .cons {
          width: 45%;
          padding: 10px;
          margin: 10px 0;
        }

        @media (max-width: 960px) {
          .policyItemTitle {
            margin-top: 0;
            padding-top: 0;
            padding-bottom: 16px;
          }

          .policyTopImage {
            margin-top: 10px;
          }

          .policy {
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

          .policyItem {
            border-radius: 24px;
            padding: 32px;
            max-width: 300px;
            width: 100%;
            font-size: 18px;
          }

          .policyItem[has-image] {
            height: unset;
            margin-top: 0;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }

          .policyDescription {
            font-size: 16px;
            margin-left: 0px;
            margin-right: 0px;
          }

          .policyTitle {
            font-size: 20px;
            margin-left: 0px;
            margin-right: 0px;
          }

          .policyAttributes {
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

          .policyItemTitle {
            font-size: 22px;
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
    get filteredPolicies() {
        let subProblem = this.memory.subProblems[this.activeSubProblemIndex];
        if (subProblem && subProblem.policies) {
            let policies = subProblem.policies.populations[this.activePopulationIndex];
            let firstInGroup = {};
            if (policies) {
                policies.forEach(policy => {
                    if (policy.similarityGroup !== undefined) {
                        let groupIndex = policy.similarityGroup.index;
                        if (!firstInGroup[groupIndex]) {
                            firstInGroup[groupIndex] = policy;
                            policy.similarityGroup.isFirst = true;
                        }
                        else {
                            policy.similarityGroup.isFirst = undefined;
                        }
                    }
                });
                // Check if the active policy is part of a similarity group and the group is not already active
                if (this.activePolicyIndex !== null) {
                    const activePolicy = policies[this.activePolicyIndex];
                    if (activePolicy?.similarityGroup &&
                        this.activeGroupIndex !== activePolicy.similarityGroup.index &&
                        !activePolicy.similarityGroup.isFirst) {
                        this.activeGroupIndex = activePolicy.similarityGroup.index;
                    }
                }
                if (this.activeGroupIndex !== null) {
                    // If a group is active, only return policies from this group
                    policies = policies.filter(policy => policy.similarityGroup?.index === this.activeGroupIndex);
                }
                else {
                    // Otherwise, return only the first policy of each group
                    policies = policies.filter(policy => policy.similarityGroup?.isFirst ||
                        policy.similarityGroup === undefined);
                }
                if (this.searchText) {
                    const searchTerms = this.searchText.toLowerCase().split(' ');
                    policies = policies.filter(policy => searchTerms.every(term => policy.title.toLowerCase().includes(term) ||
                        policy.description.toLowerCase().includes(term)));
                }
            }
            else {
                return [];
            }
            return policies;
        }
        else {
            return [];
        }
    }
    render() {
        const subProblems = this.memory.subProblems || [];
        if (this.activePolicyIndex !== null) {
            return this.renderPolicyScreen(this.activeFilteredPolicyIndex !== null
                ? this.activeFilteredPolicyIndex
                : this.activePolicyIndex);
        }
        else if (this.activeSubProblemIndex !== null) {
            return this.renderSubProblemScreen(subProblems[this.activeSubProblemIndex]);
        }
        else {
            return this.renderSubProblemList(subProblems, this.t('Sub Problems and Policies'));
        }
    }
    renderPolicyItem(policy, index) {
        return html `
      <div
        class="policyItem layout vertical center-center"
        ?has-image="${policy.imageUrl}"
        ?group-solo="${this.activeGroupIndex !== null}"
        @click="${() => {
            //this.activePolicyIndex = index;
            this.activeFilteredPolicyIndex = index;
            this.policyListScrollPositionX = window.scrollX;
            this.policyListScrollPositionY = window.scrollY;
            window.scrollTo(0, 0);
            //console.error(`click`, this.activeFilteredPolicyIndex);
            //console.error(`click`, this.activePolicyIndex);
            window.psAppGlobals.activity('Policies - open detail');
        }}"
      >
        ${policy.imageUrl
            ? html `
              <div>
                <img
                  alt="${policy.imagePrompt}"
                  loading="lazy"
                  class="policyImage"
                  height="${this.wide ? `365` : `200`}"
                  src="${this.fixImageUrlIfNeeded(policy.imageUrl)}"
                />
              </div>
            `
            : html ``}
        <div class="policyItemTitle" ?has-image="${policy.imageUrl}">
          ${policy.title}
        </div>
        <div
          class="policyItemEloRating"
          ?hidden="${this.activeGroupIndex === null}"
        >
          ${YpFormattingHelpers.number(policy.eloRating)}
        </div>
        ${policy.similarityGroup?.isFirst !== undefined &&
            policy.similarityGroup.isFirst
            ? html `
              <div
                class="groupInfo layout ${this.wide
                ? 'vertical center-center'
                : 'horizontal'}"
              >
                <md-outlined-icon-button
                  toggle
                  ?selected="${this.activeGroupIndex ===
                policy.similarityGroup.index}"
                  class="groupButton"
                  @click="${(e) => {
                e.stopPropagation();
                this.handleGroupButtonClick(policy.similarityGroup.index);
            }}"
                >
                  <md-icon>unfold_more_double</md-icon>
                  <md-icon slot="selectedIcon">close</md-icon>
                </md-outlined-icon-button>
                <div class="groupInfoText">
                  ${this.activeGroupIndex === null
                ? html `+${policy.similarityGroup.totalCount}`
                : nothing}
                </div>
              </div>
            `
            : html ``}
      </div>
    `;
    }
    renderSubProblemScreen(subProblem) {
        return html `
      <div class="topContainer layout vertical self-start">
        <div class="layout horizontal center-center">
          ${this.renderSubProblem(subProblem, false, 0, true, true)}
        </div>
        <div class="layout horizontal center-center">
          <div class="title">${this.t('Evolving Policies')}</div>
        </div>
        <div class="generationContainer layout vertical center-center">
          ${this.renderChipSet(subProblem)}
          <div id="policyList">
            ${this.filteredPolicies.map((policy, index) => this.renderPolicyItem(policy, index))}
          </div>
        </div>
      </div>
    `;
    }
    renderChipSet(subProblem) {
        if (!subProblem.policies) {
            return nothing;
        }
        if (subProblem.policies.populations) {
            let firstItems, lastItems, middleItems;
            if (!this.wide) {
                firstItems = subProblem.policies.populations.slice(0, 1);
                lastItems = subProblem.policies.populations.slice(-1);
                middleItems = subProblem.policies.populations.slice(1, -1);
            }
            else {
                firstItems = subProblem.policies.populations.slice(0, 3);
                if (subProblem.policies.populations.length > 3) {
                    lastItems = subProblem.policies.populations.slice(3, 6);
                    if (subProblem.policies.populations.length > 6) {
                        lastItems = subProblem.policies.populations.slice(-3);
                        middleItems = subProblem.policies.populations.slice(3, -3);
                    }
                    else {
                        middleItems = [];
                    }
                }
                else {
                    lastItems = [];
                    middleItems = [];
                }
                if (subProblem.policies.populations.length === 7) {
                    middleItems = subProblem.policies.populations.slice(3, 4);
                }
            }
            return html `
        <md-chip-set
          class="generations layout horizontal wrap"
          type="filter"
          single-select
        >
          ${this.renderFilterChips(firstItems, 0)}
          ${this.renderDropdown(middleItems, firstItems.length)}
          ${this.renderFilterChips(lastItems, subProblem.policies.populations.length - lastItems.length)}
          <md-outlined-icon-button
            ?hidden="${this.isSearchVisible}"
            @click="${this.toggleSearchVisibility}"
          >
            <md-icon>search</md-icon>
          </md-outlined-icon-button>
          ${this.isSearchVisible ? this.renderSearchField() : nothing}
        </md-chip-set>
      `;
        }
        else {
            return nothing;
        }
    }
    toggleSearchVisibility() {
        this.isSearchVisible = !this.isSearchVisible;
        window.psAppGlobals.activity('Policies - toggle search');
    }
    renderSearchField() {
        return html `
      <md-outlined-text-field
        ?middle-open="${this.isDropdownVisible}"
        .label="${this.t('Filter')}"
        .value="${this.searchText}"
        @keyup="${(e) => {
            this.searchText = e.target.value;
        }}"
        @keydown="${(e) => {
            if (e.key == 'Escape') {
                e.stopPropagation();
                e.preventDefault();
            }
        }}"
        @blur="${this.handleSearchBlur}"
      ></md-outlined-text-field>
    `;
    }
    handleSearchBlur() {
        if (this.searchText.trim() === '') {
            this.isSearchVisible = false;
        }
    }
    renderFilterChips(items, startIndex) {
        return items.map((population, index) => html `<md-filter-chip
          class="layout horizontal center-center"
          ?more-than-seven-items="${items.length > 7}"
          label="Generation ${startIndex + index + 1}"
          .selected="${this.activePopulationIndex === startIndex + index}"
          @click="${() => {
            this.activePopulationIndex = startIndex + index;
            this.resetDropdown();
            window.psAppGlobals.activity('Policies - chose generation');
        }}"
        ></md-filter-chip> `);
    }
    handleDropdownChange(e) {
        const selectElement = e.target;
        const newIndex = Number(selectElement.value) - 1;
        if (!isNaN(newIndex) &&
            newIndex >= 0 &&
            newIndex < this.memory.subProblems.length) {
            this.activePopulationIndex = newIndex;
        }
    }
    toggleDropdownVisibility() {
        window.psAppGlobals.activity('Policies - toggle dropdown');
        this.isDropdownVisible = !this.isDropdownVisible;
        if (this.isDropdownVisible) {
            // add check to ensure activePopulationIndex is valid
            if (this.memory.subProblems.length > 3) {
                this.activePopulationIndex = 3;
            }
            else if (this.memory.subProblems.length > 0) {
                this.activePopulationIndex = this.memory.subProblems.length - 1;
            }
            else {
                this.activePopulationIndex = 0;
            }
        }
    }
    resetDropdown() {
        const dropdown = this.shadowRoot.querySelector('md-outlined-select');
        if (dropdown) {
            this.isDropdownVisible = false;
        }
    }
    renderDropdown(middleItems, startIndex) {
        if (middleItems.length > 0 && !this.isDropdownVisible) {
            return html `
        <md-outlined-icon-button @click="${this.toggleDropdownVisibility}">
          <md-icon>expand_more</md-icon>
        </md-outlined-icon-button>
      `;
        }
        else if (middleItems.length > 0 && this.isDropdownVisible) {
            return html `
        <md-outlined-select
          label="Generation ..."
          .quick=${true}
          .required=${false}
          .disabled=${false}
          @change=${(e) => this.handleDropdownChange(e)}
        >
          ${middleItems.map((population, index) => html `<md-select-option
                .value="${(startIndex + index + 1).toString()}"
                .headline="Generation ${startIndex + index + 1}"
              ></md-select-option>`)}
        </md-outlined-select>
      `;
        }
        else {
            return nothing;
        }
    }
    camelCaseToRegular(text) {
        let result = text.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }
    renderRatings(policy) {
        return html `
      <div class="ratings" hidden>
        <div class="ratingsHeader eloRatings layout horizontal center-center">
          <div>
            ${this.t('Elo Rating')}:
            ${YpFormattingHelpers.number(policy.eloRating)}
          </div>
        </div>

        ${policy.ratings
            ? html `
              ${Object.entries(policy.ratings).map(([category, ratings]) => html `
                  <div class="ratingsHeader">
                    ${this.camelCaseToRegular(category)}
                  </div>
                  ${Object.entries(ratings).map(([key, value]) => html `
                      <div class="rating">
                        ${this.camelCaseToRegular(key)}: ${value}
                      </div>
                    `)}
                `)}
            `
            : nothing}
      </div>
    `;
    }
    renderPolicyNavigationButtons(policyIndex, policies) {
        return html `
      <div class="layout horizontal center-center">
        <md-icon-button
          aria-label="Previous"
          .disabled="${policyIndex === 0}"
          @click="${() => {
            if (policyIndex > 0) {
                this.activeFilteredPolicyIndex = policyIndex - 1;
                window.psAppGlobals.activity('Policies - click previous policy');
            }
        }}"
        >
          <md-icon>navigate_before</md-icon>
        </md-icon-button>
        <md-icon-button
          aria-label="Next"
          .disabled="${policyIndex === policies.length - 1}"
          @click="${() => {
            if (policyIndex < policies.length - 1) {
                this.activeFilteredPolicyIndex = policyIndex + 1;
                window.psAppGlobals.activity('Policies - click next policy');
            }
        }}"
        >
          <md-icon>navigate_next</md-icon>
        </md-icon-button>
        <md-icon-button
          aria-label="Close"
          @click="${() => {
            this.activePolicyIndex = null;
            this.activeFilteredPolicyIndex = null;
            this.exitPolicyScreen();
            window.psAppGlobals.activity('Policies - exit policy detail');
        }}"
        >
          <md-icon>close</md-icon>
        </md-icon-button>
      </div>
    `;
    }
    getPolicyImgHeight() {
        if (this.wide) {
            return 314;
        }
        else {
            return 150;
        }
    }
    getPolicyImgWidth() {
        if (this.wide) {
            return 550;
        }
        else {
            return 263;
        }
    }
    renderPolicyImage(policy) {
        return html `
      <div class="policyImageContainer">
        <img
          loading="lazy"
          alt="${policy.imagePrompt}"
          title="${policy.imagePrompt}"
          class="policyTopImage"
          height="${this.getPolicyImgHeight()}"
          width="${this.getPolicyImgWidth()}"
          src="${this.fixImageUrlIfNeeded(policy.imageUrl)}"
          .key="${policy.imageUrl}"
        />
      </div>
    `;
    }
    renderPolicyScreen(policyIndex) {
        const policies = this.filteredPolicies;
        const policy = policies[policyIndex];
        if (policy) {
            return html `
        ${!policy.reaped
                ? html `
              <div class="topContainer layout vertical center-center">
                ${this.renderPolicyNavigationButtons(policyIndex, policies)}
                <div
                  class="policy layout ${this.wide
                    ? 'horizontal'
                    : 'vertical'} center-cener"
                >
                  ${policy.imageUrl && !this.wide
                    ? this.renderPolicyImage(policy)
                    : nothing}

                  <div class="policyTitleDesc">
                    <div class="policyTitle">${policy.title}</div>
                    <div class="policyDescription">${policy.description}</div>
                  </div>
                  ${policy.imageUrl && this.wide
                    ? this.renderPolicyImage(policy)
                    : nothing}
                </div>

                <div
                  class="layout vertical center-justified policyInfoContainer"
                >
                  <div
                    class="policyDescription"
                    ?hidden="${this.hideExtraPolicyInformation}"
                  >
                    <div class="policyAttributeHeader">
                      ${this.t('Conditions for Success')}
                    </div>
                    <div class="policyAttributes">
                      ${policy.conditionsForSuccess.map(condition => html `<div>${condition}</div>`)}
                    </div>
                  </div>
                  <div
                    class="policyDescription"
                    ?hidden="${this.hideExtraPolicyInformation}"
                  >
                    <div class="policyAttributeHeader">
                      ${this.t('Main Risks')}
                    </div>
                    <div class="policyAttributes">
                      ${policy.mainRisks.map(risk => html `<div>${risk}</div>`)}
                    </div>
                  </div>
                  <div
                    class="policyDescription"
                    ?hidden="${this.hideExtraPolicyInformation}"
                  >
                    <div class="policyAttributeHeader">
                      ${this.t('Main Obstacles for Implemention')}
                    </div>
                    <div class="policyAttributes">
                      ${policy.mainObstaclesForImplemention.map(mainObstaclesForImplemention => html `<div>${mainObstaclesForImplemention}</div>`)}
                    </div>
                  </div>
                </div>

                ${this.renderRatings(policy)}

                ${cache(html `<ps-raw-evidence
                  .activeSubProblemIndex="${this.activeSubProblemIndex}"
                  .policy="${policy}"
                  .memory="${this.memory}"
                ></ps-raw-evidence>`)}
                ${this.renderPolicyNavigationButtons(policyIndex, policies)}
              </div>
            `
                : html `<div class="reapedInfo layout horizontal center-center">
              <div>REAPED</div>
            </div>`}
      `;
        }
        else {
            return nothing;
        }
    }
};
__decorate([
    property({ type: Boolean })
], PsPolicies.prototype, "isDropdownVisible", void 0);
__decorate([
    property({ type: String })
], PsPolicies.prototype, "searchText", void 0);
__decorate([
    property({ type: Number })
], PsPolicies.prototype, "activeFilteredPolicyIndex", void 0);
__decorate([
    property({ type: Boolean })
], PsPolicies.prototype, "isSearchVisible", void 0);
__decorate([
    property({ type: Boolean })
], PsPolicies.prototype, "hideExtraPolicyInformation", void 0);
__decorate([
    property({ type: Number })
], PsPolicies.prototype, "groupListScrollPositionY", void 0);
PsPolicies = __decorate([
    customElement('ps-policies')
], PsPolicies);
export { PsPolicies };
//# sourceMappingURL=ps-policies.js.map