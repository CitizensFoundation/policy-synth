import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { authStoreInstance } from '../services/authStore.js';
import { adminServerApi } from '../services/adminServerApi.js'; // Use the singleton

import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import '@material/web/progress/circular-progress.js';

@customElement('admin-login')
export class AdminLogin extends LitElement {
  @state() private email = '';
  @state() private password = '';
  @state() private errorMessage = '';
  @state() private loading = false;

  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      width: 100vw;
      background-color: var(--md-sys-color-surface);
    }
    .login-card {
      padding: 40px;
      border-radius: 12px;
      background-color: var(--md-sys-color-surface-container-high);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
      text-align: center;
    }
    h1 {
      color: #111111;
      margin-bottom: 24px;
    }
    md-outlined-text-field {
      width: 100%;
      margin-bottom: 16px;
    }
    md-filled-button {
      width: 100%;
      margin-top: 16px;
    }
    .error {
      color: var(--md-sys-color-error);
      margin-top: 16px;
      min-height: 1.2em; /* Reserve space */
    }
    md-circular-progress {
      margin-top: 16px;
    }
  `;

  async handleLogin() {
    this.errorMessage = '';
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }
    this.loading = true;
    try {
      const loginResponse = await adminServerApi.login(this.email, this.password);
      authStoreInstance.setLoginInfo(loginResponse.token);

      // Redirect to admin dashboard on successful login
      // Use PsRouter or window navigation
      // Assuming PsRouter is used in the main app, dispatch an event or use a callback
       window.location.href = '/admin'; // Simple redirect for now

    } catch (error: any) {
      console.error('Login failed:', error);
      this.errorMessage = error.message || 'Login failed. Please check your credentials.';
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="login-card">
        <h1>ECAS Admin Login</h1>
        <md-outlined-text-field
          label="Email"
          type="email"
          .value=${this.email}
          @input=${(e: any) => (this.email = e.target.value)}
          @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this.handleLogin(); }}
        ></md-outlined-text-field>
        <md-outlined-text-field
          label="Password"
          type="password"
          .value=${this.password}
          @input=${(e: any) => (this.password = e.target.value)}
           @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this.handleLogin(); }}
        ></md-outlined-text-field>

        ${this.loading
          ? html`<md-circular-progress indeterminate></md-circular-progress>`
          : html`
              <md-filled-button @click=${this.handleLogin}>
                Login
              </md-filled-button>
            `}

        <div class="error">${this.errorMessage}</div>
      </div>
    `;
  }
}