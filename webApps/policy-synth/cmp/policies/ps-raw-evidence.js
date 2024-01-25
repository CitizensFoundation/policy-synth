var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PsRawEvidence_1;
import { css, html, nothing } from 'lit';
import { property, customElement, eventOptions } from 'lit/decorators.js';
import '@yrpri/webapp/common/yp-image.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/button/text-button.js';
import { Layouts } from '../flexbox-literals/classes.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element.js';
let PsRawEvidence = PsRawEvidence_1 = class PsRawEvidence extends YpBaseElement {
    constructor() {
        super(...arguments);
        this.groupedRawEvidence = {};
        this.loading = true;
        this.showDropdown = false;
        this.showFullList = {};
    }
    handleScroll() {
        if (window.scrollY >= 550) {
            this.showDropdown = true;
        }
        else {
            this.showDropdown = false;
        }
        this.requestUpdate();
    }
    async connectedCallback() {
        super.connectedCallback();
        window.psAppGlobals.activity(`Raw evidence - open`);
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if ((changedProperties.has('activeSubProblemIndex') ||
            changedProperties.has('policy')) &&
            this.activeSubProblemIndex !== undefined &&
            this.policy !== undefined) {
            if (PsRawEvidence_1.rawPolicyCache[`${this.activeSubProblemIndex}-${this.policy.title}`]) {
                this.activeRawEvidence =
                    PsRawEvidence_1.rawPolicyCache[`${this.activeSubProblemIndex}-${this.policy.title}`];
                this.setupRawEvidence();
            }
            else {
                this.loading = true;
                this.activeRawEvidence = null;
                this.loadRawEvidence();
            }
        }
    }
    setupRawEvidence() {
        this.groupedRawEvidence = {};
        this.activeRawEvidence.forEach(evidence => {
            if (!this.groupedRawEvidence[evidence.searchType]) {
                this.groupedRawEvidence[evidence.searchType] = [];
            }
            this.groupedRawEvidence[evidence.searchType].push(evidence);
        });
        // Sort each group by totalScore, in descending order
        for (const searchType in this.groupedRawEvidence) {
            this.groupedRawEvidence[searchType].sort((a, b) => {
                return (b.totalScore ?? 0) - (a.totalScore ?? 0);
            });
        }
        this.loading = false;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.psAppGlobals.activity(`Raw evidence - close`);
        window.removeEventListener('scroll', this.handleScroll.bind(this));
    }
    formatSearchType(searchType) {
        // Insert a space before all capital letters, then capitalize the first letter
        const formatted = searchType.replace(/([A-Z])/g, ' $1').trim();
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    async loadRawEvidence() {
        const rawEvidence = (await window.psServerApi.getRawEvidence(this.memory.groupId, this.activeSubProblemIndex, this.policy.title));
        PsRawEvidence_1.rawPolicyCache[`${this.activeSubProblemIndex}-${this.policy.title}`] = rawEvidence;
        this.activeRawEvidence = rawEvidence;
        this.setupRawEvidence();
    }
    static get styles() {
        return [
            super.styles,
            Layouts,
            css `
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100vh;
        }

        .title {
          font-family: 'Roboto Condensed', sans-serif;
          font-size: 32px;
          margin-bottom: 8px;
          color: var(--md-sys-color-primary);
          background-color: var(--md-sys-color-on-primary);
          text-align: center;
          padding: 16px;
          border-radius: 16px;
          max-width: 960px;
          margin-top: 32px;
          width: 100%;
        }

        .listTitle {
          font-family: 'Roboto Condensed', sans-serif;
          font-size: 26px;
          color: var(--md-sys-color-secondary);
          background-color: var(--md-sys-color-on-secondary);
          text-align: center;
          padding: 16px;
          max-width: 400px;
          margin: 16px;
          border-radius: 12px;
        }

        .fade-in {
          animation: fadeIn ease 1s;
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        md-outlined-select::part(menu) {
          max-height: 500px;
          height: 500px;
        }

        md-outlined-select {
          max-width: 230px;
        }

        .jumpToPolicyTitle {
          max-width: 200px;
          margin-bottom: 24px;
        }

        .listItem {
          text-align: left;
          padding: 8px;
          font-size: 20px;
          color: var(--md-sys-color-on-surface);
        }

        .dropdown {
          position: fixed;
          bottom: 64px;
          left: 16px;
          z-index: 1000;
        }

        .url {
          font-size: 18px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 350px;
          color: var(--md-sys-color-on-surface);
          margin-top: 8px;
        }

        .rawEvidenceContainer {
          background-color: var(--md-sys-color-surface-container-low);
          color: var(--md-sys-color-on-surface);
          margin: 16px;
          padding: 16px;
        }

        .evidenceItem {
          max-width: 420px;
          margin: 16px;
          align-self: start;
        }

        .header {
          margin-bottom: 20px;
        }

        .meta-description {
          max-width: 600px;
        }

        .topEvidencePiece {
          border-bottom: 5px dashed var(--md-sys-color-primary);
          padding-bottom: 24px;
          margin-bottom: 24px;
        }

        .header-title {
          font-size: 24px;
          font-weight: bold;
          max-width: 600px;
          margin-bottom: 8px;
        }

        .header-meta {
          display: flex;
          flex-direction: row;
          align-items: center;
        }

        .meta-description,
        .meta-author,
        .meta-date,
        .meta-publisher {
          margin: 8px;
          font-size: 20px;
        }

        .logoImage {
          height: 125px;
          max-width: 600px;
          margin: 8px;
        }

        .shareImage {
          height: 275px;
          max-width: 800px;
          margin: 8px;
          margin-bottom: 8px;
        }

        a {
          font-size: 18px;
        }

        .hidden {
          display: none;
        }

        @media (max-width: 960px) {
          .title {
            margin-top: 16px;
            max-width: 100%;
            margin-right: 8px;
            margin-left: 8px;
            font-size: 26px;
            border-radius: 16px;
            max-width: 100%;
          }
        }
      `,
        ];
    }
    renderHeader(evidence) {
        return html `
      <div class="header layout vertical center-center">
        <div class="header-meta layout vertical">
          <div class="layout vertical center-center">
            ${evidence.metaLogoUrl
            ? html `<img
                  class="logoImage"
                  loading="lazy"
                  src="${evidence.metaLogoUrl}"
                  alt="Logo"
                />`
            : nothing}
            ${evidence.metaImageUrl
            ? html `<img
                  class="shareImage"
                  loading="lazy"
                  src="${evidence.metaImageUrl}"
                  alt="Image"
                />`
            : nothing}
            <div ?hidden="${!evidence.metaTitle}" class="header-title">
              ${evidence.metaTitle}
            </div>
          </div>
          ${evidence.summary
            ? html `<div class="meta-description">${evidence.summary}</div>`
            : nothing}
          ${evidence.metaDate
            ? html `<div hidden class="meta-date">${evidence.metaDate}</div>`
            : nothing}
          <a class="url" href="${evidence.url}" target="_blank"
            >${evidence.url}</a
          >
        </div>
      </div>
    `;
    }
    scrollToEvidenceType(evidenceType) {
        const element = this.$$('#' + evidenceType);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
    renderDropdown() {
        return html `
      <div class="dropdown ${this.showDropdown ? '' : 'hidden'}">
        <div class="jumpToPolicyTitle">${this.policy.title}</div>
        <md-outlined-select
          label="Jump to Evidence Type ..."
          .quick=${true}
          .required=${false}
          .disabled=${false}
          @change=${(e) => this.scrollToEvidenceType(e.target.value)}
        >
          ${Object.keys(this.groupedRawEvidence).map(evidenceType => html `<md-select-option
              .value="${evidenceType}"
              .headline="${this.camelCaseToRegular(evidenceType)}"
            ></md-select-option>`)}
        </md-outlined-select>
      </div>
    `;
    }
    renderPieceOfEvidence(evidence) {
        return html `<div class="layout vertical topEvidencePiece">
      ${this.renderHeader(evidence)}
      <div class="layout horizontal center-center wrap">
        ${this.renderShortList(evidence.url, 'Policy Recommendations', evidence.whatPolicyNeedsToImplementInResponseToEvidence)}
        ${this.renderShortList(evidence.url, 'Evidence Collected (unproven)', evidence.mostImportantPolicyEvidenceInTextContext)}
        ${this.renderShortList(evidence.url, 'Policy Risks', evidence.risksForPolicy)}
        ${this.renderShortList(evidence.url, 'Pros for Policy from source', evidence.prosForPolicyFoundInTextContext)}
        ${this.renderShortList(evidence.url, 'Cons for Policy from source', evidence.consForPolicyFoundInTextContext)}
        ${this.renderShortList(evidence.url, 'Academic Sources', evidence.evidenceOrganizationSources)}
        ${this.renderShortList(evidence.url, 'Organization Sources', evidence.evidenceAcademicSources)}
      </div>
    </div>`;
    }
    camelCaseToRegular(text) {
        let result = text.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    }
    renderShortList(url, title, list) {
        if (!list || list.length === 0) {
            return nothing;
        }
        else {
            const maxShortListToShowInitially = 3;
            const showKey = `${url}-${title}`;
            const isFullListShown = this.showFullList[showKey] || false;
            const itemsToShow = isFullListShown
                ? list
                : list.slice(0, maxShortListToShowInitially);
            return html `<div class="evidenceItem">
        <div class="listTitle">${title}</div>
        <div>
          ${itemsToShow.map((item, index) => html ` <div class="listItem">${index + 1}. ${item}</div>`)}
        </div>
        ${list.length > maxShortListToShowInitially
                ? html `
              <md-text-button @click=${() => this.toggleShowFullList(showKey)}>
                ${isFullListShown
                    ? this.t('Less')
                    : `${this.t('More')} (${list.length - maxShortListToShowInitially})`}
              </md-text-button>
            `
                : nothing}
      </div>`;
        }
    }
    toggleShowFullList(key) {
        this.showFullList = {
            ...this.showFullList,
            [key]: !this.showFullList[key],
        };
        this.requestUpdate();
    }
    renderActiveRawEvidence() {
        return html ` ${this.renderDropdown()}
      <div class="layout vertical center-center">
        ${Object.keys(this.groupedRawEvidence).map(searchType => html `
            <div id="${searchType}" class="title">
              ${this.formatSearchType(searchType)}
            </div>

            <div class="rawEvidenceContainer layout vertical center-center">
              ${this.groupedRawEvidence[searchType].map(evidence => this.renderPieceOfEvidence(evidence))}
            </div>
          `)}
      </div>`;
    }
    render() {
        if (this.loading) {
            return html `<div class="loading">
        <md-circular-progress indeterminate></md-circular-progress>
      </div>`;
        }
        else if (this.activeRawEvidence) {
            return this.renderActiveRawEvidence();
        }
        else {
            return nothing;
        }
    }
};
PsRawEvidence.rawPolicyCache = {};
__decorate([
    property({ type: Object })
], PsRawEvidence.prototype, "memory", void 0);
__decorate([
    property({ type: Object })
], PsRawEvidence.prototype, "policy", void 0);
__decorate([
    property({ type: Number })
], PsRawEvidence.prototype, "activeSubProblemIndex", void 0);
__decorate([
    property({ type: Array })
], PsRawEvidence.prototype, "activeRawEvidence", void 0);
__decorate([
    property({ type: Object })
], PsRawEvidence.prototype, "groupedRawEvidence", void 0);
__decorate([
    property({ type: Boolean })
], PsRawEvidence.prototype, "loading", void 0);
__decorate([
    property({ type: Boolean })
], PsRawEvidence.prototype, "showDropdown", void 0);
__decorate([
    property({ type: Object })
], PsRawEvidence.prototype, "showFullList", void 0);
__decorate([
    eventOptions({ passive: true })
], PsRawEvidence.prototype, "handleScroll", null);
PsRawEvidence = PsRawEvidence_1 = __decorate([
    customElement('ps-raw-evidence')
], PsRawEvidence);
export { PsRawEvidence };
//# sourceMappingURL=ps-raw-evidence.js.map