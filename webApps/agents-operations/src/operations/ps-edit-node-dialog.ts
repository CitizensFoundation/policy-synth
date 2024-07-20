import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-button.js';
import '@yrpri/webapp/yp-survey/yp-structured-question-edit.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element';

@customElement('ps-edit-node-dialog')
export class PsEditNodeDialog extends YpBaseElement {
  @property({ type: Boolean }) open = false;
  @property({ type: Object }) nodeToEditInfo: any;

  disableScrim(event: CustomEvent) {
    event.stopPropagation();
    event.preventDefault();
  }

  render() {
    return html`
      <md-dialog ?open="${this.open}" @closed="${this._handleClose}" @cancel="${this.disableScrim}">
        <div slot="headline">
          ${this.nodeToEditInfo ? this._renderNodeEditHeadline() : ''}
        </div>
        <div slot="content">
          ${this.nodeToEditInfo ? this._renderEditForm() : ''}
        </div>
        <div slot="actions">
          <md-text-button @click="${this._handleClose}">Cancel</md-text-button>
          <md-filled-button @click="${this._handleSave}">Save</md-filled-button>
        </div>
      </md-dialog>
    `;
  }

  _renderNodeEditHeadline() {
    return html`
      <div class="layout horizontal">
        <div>
          <img
            src="${this.nodeToEditInfo.Class.configuration.imageUrl}"
            class="nodeEditHeadlineImage"
          />
        </div>
        <div class="nodeEditHeadlineTitle">
          ${this.nodeToEditInfo.Class.name}
        </div>
      </div>
    `;
  }

  _renderEditForm() {
    return html`
      <div id="surveyContainer">
        ${this.nodeToEditInfo.Class.configuration.questions.map(
          (question: YpStructuredQuestionData, index: number) => html`
            <yp-structured-question-edit
              index="${index}"
              id="structuredQuestion_${question.uniqueId
                ? index
                : `noId_${index}`}"
              .structuredAnswers="${this._getInitialAnswers()}"
              .question="${question}"
            >
            </yp-structured-question-edit>
          `
        )}
      </div>
    `;
  }

  _getInitialAnswers() {
    return Object.entries(this.nodeToEditInfo.configuration).map(
      ([key, value]) => ({
        uniqueId: key,
        value: value,
      })
    );
  }

  _handleClose() {
    this.dispatchEvent(new CustomEvent('close'));
  }

  _handleSave() {
    const updatedConfig = {} as Record<string, any>;
    this.nodeToEditInfo.Class.configuration.questions.forEach(
      (question: YpStructuredQuestionData, index: number) => {
        const questionElement = this.shadowRoot?.querySelector(
          `#structuredQuestion_${question.uniqueId ? index : `noId_${index}`}`
        ) as any;
        if (questionElement && question.uniqueId) {
          const answer = questionElement.getAnswer();
          if (answer) {
            updatedConfig[question.uniqueId] = answer.value;
          }
        }
      }
    );

    this.dispatchEvent(new CustomEvent('save', { detail: { updatedConfig } }));
    this._handleClose();
  }

  static override get styles() {
    return [
      super.styles,
      css`
        .nodeEditHeadlineImage {
          max-width: 100px;
          margin-right: 16px;
        }

        .nodeEditHeadlineTitle {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 55px;
        }

        md-dialog {
          width: 90%;
          height: 90%;
        }
      `,
    ];
  }
}
