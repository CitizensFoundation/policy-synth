import { css, html, nothing } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';

import './@yrpri/common/yp-image.js';
import { YpFormattingHelpers } from './@yrpri/common/YpFormattingHelpers.js';
import { YpBaseElement } from './@yrpri/common/yp-base-element.js';

import '@material/web/checkbox/checkbox.js';
import { Checkbox } from '@material/web/checkbox/lib/checkbox.js';
import '@material/web/button/outlined-button.js';
import '@material/web/circularprogress/circular-progress.js';
import '@material/web/iconbutton/standard-icon-button.js';
import { MdStandardIconButton } from '@material/web/iconbutton/standard-icon-button.js';
import { Router } from '@lit-labs/router';

//TDOO: Share from db config
const maxNumberOfSubProblems = 7;

export abstract class CpsStageBase extends YpBaseElement {
  @property({ type: Object })
  memory: IEngineInnovationMemoryData;

  @property({ type: Boolean })
  showEloRatings = false;

  @property({ type: Number })
  activeSubProblemIndex: number | null = null;

  @property({ type: Number })
  activeSolutionIndex: number | null = null;

  @property({ type: Number })
  activePopulationIndex = 0;

  @property({ type: Boolean })
  firstTimeSubProblemClick = true;

  @property({ type: Number })
  activeGroupIndex: number = null;

  @property({ type: Object })
  router!: Router;

  @state()
  displayStates = new Map();

  subProblemListScrollPositionX: number = 0;
  subProblemListScrollPositionY: number = 0;

  subProblemColors: string[] = [];

  maxTopSearchQueries = 4;
  maxUsedSearchResults = 10;

  connectedCallback(): void {
    super.connectedCallback();
    if (this.memory.groupId == 2) {
      this.maxTopSearchQueries = 3;
      this.maxUsedSearchResults = 1000;
    }
    if (this.memory.subProblemClientColors) {
      this.subProblemColors = this.memory.subProblemClientColors;
    } else {
      this.subProblemColors = [
        '#0b60b9',
        '#ee782d',
        '#face2d',
        '#50c363',
        '#cf1103',
        '#e9a633',
        '#87559b',
        '#3f5fce',
      ];
    }
  }

  updateRoutes() {
    this.fire('update-route', {
      activeSolutionIndex: this.activeSolutionIndex,
      activeSubProblemIndex: this.activeSubProblemIndex,
      activePopulationIndex: this.activePopulationIndex,
    });
  }

  updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (
      changedProperties.has('activeSolutionIndex') ||
      changedProperties.has('activeSubProblemIndex') ||
      changedProperties.has('activePopulationIndex')
    ) {
      this.updateRoutes();
    }
  }

  exitSubProblemScreen() {
    window.scrollTo(
      this.subProblemListScrollPositionX,
      this.subProblemListScrollPositionY
    );
  }

  async toggleDisplayState(title: string) {
    const scrollPosition = window.scrollY;
    const currentState = this.displayStates.get(title);
    this.displayStates.set(title, !currentState);
    this.requestUpdate();
    await this.updateComplete;
    window.scrollTo(0, scrollPosition);
  }

  toggleScores() {
    const checkbox = this.$$('#showScores') as Checkbox;
    this.showEloRatings = checkbox.checked;
    window.appGlobals.activity(
      `View memory - toggle scores ${this.showEloRatings ? 'on' : 'off'}`
    );
  }

  fixImageUrlIfNeeded(url: string) {
    if (url.startsWith('https')) {
      return url;
    } else {
      return `https://${url}`;
    }
  }

  static get styles() {
    return [
      super.styles,
      css`
        .topContainer {
          margin-right: 32px;
          margin-top: 24px;
          margin-bottom: 64px;
        }

        .topContainer[is-header] {
          width: 100%;
          max-width: 100%;
        }

        .subProblemImage {
        }

        .subProblemImage[is-header] {
          margin-bottom: 32px;
          margin-top: 0;
        }

        .subProblemImage[not-header] {
          margin-bottom: 16px;
          margin-top: -16px;
          margin-left: 8px;
          margin-right: 8px;
        }

        .problemStatement {
          font-size: 22px;
          padding: 16px;
          margin: 16px 0;
          border-radius: 16px;
          line-height: 1.5;
          background-color: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
          max-width: 960px;
          margin-bottom: 0px;
          padding-top: 8px;
        }

        .problemStatementText {
          padding: 16px;
          font-size: 24px;
        }

        .subProblemStatement,
        .subProblemTitle {
          font-size: 22px;
          padding: 8px;
          margin: 8px;
          border-radius: 12px;
          line-height: 1.4;
          max-width: 960px;
        }

        .subProblemStatement {
          padding-left: 0px;
          padding-right: 16px;
        }

        .subProblemStatement[not-header] {
          background-color: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
        }

        .subProblemStatement[is-header] {
          font-size: 18px;
        }

        .subProblemTitle {
          font-size: 26px;
          padding-bottom: 0;
          font-family: 'Roboto Condensed', sans-serif;
        }

        .subProblemMainTitle {
          font-size: 32px;
          margin-left: 8px;
        }

        .subProblemMainTitle[is-header] {
          margin-left: 8px;
        }

        .headerContainer[is-header] {
          position: relative;
          width: 100%;
        }

        .subProblem {
          opacity: 1;
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
          background-color: var(--md-sys-color-primary-container);
          color: var(--md-sys-color-on-primary-container);
          margin-bottom: 8px;
          padding-bottom: 16px;
        }

        .subProblem[is-header] {
          cursor: pointer;
          background-color: var(--md-sys-color-secondary-container);
          color: var(--md-sys-color-on-secondary-container);
          max-height: 206px;
          margin: 0;
          max-width: 960px;
        }

        .subProblem[not-header] {
          cursor: pointer;
          background-color: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
          max-width: 450px;
          margin-top: 16px;
          margin-bottom: 16px;
          padding-top: 0;
          margin-right: 16px;
          margin-left: 16px;
        }

        .navButton[is-header] {
          position: absolute;
          bottom: 16px;
          right: 16px;
        }

        .title {
          font-family: 'Roboto Condensed', sans-serif;
          font-size: 32px;
          margin-bottom: 8px;
          color: var(--md-sys-color-secondary);
          background-color: var(--md-sys-color-on-secondary);
          text-align: center;
          padding: 16px;
          border-radius: 16px;
          max-width: 960px;
          margin-top: 32px;
          width: 100%;
        }

        .smallerTitle {
          font-size: 22px;
        }

        .subProblem.lessProminent {
          opacity: 0.55;
        }

        .subTitle {
        }

        .profileImage {
          width: 50px;
          height: 50px;
          min-height: 50px;
          min-width: 50px;
          margin-right: 8px;
        }

        .searchResults {
          background-color: var(--md-sys-color-surface);
          color: var(--md-sys-color-on-surface);
        }

        .row {
          padding: 8px;
          margin: 8px;
          border-radius: 16px;
          background-color: var(--md-sys-color-on-primary);
          color: var(--md-sys-color-primary);

          min-width: 350px;
          width: 550px;

          font-size: 16px;
          vertical-align: center;

          padding-bottom: 16px;
        }

        .row[current-user] {
          background-color: var(--md-sys-color-teriary);
          color: var(--md-sys-color-on-primary);
        }

        .column {
          padding: 8px;
          padding-bottom: 0;
        }

        .index {
          font-size: 16px;
        }

        .ideaName {
          padding-bottom: 0;
          width: 100%;
        }

        .nameAndScore {
          width: 100%;
        }

        .subProblemContainer {
          width: 100%;
        }

        .scores {
          margin-top: 16px;
          padding: 16px;
          padding-top: 12px;
          padding-bottom: 12px;
          margin-bottom: 0px;
          text-align: center;
          background-color: var(--md-sys-color-surface-variant);
          color: var(--md-sys-color-on-surface-variant);
          border-radius: 24px;
          font-size: 14px;
          line-height: 1.2;
        }

        .checkboxText {
          color: var(--md-sys-color-primary);
          margin-top: 14px;
        }

        md-checkbox {
          padding-bottom: 8px;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100vh;
        }

        .scores[hidden] {
          display: none;
        }

        .winLosses {
          margin-top: 4px;
        }

        .scoreAndNameContainer {
          width: 100%;
        }

        .exportButton {
          margin-bottom: 128px;
          margin-top: 32px;
        }

        .queryType {
          font-size: 18px;
          margin-top: 16px;
          margin-bottom: 8px;
        }

        .query {
          font-size: 16px;
          margin-bottom: 0px;
          opacity: 0.7;
        }

        .queryUsed {
          font-weight: 500;
          opacity: 1;
        }

        .card {
          padding: 16px;
          padding-top: 0;
          margin: 8px;
          border-radius: 8px;
          width: 100%;
          max-width: 960px;
        }

        .searchItem {
          opacity: 0.5;
        }

        a {
          color: var(--md-sys-color-on-surface);
        }

        .selectedSearchItem {
          opacity: 1;
        }

        .searchTitle {
          font-weight: 500;
          margin-top: 16px;
        }

        .url {
          margin-bottom: 16px;
          margin-top: 4px;
        }

        @media (max-width: 960px) {
          .problemStatementText {
            font-size: 22px;
          }

          .subProblemMainTitle {
            font-size: 28px;
            line-height: 1.3;
          }
          .subProblemStatement,
          .subProblemTitle {
            font-size: 18px;
            max-width: 100%;
          }

          .subProblemStatement {
            padding-left: 8px;
            padding-right: 8px;
          }

          .subProblem {
            max-width: 100% !important;
            height: 100%;
            max-height: 100%;
            padding: 8px;
            padding-bottom: 0px;
          }

          .subProblemStatement {
            padding: 0px;
            padding-bottom: 32px;
          }

          .subProblem[is-header] {
            max-width: 100% !important;
            height: 100%;
            max-height: 100%;
          }

          .subProblemMainTitle[is-header] {
            margin: 8px;
            font-size: 24px;
          }

          .navButton[is-header] {
            position: absolute;
            bottom: 0;
            right: 0;
          }

          .subProblemImage[is-header] {
            margin-bottom: 8px;
          }

          .subProblemTitle {
          }

          .title {
            margin-top: 16px;
            max-width: 100%;
            margin-right: 8px;
            margin-left: 8px;
            font-size: 26px;
            border-radius: 16px;
            max-width: 100%;
          }

          .smallerTitle {
            font-size: 16px;
            max-width: 320px;
          }

          .topContainer {
            margin-left: 16px;
            margin-right: 16px;
          }
          .problemStatement {
            font-size: 18px;
            max-width: 100%;
            margin-bottom: 16px;
          }
          .queryType {
            font-size: 16px;
            margin-top: 12px;
            margin-bottom: 6px;
          }

          .query {
            font-size: 14px;
            margin-bottom: 3px;
          }
        }

        @media (min-width: 960px) {
          .questionTitle {
            margin-bottom: 16px;
          }
        }

        @media (max-width: 960px) {
          .loading {
            width: 100vw;
            height: 100vh;
          }

          .searchTitle {
            max-width: 320px;
          }
        }
      `,
    ];
  }

  isUsedSearch(result: IEngineSearchResultItem, index: number) {
    if (
      index < this.maxUsedSearchResults ||
      (result.position && result.position <= this.maxUsedSearchResults) ||
      (result.originalPosition &&
        result.originalPosition <= this.maxUsedSearchResults)
    ) {
      return 'selectedSearchItem';
    } else {
      return ``;
    }
  }

  closeSubProblem(event: CustomEvent) {
    this.activeSubProblemIndex = null;
    event.stopPropagation();
    this.fire('yp-theme-color', this.subProblemColors[7]);
  }

  setSubProblemColor(index: number) {
    if (index < 7) {
      this.fire('yp-theme-color', this.subProblemColors[index]);
    }
  }

  setSubProblem(index: number) {
    this.activeSubProblemIndex = index;
    this.subProblemListScrollPositionX = window.scrollX;
    this.subProblemListScrollPositionY = window.scrollY;

    window.scrollTo(0, 0);

    this.setSubProblemColor(index);

    if (this.firstTimeSubProblemClick || this.activePopulationIndex === null) {
      this.firstTimeSubProblemClick = false;
      if (
        this.memory.subProblems.length > 0 &&
        this.memory.subProblems[this.activeSubProblemIndex].solutions
      ) {
        this.activePopulationIndex =
          this.memory.subProblems[this.activeSubProblemIndex].solutions
            .populations.length - 1;
      }
    }

    this.updateRoutes();

    window.appGlobals.activity('Sub Problem - click');
  }

  toggleDarkMode() {
    this.fire('yp-theme-dark-mode', !this.themeDarkMode);
    window.appGlobals.activity('Solutions - toggle darkmode');
  }

  renderThemeToggle() {
    return html`<div class="layout vertical center-center">
      ${!this.themeDarkMode
        ? html`
            <md-outlined-icon-button
              class="darkModeButton"
              @click="${this.toggleDarkMode}"
              ><md-icon>dark_mode</md-icon></md-outlined-icon-button
            >
          `
        : html`
            <md-outlined-icon-button
              class="darkModeButton"
              @click="${this.toggleDarkMode}"
              ><md-icon>light_mode</md-icon></md-outlined-icon-button
            >
          `}
    </div> `;
  }

  renderProblemStatement(title: string | undefined = undefined) {
    return html`
      ${!this.wide ? html` ${this.renderThemeToggle()} ` : nothing}
      <div class="title">${title? title : this.t('Problem Statement')}</div>
      <div class="problemStatement">
        <div class="problemStatementText">
          ${this.memory.problemStatement.description}
        </div>
      </div>
    `;
  }

  renderSubProblemList(
    subProblems: IEngineSubProblem[],
    title = this.t('Sub Problems')
  ) {
    return html`
      <div class="topContainer layout vertical center-center">
        ${this.renderProblemStatement()}

        <div class="title">${title}</div>
        <div
          class="subProblemContainer layout horizontal center-justified wrap"
        >
          ${subProblems.map((subProblem, index) => {
            const isLessProminent = index >= maxNumberOfSubProblems;
            return this.renderSubProblem(subProblem, isLessProminent, index);
          })}
        </div>
      </div>
    `;
  }

  getImgHeight(renderCloseButton: boolean) {
    if (this.wide) {
      return renderCloseButton ? 170 : 275;
    } else {
      return renderCloseButton ? 177 : 193;
    }
  }

  getImgWidth(renderCloseButton: boolean) {
    if (this.wide) {
      return renderCloseButton ? 298 : 481;
    } else {
      return renderCloseButton ? 310 : 350;
    }
  }

  renderSubProblemImageUrl(
    renderCloseButton: boolean,
    subProblem: IEngineSubProblem
  ) {
    return html`
      <div
        class="layout horizontal ${renderCloseButton
          ? ''
          : 'center-center'} subProblemImage"
      >
        <img
          loading="lazy"
          ?is-header="${renderCloseButton}"
          ?not-header="${!renderCloseButton}"
          class="subProblemImage"
          height="${this.getImgHeight(renderCloseButton)}"
          width="${this.getImgWidth(renderCloseButton)}"
          src="${this.fixImageUrlIfNeeded(subProblem.imageUrl)}"
          alt="${subProblem.title}"
        />
      </div>
    `;
  }

  renderSubProblem(
    subProblem: IEngineSubProblem,
    isLessProminent: boolean,
    index: number,
    renderCloseButton: boolean = false,
    renderMoreInfo = false
  ) {
    return html`
      <div
        ?not-header="${!renderCloseButton}"
        ?is-header="${renderCloseButton}"
        class="subProblem ${isLessProminent ? 'lessProminent' : ''}"
        @click="${() => {
          if (!renderCloseButton) this.setSubProblem(index);
        }}"
      >
        <div
          class="subProblemTitle layout ${renderCloseButton
            ? this.wide
              ? 'horizontal'
              : 'vertical'
            : 'vertical center-center'}"
        >
          ${(subProblem.imageUrl && !renderCloseButton) || !this.wide
            ? this.renderSubProblemImageUrl(renderCloseButton, subProblem)
            : nothing}
          <div
            ?is-header="${renderCloseButton}"
            ?not-header="${!renderCloseButton}"
            class="layout headerContainer ${renderCloseButton
              ? 'horizontal'
              : 'horizontal'}"
          >
            <div class="layout vertical">
              <div class="subProblemMainTitle" ?is-header="${renderCloseButton}">
                ${subProblem.title}
              </div>
              <div
                ?hidden="${!renderCloseButton}"
                ?is_header="${renderCloseButton}"
                class="subProblemStatement"
              >
                ${subProblem.description}
              </div>
              </div>
            ${subProblem.imageUrl && renderCloseButton && this.wide
              ? this.renderSubProblemImageUrl(renderCloseButton, subProblem)
              : nothing}

            <div
              ?is-header="${renderCloseButton}"
              class="navButton ${renderCloseButton ? 'horizontal flex' : ''}"
            >
              ${renderCloseButton
                ? html`
                    <md-standard-icon-button
                      aria-label="Previous"
                      .disabled="${this.activeSubProblemIndex === 0}"
                      @click="${(e: CustomEvent): void => {
                        e.stopPropagation();
                        if (this.activeSubProblemIndex > 0) {
                          this.activeSubProblemIndex -= 1;
                          this.setSubProblemColor(this.activeSubProblemIndex);
                          this.activeGroupIndex = null;
                          window.appGlobals.activity(
                            'Sub Problem - click previous'
                          );
                        }
                      }}"
                    >
                      <md-icon>navigate_before</md-icon>
                    </md-standard-icon-button>
                    <md-standard-icon-button
                      id="nextButton"
                      aria-label="Next"
                      .disabled="${this.activeSubProblemIndex ===
                      maxNumberOfSubProblems - 1}"
                      @click="${(e: CustomEvent): void => {
                        e.stopPropagation();
                        if (
                          !(this.$$('#nextButton') as MdStandardIconButton)
                            .disabled &&
                          this.activeSubProblemIndex <
                            maxNumberOfSubProblems - 1
                        ) {
                          this.activeSubProblemIndex += 1;
                          this.setSubProblemColor(this.activeSubProblemIndex);
                          this.activeGroupIndex = null;
                          window.appGlobals.activity(
                            'Sub Problem - click next'
                          );
                        }
                      }}"
                    >
                      <md-icon>navigate_next</md-icon>
                    </md-standard-icon-button>
                    <md-standard-icon-button
                      aria-label="Close"
                      @click="${(e: CustomEvent): void => {
                        e.stopPropagation();
                        this.activeSubProblemIndex = null;
                        this.fire('yp-theme-color', this.subProblemColors[7]);
                        this.exitSubProblemScreen();
                        this.activeGroupIndex = null;
                        window.appGlobals.activity('Sub Problem - exit');
                      }}"
                    >
                      <md-icon>close</md-icon>
                    </md-standard-icon-button>
                  `
                : nothing}
            </div>
          </div>
        </div>

        <div ?hidden="${renderCloseButton}" class="subProblemStatement">
          ${subProblem.description}
        </div>
        ${renderMoreInfo && !renderCloseButton
          ? html`
              <div class="subProblemStatement">
                ${subProblem.whyIsSubProblemImportant}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  renderSearchQueries(title: string, searchQueries: IEngineSearchQueries) {
    if (!searchQueries) {
      return nothing;
    }

    return html`
      <div
        class="title smallerTitle layout horizontal center-center"
        @click="${(e: Event) => {
          e.stopPropagation();
          this.toggleDisplayState(title);
        }}"
      >
        <div class="flex"></div>
        <div>${title}</div>
        <div class="flex"></div>
        <md-standard-icon-button
          ><md-icon>expand_more</md-icon></md-standard-icon-button
        >
      </div>
      <div class="searchResults layout vertical self-start">
        ${this.displayStates.get(title)
          ? Object.entries(searchQueries).map(([type, queries]) => {
              if (queries.length === 0) {
                return nothing;
              }

              return html`
                <div class="queryType">${type}</div>
                ${queries.map((query: string, index: number) => {
                  return html`
                    <div class="column">
                      <div
                        class="query ${index < this.maxTopSearchQueries
                          ? `queryUsed`
                          : ``}"
                      >
                        ${query}
                      </div>
                    </div>
                  `;
                })}
              `;
            })
          : nothing}
      </div>
    `;
  }

  getUrlInRightSize(url: string) {
    if (!this.wide && url.length > 30) {
      return `${url.substring(0, 30)}...`;
    } else {
      return url;
    }
  }

  renderSearchResults(title: string, searchResults: IEngineSearchResults) {
    if (!searchResults || !searchResults.pages) {
      return nothing;
    }

    return html`
      <div
        class="title smallerTitle layout horizontal"
        @click="${(e: Event) => {
          e.stopPropagation();
          this.toggleDisplayState(title);
        }}"
      >
        <div class="flex"></div>
        <div>${title}</div>
        <div class="flex"></div>
        <md-standard-icon-button
          ><md-icon>expand_more</md-icon></md-standard-icon-button
        >
      </div>
      <div class="searchResults">
        ${this.displayStates.get(title)
          ? Object.entries(searchResults.pages).map(([type, results]) => {
              if (results.length === 0) {
                return nothing;
              }

              return html`
                <div class="queryType">${type}</div>
                <div class="card">
                  ${results.map(
                    (result: IEngineSearchResultItem, index: number) => {
                      return html`
                        <div
                          class="searchItem ${this.isUsedSearch(result, index)}"
                        >
                          <div class="searchTitle">${result.title}</div>
                          <div class="url">
                            <a
                              target="blank"
                              href="${result.url || result.link}"
                              target="_blank"
                            >
                              ${this.getUrlInRightSize(result.url || result.link)}
                            </a>
                          </div>
                        </div>
                      `;
                    }
                  )}
                </div>
              `;
            })
          : nothing}
      </div>
    `;
  }
}
