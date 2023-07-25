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

//TDOO: Share from db config
const maxTopSearchQueries = 2;
const maxUsedSearchResults = 4;
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

  @state()
  displayStates = new Map();
  toggleDisplayState(title: string) {
    const currentState = this.displayStates.get(title);
    this.displayStates.set(title, !currentState);
    this.requestUpdate();
  }

  toggleScores() {
    const checkbox = this.$$('#showScores') as Checkbox;
    this.showEloRatings = checkbox.checked;
    window.appGlobals.activity(
      `View memory - toggle scores ${this.showEloRatings ? 'on' : 'off'}`
    );
  }

  static get styles() {
    return [
      super.styles,
      css`
        .topContainer {
          margin-right: 32px;
        }

        .prominentSubProblem {
          cursor: pointer;
        }

        .problemStatement {
          font-size: 22px;
          padding: 16px;
          margin: 16px 0;
          border-radius: 16px;
          line-height: 1.4;
          background-color: var(--md-sys-color-tertiary);
          color: var(--md-sys-color-on-tertiary);
          max-width: 960px;
        }

        .problemStatementText {
          padding: 16px;
        }

        .subProblemStatement,
        .subProblemTitle {
          font-size: 22px;
          padding: 8px;
          margin: 8px 0;
          border-radius: 12px;
          line-height: 1.4;
          max-width: 960px;
        }

        .subProblemTitle {
          color: var(--md-sys-color-primary);
          font-weight: bold;
          letter-spacing: 0.12em;
          padding-bottom: 0;
        }

        .subProblem {
          opacity: 1;
          border-radius: 12px;
          padding: 16px;
          margin: 16px 0;
          background-color: var(--md-sys-color-on-primary);
          color: var(--md-sys-color-primary);
          max-width: 960px;
        }

        .title {
          font-size: 28px;
          margin-bottom: 8px;
          color: var(--md-sys-color-secondary);
          background-color: var(--md-sys-color-on-secondary);
          text-align: center;
          padding: 16px;
          border-radius: 16px;
          max-width: 960px;
          margin-top: 24px;
          width: 100%;
        }

        .smallerTitle {
          font-size: 22px;
        }

        .subProblem.lessProminent {
          opacity: 0.75;
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

        @media (min-width: 960px) {
          .queryType {
            font-size: 20px;
            margin-top: 20px;
            margin-bottom: 10px;
          }

          .query {
            font-size: 18px;
            margin-bottom: 6px;
          }
        }

        @media (max-width: 960px) {
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
        }
      `,
    ];
  }

  isUsedSearch(result: IEngineSearchResultItem, index: number) {
    if (
      index < maxUsedSearchResults ||
      (result.position && result.position <= maxUsedSearchResults) ||
      (result.originalPosition &&
        result.originalPosition <= maxUsedSearchResults)
    ) {
      return 'selectedSearchItem';
    } else {
      return ``;
    }
  }

  closeSubProblem(event: CustomEvent) {
    this.activeSubProblemIndex = null;
    event.stopPropagation();
    window.scrollTo(0, 0);
  }

  setSubProblem(index: number) {
    this.activeSubProblemIndex = index;
    window.scrollTo(0, 0);
  }

  renderProblemStatement() {
    return html`
      <div class="title">${this.t('Problem Statement')}</div>
      <div class="problemStatement">
        <div class="problemStatementText">
          ${this.memory.problemStatement.description}
        </div>
      </div>
    `;
  }

  renderSubProblemList(subProblems: IEngineSubProblem[], title = this.t('Sub Problems')) {
    return html`
      <div class="topContainer layout vertical center-center">
        ${this.renderProblemStatement()}

        <div class="title">${title}</div>
        ${subProblems.map((subProblem, index) => {
          const isLessProminent = index >= maxNumberOfSubProblems;
          return this.renderSubProblem(subProblem, isLessProminent, index);
        })}
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
        class="subProblem ${isLessProminent
          ? 'lessProminent'
          : 'prominentSubProblem'}"
        @click="${() => this.setSubProblem(index)}"
      >
        <div class="subProblemTitle layout horizontal ${renderCloseButton ? '' : 'center-center'}">
          <div>${subProblem.title}</div>
          <div class="${renderCloseButton ? 'flex' : ''}"></div>
          ${renderCloseButton
            ? html`
                <md-standard-icon-button
                  aria-label="Close"
                  @click="${this.closeSubProblem}"
                >
                  <md-icon>close</md-icon>
                </md-standard-icon-button>
              `
            : nothing}
        </div>
        <div class="subProblemStatement">${subProblem.description}</div>
        ${renderMoreInfo
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
                        class="query ${index < maxTopSearchQueries
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
                            ${result.url || result.link}
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
