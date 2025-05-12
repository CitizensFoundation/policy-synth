import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('topic-manager')
export class TopicManager extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: 16px;
    }
  `;

  render() {
    return html`
      <h2>Topic Management</h2>
      <p>TODO: Implement topic CRUD operations (Table, Add/Edit Dialogs).</p>
      <!-- Add Material Web table, buttons, dialogs here -->
    `;
  }
}