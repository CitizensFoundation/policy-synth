import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { adminServerApi, TopicData } from '../services/adminServerApi.js';

// Import Material Web Components
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/dialog/dialog.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/icon/icon.js';


// Basic list of languages - can be expanded or fetched if needed
const languageOptions = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }, { code: 'it', name: 'Italian' }, { code: 'pt', name: 'Portuguese' }
  // Add other relevant languages
].sort((a,b) => a.name.localeCompare(b.name));


@customElement('topic-manager')
export class TopicManager extends LitElement {
  @state() private items: TopicData[] = [];
  @state() private loading = false;
  @state() private error: string | null = null;

  // Dialog state
  @state() private dialogOpen = false;
  @state() private currentEditItem: TopicData | null = null;
  @state() private newSlug = '';
  @state() private newTitle = '';
  @state() private newDescription = '';
  @state() private newLanguage = 'en'; // Default language


  async connectedCallback() {
    super.connectedCallback();
    await this.fetchItems();
  }

  async fetchItems() {
    this.loading = true;
    this.error = null;
    try {
      // Currently fetches all topics, add filtering later if needed
      this.items = await adminServerApi.getTopics();
      // Sort topics by title by default
      this.items.sort((a, b) => a.title.localeCompare(b.title));
    } catch (e: any) {
      this.error = e.message;
      console.error("Error fetching topics:", e);
    } finally {
      this.loading = false;
    }
  }

  openDialog(item: TopicData | null = null) {
    this.currentEditItem = item;
    if (item) {
      this.newTitle = item.title;
      this.newSlug = item.slug;
      this.newDescription = item.description || '';
      this.newLanguage = item.language || 'en';
    } else {
      // Reset for new item
      this.newTitle = '';
      this.newSlug = ''; // Will be auto-generated or user-provided
      this.newDescription = '';
      this.newLanguage = 'en'; // Default
    }
    this.dialogOpen = true;
  }

  closeDialog() {
    this.dialogOpen = false;
    this.currentEditItem = null;
    // Reset fields explicitly
    this.newTitle = '';
    this.newSlug = '';
    this.newDescription = '';
    this.newLanguage = 'en';
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word characters (excluding spaces and hyphens)
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }


  handleTitleInput(e: any) {
    this.newTitle = e.target.value;
    // Auto-generate slug only if it's a new item or the slug field is empty
    if (!this.currentEditItem || !this.newSlug) {
      this.newSlug = this.generateSlug(this.newTitle);
    }
  }


  async saveTopicItem() {
    if (!this.newTitle || !this.newLanguage) {
      alert('Title and Language are required.');
      return;
    }

    // If slug is empty after edits, generate from title
    const finalSlug = this.newSlug || this.generateSlug(this.newTitle);
    if (!finalSlug) {
        alert('Slug could not be generated and is required.');
        return;
    }


    const dto: Omit<TopicData, 'id'> & { description?: string } = {
      title: this.newTitle,
      slug: finalSlug, // Use the final slug
      description: this.newDescription,
      language: this.newLanguage,
    };

    this.loading = true;
    try {
      if (this.currentEditItem) {
        await adminServerApi.updateTopic(this.currentEditItem.id, dto);
      } else {
        await adminServerApi.createTopic(dto);
      }
      await this.fetchItems(); // Refresh list
      this.closeDialog();
    } catch (e: any) {
      this.error = `Error saving topic: ${e.message}`;
      alert(this.error); // Simple alert for now
      console.error("Error saving topic:", e);
    } finally {
      this.loading = false;
    }
  }


  async deleteItem(id: number) {
    if (!confirm('Are you sure you want to delete this topic and all associated Q&A pairs and Links? This cannot be undone.')) return;
    this.loading = true;
    try {
      await adminServerApi.deleteTopic(id);
      await this.fetchItems(); // Refresh list
    } catch (e: any) {
      this.error = `Error deleting topic: ${e.message}`;
      alert(this.error);
      console.error("Error deleting topic:", e);
    } finally {
      this.loading = false;
    }
  }


  static override styles = css`
    :host {
      display: block;
      padding: 16px;
      height: 100%;
      box-sizing: border-box;
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
      max-width: 250px; /* Prevent wide columns */
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    th {
      background-color: var(--md-sys-color-surface-container-low);
      font-weight: bold;
    }
    td.description {
        max-width: 400px; /* Allow more space for description */
        white-space: normal; /* Allow wrapping */
    }
     .actions md-icon-button {
      /* Reduced margin for potentially smaller icon buttons if needed */
      margin-right: 0px;
      margin-left: 0px;
    }
    .actions {
        white-space: nowrap; /* Keep buttons on one line */
        width: 1%; /* Prevent actions column from taking too much space */
    }
    md-dialog {
        min-width: 500px; /* Wider dialog */
        max-width: 700px;
    }
    .dialog-content {
        display: flex;
        flex-direction: column;
        gap: 20px; /* More spacing */
        padding-top: 16px;
    }
    md-outlined-text-field[type="textarea"] {
       /* --md-outlined-text-field-container-shape: 8px; */
       height: 120px; /* Explicit height for textarea container */
    }
    md-outlined-text-field[type="textarea"]::part(input) {
        height: 100px; /* Adjust internal input height */
    }

    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    }
  `;

  render() {
    return html`
      <div class="top-bar">
        <h2>Topic Management</h2>
        <md-outlined-button @click=${() => this.openDialog()}>
            Add Topic
            <md-icon slot="icon">add</md-icon>
        </md-outlined-button>
        <!-- Add language filter select here later if needed -->
      </div>

      ${this.loading && !this.dialogOpen ? html`<div class="loading-container"><md-circular-progress indeterminate></md-circular-progress></div>` : ''}
      ${this.error ? html`<p style="color:red;">Error: ${this.error}</p>` : ''}

      ${!this.loading || this.items.length > 0 ? html`
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Slug</th>
            <th>Description</th>
            <th>Language</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.items.map(item => html`
            <tr>
              <td title="${item.title}">${item.title}</td>
              <td title="${item.slug}">${item.slug}</td>
              <td class="description" title="${item.description}">${item.description || '-'}</td>
              <td>${languageOptions.find(l => l.code === item.language)?.name || item.language}</td>
              <td class="actions">
                <md-icon-button title="Edit Topic" @click=${() => this.openDialog(item)}><md-icon>edit</md-icon></md-icon-button>
                <md-icon-button title="Delete Topic" @click=${() => this.deleteItem(item.id)}><md-icon>delete</md-icon></md-icon-button>
              </td>
            </tr>
          `)}
        </tbody>
      </table>
      ` : (!this.loading ? html`<p>No topics found.</p>` : '')}


      <md-dialog ?open=${this.dialogOpen} @closed=${this.closeDialog}>
        <div slot="headline">${this.currentEditItem ? 'Edit' : 'Add'} Topic</div>
        <div slot="content" class="dialog-content" id="topicDialogForm">
            <md-outlined-text-field
                label="Title"
                required
                .value=${this.newTitle}
                @input=${this.handleTitleInput}>
            </md-outlined-text-field>
            <md-outlined-text-field
                label="Slug (auto-generated, can be edited)"
                .value=${this.newSlug}
                 @input=${(e: any) => this.newSlug = e.target.value}>
                 <!-- Add pattern validation? -->
            </md-outlined-text-field>
            <md-outlined-text-field
                type="textarea"
                label="Description (Optional)"
                rows="3"
                .value=${this.newDescription}
                @input=${(e: any) => this.newDescription = e.target.value}>
            </md-outlined-text-field>
            <md-outlined-select
                label="Language"
                required
                .value=${this.newLanguage}
                @change=${(e: any) => this.newLanguage = e.target.value}>
                ${languageOptions.map(lang => html`<md-select-option value="${lang.code}">${lang.name}</md-select-option>`)}
            </md-outlined-select>
        </div>
        <div slot="actions">
          <md-outlined-button @click=${this.closeDialog}>Cancel</md-outlined-button>
          <md-filled-button @click=${this.saveTopicItem} ?disabled=${this.loading}>
             ${this.loading ? html`<md-circular-progress indeterminate size="small"></md-circular-progress>` : 'Save'}
          </md-filled-button>
        </div>
      </md-dialog>
    `;
  }
}