import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';

@customElement('cookie-consent')
export class CookieConsent extends LitElement {
  @state()
  private visible = false;

  connectedCallback() {
    super.connectedCallback();
    const consent = localStorage.getItem('ga_consent');
    this.visible = consent === null;
    this.hidden = !this.visible;
  }

  private updateAnalytics(granted: boolean) {
    const gaId = 'G-Q262VRGMB3';
    (window as any)['ga-disable-' + gaId] = !granted;
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
      });
    }
  }

  private accept() {
    localStorage.setItem('ga_consent', 'granted');
    this.updateAnalytics(true);
    this.visible = false;
    this.hidden = true;
  }

  private deny() {
    localStorage.setItem('ga_consent', 'denied');
    this.updateAnalytics(false);
    this.visible = false;
    this.hidden = true;
  }

  static styles = css`
    :host {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      background-color: var(--md-sys-color-surface, #ffffff);
      color: var(--md-sys-color-on-surface, #000000);
      box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.2);
      font-size: 14px;
    }

    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    a {
      color: inherit;
      text-decoration: underline;
    }

    @media (min-width: 600px) {
      :host {
        flex-direction: row;
        align-items: center;
      }
      .text {
        flex: 1;
      }
    }
  `;

  render() {
    if (!this.visible) {
      return nothing;
    }
    return html`<div class="cookie-consent"></div>
      <span class="text"
        >To provide the best experiences, we use technologies like cookies to
        store and/or access device information. Giving your consent allows us to
        process data such as browsing behaviour or unique IDs on this site. Not
        consenting or withdrawing consent may affect certain features and
        functions.</span
      >
      <div class="actions">
        <md-filled-button @click=${this.accept}>Accept</md-filled-button>
        <md-text-button @click=${this.deny}>Deny</md-text-button>
        <a href="https://ecas.org/ecas-cookies-policy/" target="_blank">Cookie Policy</a>
        <a href="https://ecas.org/privacy-policy/" target="_blank">Privacy Policy</a>
      </div>
    `;
  }
}
