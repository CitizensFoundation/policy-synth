import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { adminServerApi, LinkData, LinkCreateDTO, TopicData } from '../services/adminServerApi.js';

// Import Material Web Components as needed
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/dialog/dialog.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';

// Basic list of EU/EEA countries for the dropdown - can be expanded or fetched
const countryOptions = [
    { code: 'AT', name: 'Austria' }, { code: 'BE', name: 'Belgium' }, { code: 'BG', name: 'Bulgaria' },
    { code: 'HR', name: 'Croatia' }, { code: 'CY', name: 'Cyprus' }, { code: 'CZ', name: 'Czech Republic' },
    { code: 'DK', name: 'Denmark' }, { code: 'EE', name: 'Estonia' }, { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' }, { code: 'DE', name: 'Germany' }, { code: 'GR', name: 'Greece' },
    { code: 'HU', name: 'Hungary' }, { code: 'IE', name: 'Ireland' }, { code: 'IT', name: 'Italy' },
    { code: 'LV', name: 'Latvia' }, { code: 'LT', name: 'Lithuania' }, { code: 'LU', name: 'Luxembourg' },
    { code: 'MT', name: 'Malta' }, { code: 'NL', name: 'Netherlands' }, { code: 'PL', name: 'Poland' },
    { code: 'PT', name: 'Portugal' }, { code: 'RO', name: 'Romania' }, { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' }, { code: 'ES', name: 'Spain' }, { code: 'SE', name: 'Sweden' },
    { code: 'IS', name: 'Iceland' }, { code: 'LI', name: 'Liechtenstein' }, { code: 'NO', name: 'Norway' },
    { code: 'CH', name: 'Switzerland' }
  ].sort((a,b) => a.name.localeCompare(b.name));

@customElement('link-manager')
export class LinkManager extends LitElement {
  @state() private items: LinkData[] = [];
  @state() private loading = false;
  @state() private error: string | null = null;
  @state() private topics: TopicData[] = [];
  @state() private selectedTopicFilter: number | 'all' = 'all';
  @state() private selectedCountryFilter: string | 'all' = 'all';

  // Dialog state
  @state() private dialogOpen = false;
  @state() private currentEditItem: LinkData | null = null;
  @state() private newLinkTopicId: number | undefined;
  @state() private newLinkCountryCode = '';
  @state() private newLinkUrl = '';
  @state() private newLinkTitle = '';

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchTopics();
    await this.fetchItems();
  }

  async fetchTopics() {
    try {
      this.topics = await adminServerApi.getTopics();
      if (this.topics.length > 0 && this.selectedTopicFilter === 'all') {
        // Optionally default to first topic or keep 'all'
      }
    } catch (e: any) {
      this.error = e.message;
    }
  }

  async fetchItems() {
    this.loading = true;
    this.error = null;
    try {
      const topicId = this.selectedTopicFilter === 'all' ? undefined : this.selectedTopicFilter;
      const countryCode = this.selectedCountryFilter === 'all' ? undefined : this.selectedCountryFilter;
      this.items = await adminServerApi.listLinks(topicId, countryCode);
    } catch (e: any) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  }

  handleTopicFilterChange(e: any) {
    this.selectedTopicFilter = e.target.value === 'all' ? 'all' : Number(e.target.value);
    this.fetchItems();
  }

  handleCountryFilterChange(e: any) {
    this.selectedCountryFilter = e.target.value;
    this.fetchItems();
  }

  openDialog(item: LinkData | null = null) {
    this.currentEditItem = item;
    if (item) {
      this.newLinkTopicId = item.topicId;
      this.newLinkCountryCode = item.countryCode;
      this.newLinkUrl = item.url;
      this.newLinkTitle = item.title || '';
    } else {
      this.newLinkTopicId = this.topics.length > 0 ? this.topics[0].id : undefined;
      this.newLinkCountryCode = countryOptions.length > 0 ? countryOptions[0].code : '';
      this.newLinkUrl = '';
      this.newLinkTitle = '';
    }
    this.dialogOpen = true;
  }

  closeDialog() {
    this.dialogOpen = false;
    this.currentEditItem = null;
  }

  async saveLinkItem() {
    if (!this.newLinkTopicId || !this.newLinkCountryCode || !this.newLinkUrl) {
      alert('Topic, Country, and URL are required.');
      return;
    }
    // Basic URL validation (can be improved)
    if (!/^https?:\/\/.+/.test(this.newLinkUrl)) {
        alert('Please enter a valid URL (starting with http:// or https://).');
        return;
    }

    const dto: LinkCreateDTO = {
      topicId: this.newLinkTopicId,
      countryCode: this.newLinkCountryCode,
      url: this.newLinkUrl,
      title: this.newLinkTitle,
    };
    this.loading = true;
    try {
      if (this.currentEditItem) {
        await adminServerApi.updateLink(this.currentEditItem.id, dto);
      } else {
        await adminServerApi.createLink(dto);
      }
      this.fetchItems();
      this.closeDialog();
    } catch (e: any) {
      this.error = e.message;
      alert(`Error saving link: ${e.message}`);
    } finally {
      this.loading = false;
    }
  }

  async deleteItem(id: number) {
    if (!confirm('Are you sure you want to delete this link?')) return;
    this.loading = true;
    try {
      await adminServerApi.deleteLink(id);
      this.fetchItems();
    } catch (e: any) {
      this.error = e.message;
      alert(`Error deleting link: ${e.message}`);
    } finally {
      this.loading = false;
    }
  }

  static override styles = css`
    /* Basic styles, similar to qa-manager */
    :host {
      display: block;
      padding: 16px;
    }
    .top-bar {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    th {
      background-color: var(--md-sys-color-surface-container-low);
    }
     .actions md-icon-button {
      margin-right: 8px;
    }
    md-dialog {
        min-width: 400px;
        max-width: 600px;
    }
    .dialog-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 16px;
    }
  `;

  render() {
    return html`
      <div class="top-bar">
        <md-outlined-button @click=${() => this.openDialog()}>Add Link</md-outlined-button>
        <md-outlined-select label="Filter by Topic" @change=${this.handleTopicFilterChange} .value=${this.selectedTopicFilter.toString()}>
            <md-select-option value="all">All Topics</md-select-option>
            ${this.topics.map(topic => html`<md-select-option value="${topic.id}">${topic.title}</md-select-option>`)}
        </md-outlined-select>
        <md-outlined-select label="Filter by Country" @change=${this.handleCountryFilterChange} .value=${this.selectedCountryFilter}>
            <md-select-option value="all">All Countries</md-select-option>
            ${countryOptions.map(country => html`<md-select-option value="${country.code}">${country.name}</md-select-option>`)}
        </md-outlined-select>
      </div>

      ${this.loading ? html`<md-circular-progress indeterminate></md-circular-progress>` : ''}
      ${this.error ? html`<p style="color:red;">Error: ${this.error}</p>` : ''}

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>URL</th>
            <th>Country</th>
            <th>Topic</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.items.map(item => html`
            <tr>
              <td title="${item.title}">${item.title || 'N/A'}</td>
              <td><a href="${item.url}" target="_blank">${item.url}</a></td>
              <td>${countryOptions.find(c => c.code === item.countryCode)?.name || item.countryCode}</td>
              <td>${item.Topic?.title || 'N/A'}</td>
              <td class="actions">
                <md-icon-button @click=${() => this.openDialog(item)}><md-icon>edit</md-icon></md-icon-button>
                <md-icon-button @click=${() => this.deleteItem(item.id)}><md-icon>delete</md-icon></md-icon-button>
              </td>
            </tr>
          `)}
        </tbody>
      </table>

      <md-dialog ?open=${this.dialogOpen} @closed=${this.closeDialog}>
        <div slot="headline">${this.currentEditItem ? 'Edit' : 'Add'} Country Link</div>
        <div slot="content" class="dialog-content">
          <md-outlined-select label="Topic" required .value=${this.newLinkTopicId?.toString()} @change=${(e: any) => this.newLinkTopicId = Number(e.target.value)}>
            ${this.topics.map(topic => html`<md-select-option value="${topic.id}">${topic.title}</md-select-option>`)}
          </md-outlined-select>
          <md-outlined-select label="Country" required .value=${this.newLinkCountryCode} @change=${(e: any) => this.newLinkCountryCode = e.target.value}>
            ${countryOptions.map(country => html`<md-select-option value="${country.code}">${country.name}</md-select-option>`)}
          </md-outlined-select>
          <md-outlined-text-field label="URL" required .value=${this.newLinkUrl} @input=${(e: any) => this.newLinkUrl = e.target.value}></md-outlined-text-field>
          <md-outlined-text-field label="Title (Optional)" .value=${this.newLinkTitle} @input=${(e: any) => this.newLinkTitle = e.target.value}></md-outlined-text-field>
        </div>
        <div slot="actions">
          <md-outlined-button @click=${this.closeDialog}>Cancel</md-outlined-button>
          <md-filled-button @click=${this.saveLinkItem} ?disabled=${this.loading}>Save</md-filled-button>
        </div>
      </md-dialog>
    `;
  }
}