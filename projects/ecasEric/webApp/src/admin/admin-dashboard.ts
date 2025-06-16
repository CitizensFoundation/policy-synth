import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { authStoreInstance } from '../services/authStore.js';

// Import Admin components (placeholders for now)
import './admin-login.js'; // Needed for redirect logic
import './topic-manager.js';
import './qa-manager.js';
import './link-manager.js';
import './review-manager.js';
import './chat-session-manager.js';

// Import Material Web Components
import '@material/web/labs/navigationbar/navigation-bar.js';
import '@material/web/labs/navigationtab/navigation-tab.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/button/text-button.js';

@customElement('admin-dashboard')
export class AdminDashboard extends LitElement { // Consider connect(store)(LitElement) if using Redux

  @state() private selectedView = 'topics';
  @state() private authStateCounter = authStoreInstance.updateCounter;

  // Observe changes in the auth store
  private authStoreSubscription = () => {
    this.authStateCounter = authStoreInstance.updateCounter;
  }

  connectedCallback() {
    super.connectedCallback();
    // A simple way to react to store changes without a full library
    // A more robust solution might use events or a dedicated state management lib
    window.addEventListener('auth-state-changed', this.authStoreSubscription);
    authStoreInstance.notifyChanges(); // Initial check
  }

  disconnectedCallback() {
    window.removeEventListener('auth-state-changed', this.authStoreSubscription);
    super.disconnectedCallback();
  }

  static override styles = css`
    :host {
      display: flex;
      height: 100vh;
      width: 100vw;
      background-color: var(--md-sys-color-surface);
    }
    .sidebar {
      width: 240px;
      background-color: var(--md-sys-color-surface-container);
      padding: 20px;
      display: flex;
      flex-direction: column;
    }
    .main-content {
      flex-grow: 1;
      padding: 20px;
      overflow-y: auto;
    }
    md-navigation-tab {
        margin-bottom: 8px;
         --md-navigation-tab-label-text-font: var(--md-sys-typescale-body-medium-font);
    }
    .spacer {
        flex-grow: 1;
    }
    .logout-button {
        margin-top: 20px;
    }
     md-icon {
        margin-right: 16px;
     }
  `;

  renderSidebar() {
    return html`
      <div class="sidebar">
        <h2>ECAS Admin Panel</h2>
        <md-navigation-tab
          label="Topics"
          ?active=${this.selectedView === 'topics'}
          @click=${() => (this.selectedView = 'topics')}>
             <md-icon slot="active-icon">category</md-icon>
             <md-icon slot="inactive-icon">category</md-icon>
          </md-navigation-tab>
        <md-navigation-tab
          label="Q&A Pairs"
          ?active=${this.selectedView === 'qa'}
          @click=${() => (this.selectedView = 'qa')}>
             <md-icon slot="active-icon">quiz</md-icon>
             <md-icon slot="inactive-icon">quiz</md-icon>
          </md-navigation-tab>
        <md-navigation-tab
          label="Country Links"
          ?active=${this.selectedView === 'links'}
          @click=${() => (this.selectedView = 'links')}>
             <md-icon slot="active-icon">link</md-icon>
             <md-icon slot="inactive-icon">link</md-icon>
          </md-navigation-tab>
        <md-navigation-tab
          label="Reviews"
          ?active=${this.selectedView === 'reviews'}
          @click=${() => (this.selectedView = 'reviews')}>
             <md-icon slot="active-icon">rate_review</md-icon>
             <md-icon slot="inactive-icon">rate_review</md-icon>
        </md-navigation-tab>
        <md-navigation-tab
          label="Chat Sessions"
          ?active=${this.selectedView === 'chats'}
          @click=${() => (this.selectedView = 'chats')}>
             <md-icon slot="active-icon">forum</md-icon>
             <md-icon slot="inactive-icon">forum</md-icon>
        </md-navigation-tab>
        <div class="spacer"></div>
        <md-text-button class="logout-button" @click=${this.handleLogout}>
              Logout
              <md-icon slot="icon">logout</md-icon>
            </md-text-button>
      </div>
    `;
  }

  renderContent() {
    switch (this.selectedView) {
      case 'topics':
        return html`<topic-manager></topic-manager>`;
      case 'qa':
        return html`<qa-manager></qa-manager>`;
      case 'links':
        return html`<link-manager></link-manager>`;
      case 'reviews':
        return html`<review-manager></review-manager>`;
      case 'chats':
        return html`<chat-session-manager></chat-session-manager>`;
      default:
        return html`<div>Select a section</div>`;
    }
  }

  handleLogout() {
      authStoreInstance.logout();
      // Redirect to login after logout
      window.location.href = '/admin/login';
  }

  override render() {
    // Use the authStateCounter to trigger re-renders when auth changes
    this.authStateCounter;

    const isLoggedIn = false;

    if (!authStoreInstance.isLoggedIn()) {
      // This component shouldn't be rendered if not logged in,
      // but as a fallback, redirect.
      // The router in eric-app.ts should handle the initial guard.
       window.location.href = '/admin/login';
      return html`<div>Redirecting to login...</div>`;
    }

    return html`
      ${this.renderSidebar()}
      <div class="main-content">
        ${this.renderContent()}
      </div>
    `;
  }
}