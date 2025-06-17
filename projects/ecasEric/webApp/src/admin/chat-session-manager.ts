import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { resolveMarkdown } from '../base/litMarkdown.js';
import { adminServerApi, ChatSessionData, TopicData, ReviewCreateDTO } from '../services/adminServerApi.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/dialog/dialog.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/slider/slider.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/textfield/outlined-text-field.js';

@customElement('chat-session-manager')
export class ChatSessionManager extends LitElement {
  @state() private sessions: ChatSessionData[] = [];
  @state() private topics: TopicData[] = [];
  @state() private loading = false;
  @state() private error: string | null = null;
  @state() private page = 1;
  @state() private pageSize = 10;
  @state() private totalItems = 0;
  @state() private selectedTopicFilter: number | 'all' = 'all';
  @state() private minRatingFilter = 0;

  @state() private dialogOpen = false;
  @state() private currentSession: ChatSessionData | null = null;
  @state() private reviewRating = 3;
  @state() private reviewNotes = '';

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchTopics();
    await this.fetchSessions();
  }

  async fetchTopics() {
    try {
      this.topics = await adminServerApi.getTopics();
    } catch (e: any) {
      this.error = e.message;
    }
  }

  async fetchSessions() {
    this.loading = true;
    this.error = null;
    try {
      const params: any = {
        page: this.page,
        pageSize: this.pageSize,
      };
      if (this.selectedTopicFilter !== 'all') {
        params.topicId = this.selectedTopicFilter;
      }
      if (this.minRatingFilter > 0) {
        params.minRating = this.minRatingFilter;
      }
      const result = await adminServerApi.listChatSessions(params);
      this.sessions = result.rows;
      this.totalItems = result.count;
    } catch (e: any) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  }

  handleTopicFilterChange(e: any) {
    this.selectedTopicFilter = e.target.value === 'all' ? 'all' : Number(e.target.value);
    this.page = 1;
    this.fetchSessions();
  }

  handleRatingFilterChange(e: any) {
    this.minRatingFilter = Number(e.target.value);
    this.page = 1;
    this.fetchSessions();
  }

  openDialog(session: ChatSessionData) {
    this.currentSession = session;
    const existing = session.Reviews && session.Reviews[0];
    this.reviewRating = existing ? existing.rating : 3;
    this.reviewNotes = existing?.notes || '';
    this.dialogOpen = true;
  }

  closeDialog() {
    this.dialogOpen = false;
    this.currentSession = null;
  }

  topicTitle(id?: number) {
    const t = this.topics.find(t => t.id === id);
    return t ? t.title : 'N/A';
  }

  renderRating(rating: number) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      stars += i < rating ? '★' : '☆';
    }
    return stars;
  }

  async saveReview() {
    if (!this.currentSession) return;
    const dto: ReviewCreateDTO = {
      chatSessionId: this.currentSession.id,
      rating: this.reviewRating,
      notes: this.reviewNotes,
    };
    this.loading = true;
    try {
      await adminServerApi.createReview(dto);
      await this.fetchSessions();
      this.closeDialog();
    } catch (e: any) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  }

  handleNextPage() {
    if (this.page * this.pageSize < this.totalItems) {
      this.page++;
      this.fetchSessions();
    }
  }

  handlePrevPage() {
    if (this.page > 1) {
      this.page--;
      this.fetchSessions();
    }
  }

  static override styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    .top-bar {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    th {
      background-color: var(--md-sys-color-surface-container-low);
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
    md-slider {
      min-width: 150px;
    }
    .chat-log {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid var(--md-sys-color-outline-variant);
      padding: 8px;
    }
    .chat-line {
      margin-bottom: 4px;
    }
  `;

  render() {
    return html`
      <div class="top-bar">
        <md-outlined-select label="Filter by Topic" @change=${this.handleTopicFilterChange} .value=${this.selectedTopicFilter.toString()}>
          <md-select-option value="all">All Topics</md-select-option>
          ${this.topics.map(t => html`<md-select-option value="${t.id}">${t.title}</md-select-option>`)}
        </md-outlined-select>
        <div>
          <label>Min Rating: ${this.minRatingFilter > 0 ? this.renderRating(this.minRatingFilter) : 'Any'}</label>
          <md-slider min="0" max="5" step="1" .value=${this.minRatingFilter} @change=${this.handleRatingFilterChange} ticks labelled></md-slider>
        </div>
      </div>
      ${this.loading ? html`<md-circular-progress indeterminate></md-circular-progress>` : ''}
      ${this.error ? html`<p style="color:red;">Error: ${this.error}</p>` : ''}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Topic</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${this.sessions.map(s => html`
            <tr>
              <td>${s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}</td>
              <td>${this.topicTitle(s.topicId)}</td>
              <td>${s.Reviews && s.Reviews.length > 0 ? this.renderRating(s.Reviews[0].rating) : '-'}</td>
              <td><md-outlined-button @click=${() => this.openDialog(s)}>View & Rate</md-outlined-button></td>
            </tr>
          `)}
        </tbody>
      </table>
      <div class="pagination">
        <md-outlined-button @click=${this.handlePrevPage} ?disabled=${this.page <= 1 || this.loading}>Prev</md-outlined-button>
        <span>Page ${this.page} of ${Math.ceil(this.totalItems / this.pageSize)}</span>
        <md-outlined-button @click=${this.handleNextPage} ?disabled=${this.page * this.pageSize >= this.totalItems || this.loading}>Next</md-outlined-button>
      </div>

      <md-dialog ?open=${this.dialogOpen} @closed=${this.closeDialog}>
        <div slot="headline">Chat Session Review</div>
        <div slot="content">
          ${this.currentSession ? html`
            <div class="chat-log">
              ${Array.isArray(this.currentSession.chatLogJson)
                ? this.currentSession.chatLogJson.map(
                    (line: any) => html`
                      <div class="chat-line">
                        <b>${line.sender}:</b>
                        ${line.sender === 'assistant' || line.sender === 'bot'
                          ? html`${resolveMarkdown(line.message, {
                              includeImages: true,
                              includeCodeBlockClassNames: true,
                            })}`
                          : html`${line.message}`}
                      </div>
                    `
                  )
                : ''}
            </div>
            <label>Rating: ${this.renderRating(this.reviewRating)}</label>
            <md-slider min="1" max="5" step="1" .value=${this.reviewRating} @change=${(e: any) => this.reviewRating = Number(e.target.value)} ticks labelled></md-slider>
            <md-outlined-text-field label="Notes" type="textarea" rows="3" .value=${this.reviewNotes} @input=${(e: any) => this.reviewNotes = e.target.value}></md-outlined-text-field>
          ` : ''}
        </div>
        <div slot="actions">
          <md-outlined-button @click=${this.closeDialog}>Cancel</md-outlined-button>
          <md-filled-button @click=${this.saveReview} ?disabled=${this.loading}>Save</md-filled-button>
        </div>
      </md-dialog>
    `;
  }
}
