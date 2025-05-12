import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { adminServerApi, ReviewData, TopicData } from '../services/adminServerApi.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/button/outlined-button.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/slider/slider.js'; // For rating filter

@customElement('review-manager')
export class ReviewManager extends LitElement {
  @state() private items: ReviewData[] = [];
  @state() private loading = false;
  @state() private error: string | null = null;
  @state() private topics: TopicData[] = [];
  @state() private selectedTopicFilter: number | 'all' = 'all';
  @state() private minRatingFilter = 0; // 0 for all ratings

  // Pagination
  @state() private page = 1;
  @state() private pageSize = 15;
  @state() private totalItems = 0;

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchTopics();
    await this.fetchItems();
  }

  async fetchTopics() {
    try {
      this.topics = await adminServerApi.getTopics();
    } catch (e: any) {
      this.error = e.message;
    }
  }

  async fetchItems() {
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
      const result = await adminServerApi.listReviews(params);
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
    this.page = 1;
    this.fetchItems();
  }

  handleRatingFilterChange(e: any) {
    this.minRatingFilter = Number(e.target.value);
    this.page = 1;
    this.fetchItems();
  }

  async exportCSV() {
    this.loading = true;
    try {
        const blob = await adminServerApi.exportReviewsCSV();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reviews_export.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (e: any) {
        this.error = e.message;
        alert("Error exporting CSV: " + e.message);
    } finally {
        this.loading = false;
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

  renderRating(rating: number) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += (i < rating) ? '★' : '☆';
    }
    return stars;
  }

  static override styles = css`
    /* Styles similar to other managers */
    :host {
      display: block;
      padding: 16px;
    }
    .top-bar {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 16px;
      flex-wrap: wrap; /* Allow wrapping for smaller screens */
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
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    td.notes {
        white-space: normal; /* Allow notes to wrap */
        max-width: 300px;
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
  `;

  render() {
    return html`
      <div class="top-bar">
        <md-outlined-select label="Filter by Topic" @change=${this.handleTopicFilterChange} .value=${this.selectedTopicFilter.toString()}>
            <md-select-option value="all">All Topics</md-select-option>
            ${this.topics.map(topic => html`<md-select-option value="${topic.id}">${topic.title}</md-select-option>`)}
        </md-outlined-select>

        <div>
            <label for="ratingSlider">Min Rating: ${this.minRatingFilter > 0 ? this.renderRating(this.minRatingFilter) : 'Any'}</label>
            <md-slider id="ratingSlider" min="0" max="5" step="1" .value=${this.minRatingFilter} @change=${this.handleRatingFilterChange} ticks labelled></md-slider>
        </div>

        <md-outlined-button @click=${this.exportCSV} ?disabled=${this.loading}>
            Export to CSV
            <md-icon slot="icon">download</md-icon>
        </md-outlined-button>
      </div>

      ${this.loading ? html`<md-circular-progress indeterminate></md-circular-progress>` : ''}
      ${this.error ? html`<p style="color:red;">Error: ${this.error}</p>` : ''}

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Rating</th>
            <th>Notes</th>
            <th>Question</th>
            <th>Answer Snippet</th>
            <th>Topic</th>
            <th>Reviewer</th>
          </tr>
        </thead>
        <tbody>
          ${this.items.map(item => html`
            <tr>
              <td title="${item.createdAt}">${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
              <td title="${item.rating}">${this.renderRating(item.rating)}</td>
              <td class="notes" title="${item.notes}">${item.notes || '-'}</td>
              <td title="${item.QAPair?.question}">${item.QAPair?.question?.substring(0,50) || item.answerHash?.substring(0,10)+'...hash' || 'N/A'}</td>
              <td title="${item.QAPair?.answer}">${item.QAPair?.answer?.substring(0,50) || '-'}</td>
              <td>${item.QAPair?.Topic?.title || 'N/A'}</td>
              <td>${item.reviewer?.email || 'Anonymous'}</td>
            </tr>
          `)}
        </tbody>
      </table>
      <div class="pagination">
        <md-outlined-button @click=${this.handlePrevPage} ?disabled=${this.page <= 1 || this.loading}>Prev</md-outlined-button>
        <span>Page ${this.page} of ${Math.ceil(this.totalItems / this.pageSize)}</span>
        <md-outlined-button @click=${this.handleNextPage} ?disabled=${(this.page * this.pageSize) >= this.totalItems || this.loading}>Next</md-outlined-button>
      </div>
    `;
  }
}