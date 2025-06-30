import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { adminServerApi, QAPairData, QACreateDTO, QAPairQuestionTypeFE, TopicData } from '../services/adminServerApi.js';

import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/dialog/dialog.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/elevation/elevation.js';
import '@material/web/checkbox/checkbox.js';

@customElement('qa-manager')
export class QaManager extends LitElement {
  @state() private items: QAPairData[] = [];
  @state() private loading = false;
  @state() private error: string | null = null;
  @state() private topics: TopicData[] = [];
  @state() private selectedTopicFilter: number | 'all' = 'all';

  // Dialog state
  @state() private dialogOpen = false;
  @state() private currentEditItem: QAPairData | null = null;
  @state() private newQaTopicId: number | undefined;
  @state() private newQaQuestion = '';
  @state() private newQaAnswer = '';
  @state() private newQaQuestionType: QAPairQuestionTypeFE | undefined = QAPairQuestionTypeFE.LEGAL_INFORMATION;
  @state() private newQaSource = '';

  // File import state
  @state() private importDialogOpen = false;
  @state() private importFile: File | null = null;
  @state() private importTopicId: number | undefined;
  @state() private importing = false;
  @state() private importResult: { successCount?: number; errorCount?: number; errors?: string[] } | null = null;

  // Pagination (basic)
  @state() private page = 1;
  @state() private pageSize = 10;
  @state() private totalItems = 0;

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchTopics();
    await this.fetchItems();
  }

  async fetchTopics() {
    try {
      this.topics = await adminServerApi.getTopics();
      if (this.topics.length > 0 && !this.importTopicId) {
        this.importTopicId = this.topics[0].id; // Default for import dialog
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
      const result = await adminServerApi.listQAPairs(topicId, this.page, this.pageSize);
      this.items = result.rows;
      this.totalItems = result.count;
    } catch (e: any) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  }

  handleTopicFilterChange(e: any) {
    this.selectedTopicFilter = e.target.value === 'all' ? 'all' : Number(e.target.value);
    this.page = 1; // Reset page on filter change
    this.fetchItems();
  }

  openDialog(item: QAPairData | null = null) {
    this.currentEditItem = item;
    if (item) {
      this.newQaTopicId = item.topicId;
      this.newQaQuestion = item.question;
      this.newQaAnswer = item.answer;
      this.newQaQuestionType = item.questionType || QAPairQuestionTypeFE.LEGAL_INFORMATION;
      this.newQaSource = item.source || '';
    } else {
      this.newQaTopicId = this.topics.length > 0 ? this.topics[0].id : undefined;
      this.newQaQuestion = '';
      this.newQaAnswer = '';
      this.newQaQuestionType = QAPairQuestionTypeFE.LEGAL_INFORMATION;
      this.newQaSource = '';
    }
    this.dialogOpen = true;
  }

  closeDialog() {
    this.dialogOpen = false;
    this.currentEditItem = null;
    // Reset fields
  }

  async saveQaItem() {
    if (!this.newQaTopicId || !this.newQaQuestion || !this.newQaAnswer) {
      alert('Topic, Question and Answer are required.');
      return;
    }
    const dto: QACreateDTO = {
      topicId: this.newQaTopicId,
      question: this.newQaQuestion,
      answer: this.newQaAnswer,
      questionType: this.newQaQuestionType,
      source: this.newQaSource,
    };
    this.loading = true;
    try {
      if (this.currentEditItem) {
        await adminServerApi.updateQAPair(this.currentEditItem.id, dto);
      } else {
        await adminServerApi.createQAPair(dto);
      }
      this.fetchItems();
      this.closeDialog();
    } catch (e: any) {
      this.error = e.message;
      alert(`Error saving: ${e.message}`);
    } finally {
      this.loading = false;
    }
  }

  async deleteItem(id: number) {
    if (!confirm('Are you sure you want to delete this Q&A pair?')) return;
    this.loading = true;
    try {
      await adminServerApi.deleteQAPair(id);
      this.fetchItems();
    } catch (e: any) {
      this.error = e.message;
      alert(`Error deleting: ${e.message}`);
    } finally {
      this.loading = false;
    }
  }

  openImportDialog() {
    this.importResult = null;
    this.importFile = null;
    this.importDialogOpen = true;
  }

  closeImportDialog() {
    this.importDialogOpen = false;
  }

  handleFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.importFile = input.files[0];
    }
  }

  async handleImport() {
    if (!this.importFile || this.importTopicId === undefined) {
      alert('Please select a file and a topic for import.');
      return;
    }
    this.importing = true;
    this.importResult = null;
    this.error = null;
    try {
      const result = await adminServerApi.importXlsx(this.importTopicId, this.importFile);
      this.importResult = result;
      if (result.successCount > 0) {
          this.fetchItems(); // Refresh list if import was successful
      }
    } catch (e: any) {
      this.error = e.message;
      this.importResult = { errorCount: 1, errors: [e.message] };
    } finally {
      this.importing = false;
    }
  }

  handleNextPage() {
    if ((this.page * this.pageSize) < this.totalItems) {
        this.page++;
        this.fetchItems();
    }
  }

  handlePrevPage() {
    if (this.page > 1) {
        this.page--;
        this.fetchItems();
    }
  }

  static override styles = css`
    :host {
      display: block;
      padding: 16px;
      background-color: var(--md-sys-color-surface);
      color: #111111;
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
      box-shadow: var(--md-sys-elevation-1);
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      max-width: 200px; /* Prevent very wide columns */
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    th {
      background-color: var(--md-sys-color-surface-container-low);
      font-weight: bold;
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
    .import-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px;
    }
    .pagination {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-top: 16px;
    }
    .pagination span {
        margin: 0 8px;
    }
    .loading, .error-message {
        margin-top: 16px;
        text-align: center;
    }
    .error-message {
        color: var(--md-sys-color-error);
    }
    .import-results {
        margin-top: 10px;
        padding: 10px;
        border: 1px solid var(--md-sys-color-outline-variant);
        max-height: 150px;
        overflow-y: auto;
    }
  `;

  render() {
    return html`
      <div class="top-bar">
        <md-outlined-button @click=${() => this.openDialog()}>Add Q&A</md-outlined-button>
        <md-outlined-button @click=${this.openImportDialog}>Import XLSX</md-outlined-button>
        <md-outlined-select label="Filter by Topic" @change=${this.handleTopicFilterChange} .value=${this.selectedTopicFilter.toString()}>
          <md-select-option value="all">All Topics</md-select-option>
          ${this.topics.map(topic => html`
            <md-select-option value="${topic.id}">${topic.title}</md-select-option>
          `)}
        </md-outlined-select>
      </div>

      ${this.loading && !this.dialogOpen && !this.importDialogOpen ? html`<div class="loading"><md-circular-progress indeterminate></md-circular-progress></div>` : ''}
      ${this.error ? html`<div class="error-message">Error: ${this.error}</div>` : ''}

      <table>
        <thead>
          <tr>
            <th>Question</th>
            <th>Answer</th>
            <th>Type</th>
            <th>Source</th>
            <th>Topic</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.items.map(item => html`
            <tr>
              <td title="${item.question}">${item.question}</td>
              <td title="${item.answer}">${item.answer}</td>
              <td>${item.questionType || 'N/A'}</td>
              <td title="${item.source}">${item.source || 'N/A'}</td>
              <td>${item.Topic?.title || 'N/A'}</td>
              <td class="actions">
                <md-icon-button @click=${() => this.openDialog(item)}><md-icon>edit</md-icon></md-icon-button>
                <md-icon-button @click=${() => this.deleteItem(item.id)}><md-icon>delete</md-icon></md-icon-button>
              </td>
            </tr>
          `)}
        </tbody>
      </table>
        <div class="pagination">
            <md-outlined-button @click=${this.handlePrevPage} ?disabled=${this.page <= 1 || this.loading}>Prev</md-outlined-button>
            <span>Page ${this.page} of ${Math.ceil(this.totalItems / this.pageSize)}</span>
            <md-outlined-button @click=${this.handleNextPage} ?disabled=${(this.page * this.pageSize) >= this.totalItems || this.loading}>Next</md-outlined-button>
        </div>

      <md-dialog ?open=${this.dialogOpen} @closed=${this.closeDialog}>
        <div slot="headline">${this.currentEditItem ? 'Edit' : 'Add'} Q&A Pair</div>
        <div slot="content" class="dialog-content">
          <md-outlined-select label="Topic" required .value=${this.newQaTopicId?.toString()} @change=${(e: any) => this.newQaTopicId = Number(e.target.value)}>
            ${this.topics.map(topic => html`
              <md-select-option value="${topic.id}">${topic.title}</md-select-option>
            `)}
          </md-outlined-select>
          <md-outlined-text-field label="Question" required type="textarea" rows="3" .value=${this.newQaQuestion} @input=${(e: any) => this.newQaQuestion = e.target.value}></md-outlined-text-field>
          <md-outlined-text-field label="Answer" required type="textarea" rows="5" .value=${this.newQaAnswer} @input=${(e: any) => this.newQaAnswer = e.target.value}></md-outlined-text-field>
          <md-outlined-select label="Question Type" .value=${this.newQaQuestionType} @change=${(e: any) => this.newQaQuestionType = e.target.value as QAPairQuestionTypeFE}>
            ${Object.values(QAPairQuestionTypeFE).map(type => html`
              <md-select-option value="${type}">${type.replace(/_/g, ' ')}</md-select-option>
            `)}
          </md-outlined-select>
          <md-outlined-text-field label="Source (e.g., Document name, URL)" .value=${this.newQaSource} @input=${(e: any) => this.newQaSource = e.target.value}></md-outlined-text-field>
        </div>
        <div slot="actions">
          <md-outlined-button @click=${this.closeDialog}>Cancel</md-outlined-button>
          <md-filled-button @click=${this.saveQaItem} ?disabled=${this.loading}>Save</md-filled-button>
        </div>
      </md-dialog>

      <md-dialog ?open=${this.importDialogOpen} @closed=${this.closeImportDialog}>
        <div slot="headline">Import Q&A from XLSX</div>
        <div slot="content" class="import-dialog-content">
            <p>Select an XLSX file where the first column is 'Question' and the second is 'Answer'.</p>
            <md-outlined-select label="Import to Topic" required .value=${this.importTopicId?.toString()} @change=${(e: any) => this.importTopicId = Number(e.target.value)}>
                ${this.topics.map(topic => html`
                <md-select-option value="${topic.id}">${topic.title}</md-select-option>
                `)}
            </md-outlined-select>
            <input type="file" accept=".xlsx" @change=${this.handleFileChange}>
            ${this.importing ? html`<md-circular-progress indeterminate></md-circular-progress>` : ''}
            ${this.importResult ? html`
                <div class="import-results">
                    <p>Import Complete:</p>
                    <p>Success: ${this.importResult.successCount ?? 0}</p>
                    <p>Errors: ${this.importResult.errorCount ?? 0}</p>
                    ${this.importResult.errors && this.importResult.errors.length > 0 ? html`
                        <p>Error Details:</p>
                        <ul>
                            ${this.importResult.errors.map(err => html`<li>${err}</li>`)}
                        </ul>
                    ` : ''}
                </div>
            ` : ''}
             ${this.error && this.importing == false && !this.importResult ? html`<p class="error-message">Import Error: ${this.error}</p>`: '' }
        </div>
        <div slot="actions">
          <md-outlined-button @click=${this.closeImportDialog}>Cancel</md-outlined-button>
          <md-filled-button @click=${this.handleImport} ?disabled=${this.importing || !this.importFile || this.importTopicId === undefined}>
            ${this.importing ? 'Importing...' : 'Import'}
          </md-filled-button>
        </div>
      </md-dialog>
    `;
  }
}