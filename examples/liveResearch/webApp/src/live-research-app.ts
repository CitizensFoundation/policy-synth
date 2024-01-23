import { PolicySynthWebApp } from '@policysynth/webapp';
import { html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { PsRouter } from '@policysynth/webapp/cmp/base/router/router.js';

import '@material/web/slider/slider.js';
import '@material/web/iconbutton/outlined-icon-button.js';

import './live-research-chatbot.js';
import { LiveResearchChatBot } from './live-research-chatbot.js';

@customElement('live-research-app')
export class LiveResearchApp extends PolicySynthWebApp {
  themeColor = '#88f940';
  localStorageThemeColorKey = 'md3-live-research-theme-color3';

  @property({ type: Number })
  numberOfSelectQueries = 5;

  @property({ type: Number })
  percentOfTopQueriesToSearch = 0.25;

  @property({ type: Number })
  percentOfTopResultsToScan = 0.25;

  estimatedSecondsPerPage = 75;

  static override get styles() {
    return [
      ...super.styles,
      css`
        simple-chat-bot {
          width: 100vw;
          height: 100%;
        }

        .themeToggle {
          margin-bottom: 12px;
        }

        md-slider {
          width: 200px;
        }

        .sliderTitle {
          font-size: 12px;
          padding-left: 16px;
          margin-bottom: 8px;
        }

        .sliderScopes, .estTime {
          font-size: 12px;
          color: var(--md-sys-color-on-surface-variant);
        }

        .estTime {
          margin-top: 16px;
          margin-bottom: 8px;
        }
      `,
    ];
  }

  override router: PsRouter = new PsRouter(this, [
    {
      path: '/*',
      render: () => {
        return html` <div class="layout vertical center-center">
          <div class="layout horizontal center-center themeToggle">
            <md-outlined-icon-button @click="${this.reset}"
              ><md-icon>restart_alt</md-icon></md-outlined-icon-button
            >${this.renderThemeToggle(true)} ${this.renderScopeSliders()}
          </div>
          <live-research-chat-bot
            .numberOfSelectQueries=${this.numberOfSelectQueries}
            .percentOfTopQueriesToSearch=${this.percentOfTopQueriesToSearch}
            .percentOfTopResultsToScan=${this.percentOfTopResultsToScan}
          ></live-research-chat-bot>
        </div>`;
      },
    },
  ]);

  reset() {
    (this.$$('live-research-chat-bot') as LiveResearchChatBot).reset();
  }

  updateNumberOfQueries(event: any) {
    this.numberOfSelectQueries = event.currentTarget.value;
  }

  updatePercentOfQueries(event: any) {
    this.percentOfTopQueriesToSearch = event.currentTarget.value / 100;
  }

  updatePercentOfResults(event: any) {
    this.percentOfTopResultsToScan = event.currentTarget.value / 100;
  }

  get totalSearchResults() {
    return Math.round(
      this.numberOfSelectQueries * 10 * this.percentOfTopQueriesToSearch
    );
  }

  get totalPagesToGet() {
    return Math.round(this.totalSearchResults * this.percentOfTopResultsToScan);
  }

  get estimatedTotalTime() {
    const totalSeconds = Math.round(
      this.totalPagesToGet * this.estimatedSecondsPerPage
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let formattedTime;

    if (hours > 0) {
      formattedTime = `${hours} hours ${minutes} minutes ${seconds} seconds`;
    } else if (minutes > 0) {
      formattedTime = `${minutes} minutes ${seconds} seconds`;
    } else {
      formattedTime = `${seconds} seconds`;
    }

    return formattedTime;
  }

  renderScopeSliders() {
    return html`
      <div class="layout vertical">
        <div class="layout horizontal center-center estTime">
          ${this.t('Estimated time to run')}: ${this.estimatedTotalTime}
        </div>
        <div class="layout horizontal sliderScopes">
          <div class="layout vertical">
            <md-slider
              min="5"
              max="50"
              value="5"
              labeled
              .valueLabel="${this.numberOfSelectQueries.toString()}"
              @change="${this.updateNumberOfQueries}"
            ></md-slider>
            <div class="sliderTitle">${this.t('Number of search queries')}</div>
          </div>
          <div class="layout vertical">
            <md-slider
              min="10"
              max="100"
              value="25"
              labeled
              .valueLabel="${Math.round(
                this.percentOfTopQueriesToSearch * 100
              )}%"
              @change="${this.updatePercentOfQueries}"
            ></md-slider>
            <div class="sliderTitle">
              ${this.t('Use % of top search queries')}
            </div>
          </div>
          <div class="layout vertical">
            <md-slider
              min="10"
              max="100"
              labeled
              value="25"
              .valueLabel="${Math.round(this.percentOfTopResultsToScan * 100)}%"
              @change="${this.updatePercentOfResults}"
            ></md-slider>
            <div class="sliderTitle">
              ${this.t('Use % of top search results')}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
