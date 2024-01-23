import { PolicySynthWebApp } from '@policysynth/webapp';
import { html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { PsRouter } from '@policysynth/webapp/cmp/base/router/router.js';

import '@material/web/slider/slider.js';
import '@material/web/iconbutton/icon-button.js';

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
          font-size: 14px;
          padding-left: 16px;
          margin-bottom: 8px;
        }

        .sliderScopes {
          margin-top: 32px;
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
            <md-icon-button @click="${this.reset}"
              ><md-icon>restart_alt</md-icon></md-icon-button
            >${this.renderThemeToggle()} ${this.renderScopeSliders()}
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
      formattedTime = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      formattedTime = `${minutes}m ${seconds}s`;
    } else {
      formattedTime = `${seconds}s`;
    }

    return formattedTime;
  }

  renderScopeSliders() {
    return html`
      <div class="layout horizontal sliderScopes">
        <div class="layout vertical">
          <md-slider
            min="5"
            max="50"
            value="10"
            labeled
            .valueLabel="${this.numberOfSelectQueries.toString()}"
            @change="${this.updateNumberOfQueries}"
          ></md-slider>
          <div class="sliderTitle">
            ${this.t('Number of search queries')} (${this.estimatedTotalTime})
          </div>
        </div>
        <div class="layout vertical">
          <md-slider
            min="10"
            max="100"
            value="25"
            labeled
            .valueLabel="${this.percentOfTopQueriesToSearch * 100}%"
            @change="${this.updatePercentOfQueries}"
          ></md-slider>
          <div class="sliderTitle">
            ${this.t('Use % of top search queries')}
            (${this.totalSearchResults})
          </div>
        </div>
        <div class="layout vertical">
          <md-slider
            min="10"
            max="100"
            labeled
            value="25"
            .valueLabel="${this.percentOfTopResultsToScan * 100}%"
            @change="${this.updatePercentOfResults}"
          ></md-slider>
          <div class="sliderTitle">
            ${this.t('Use % of top search results')} (${this.totalPagesToGet})
          </div>
        </div>
      </div>
    `;
  }
}
