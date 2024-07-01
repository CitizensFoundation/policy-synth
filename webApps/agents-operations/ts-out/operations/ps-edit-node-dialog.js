var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-button.js';
import '@yrpri/webapp/yp-survey/yp-structured-question-edit.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element';
let PsEditNodeDialog = class PsEditNodeDialog extends YpBaseElement {
    constructor() {
        super(...arguments);
        this.open = false;
    }
    render() {
        return html `
      <md-dialog ?open="${this.open}" @closed="${this._handleClose}">
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
        return html `
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
        return html `
      <div id="surveyContainer">
        ${this.nodeToEditInfo.Class.configuration.questions.map((question, index) => html `
            <yp-structured-question-edit
              index="${index}"
              id="structuredQuestion_${question.uniqueId
            ? index
            : `noId_${index}`}"
              .structuredAnswers="${this._getInitialAnswers()}"
              .question="${question}"
            >
            </yp-structured-question-edit>
          `)}
      </div>
    `;
    }
    _getInitialAnswers() {
        return Object.entries(this.nodeToEditInfo.configuration).map(([key, value]) => ({
            uniqueId: key,
            value: value,
        }));
    }
    _handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }
    _handleSave() {
        const updatedConfig = {};
        this.nodeToEditInfo.Class.configuration.questions.forEach((question, index) => {
            const questionElement = this.shadowRoot?.querySelector(`#structuredQuestion_${question.uniqueId ? index : `noId_${index}`}`);
            if (questionElement && question.uniqueId) {
                const answer = questionElement.getAnswer();
                if (answer) {
                    updatedConfig[question.uniqueId] = answer.value;
                }
            }
        });
        this.dispatchEvent(new CustomEvent('save', { detail: { updatedConfig } }));
        this._handleClose();
    }
    static get styles() {
        return [
            super.styles,
            css `
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
      `,
        ];
    }
};
__decorate([
    property({ type: Boolean })
], PsEditNodeDialog.prototype, "open", void 0);
__decorate([
    property({ type: Object })
], PsEditNodeDialog.prototype, "nodeToEditInfo", void 0);
PsEditNodeDialog = __decorate([
    customElement('ps-edit-node-dialog')
], PsEditNodeDialog);
export { PsEditNodeDialog };
//# sourceMappingURL=ps-edit-node-dialog.js.map