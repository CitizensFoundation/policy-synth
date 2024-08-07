import { TemplateResult, css, html, nothing } from 'lit';
import { property, customElement } from 'lit/decorators.js';

import { Layouts } from '../../flexbox-literals/classes.js';
import { resolveMarkdown } from '../../chatBot/litMarkdown.js';
import '@material/web/icon/icon';
import '@material/web/checkbox/checkbox';

import '@material/web/button/outlined-button';
import '@material/web/button/filled-button';
import '@material/web/textfield/filled-text-field';

import '@material/web/progress/circular-progress';
import { jsonrepair } from 'jsonrepair';
import '@yrpri/webapp/common/yp-image';
import { PsServerApi } from '../PsServerApi.js';
import { MdCheckbox } from '@material/web/checkbox/checkbox';
import { PsAiChatElement } from '../../chatBot/ps-ai-chat-element.js';

@customElement('ltp-ai-chat-element')
export class LtpAiChatElement extends PsAiChatElement {
  @property({ type: String })
  parentNodeId!: string;

  @property({ type: String })
  crtId!: string | number;

  @property({ type: Array })
  refinedCausesSuggestions: string[] | undefined;

  @property({ type: Boolean })
  lastChainCompletedAsValid: boolean;

  @property({ type: Array })
  lastValidateCauses: string[] | undefined;

  @property({ type: Boolean })
  isCreatingCauses: boolean;

  api: PsServerApi;

  constructor() {
    super();
    this.api = new PsServerApi();
  }

  handleJsonLoadingEnd = (event: any) => {
    const jsonContent = event.detail;
    console.log(
      'JSON loading end event triggered with JSON content:',
      jsonContent
    );
    this.jsonLoading = false;
    let jsonContentParsed: CrtRefinedCausesReply | undefined = undefined;
    try {
      jsonContentParsed = JSON.parse(
        jsonContent.jsonContent
      ) as CrtRefinedCausesReply;
    } catch (e) {
      console.error('Error parsing JSON content:', e);
      try {
        jsonContentParsed = JSON.parse(jsonrepair(jsonContent.jsonContent));
      } catch (e) {
        console.error('Error parsing JSON content again:', e);
      }
    }

    if (jsonContentParsed) {
      if (
        this.lastChainCompletedAsValid &&
        this.lastValidateCauses &&
        this.lastValidateCauses.length > 0
      ) {
        this.refinedCausesSuggestions = this.lastValidateCauses;
      } else if (jsonContentParsed.suggestedCauses) {
        this.refinedCausesSuggestions = jsonContentParsed.suggestedCauses;
      }
    }
  };

  static override get styles() {
    return [
      super.styles,
      css`
        .refinedCausesSuggestionshowMore {
          padding-left: 16px;
          padding-right: 16px;
        }

        .refinedSuggestions {
          padding: 0;
          border-radius: 8px;
          margin: 16px;
          margin-top: 0;
        }

        .refinedSuggestions label {
          display: flex;
          align-items: center;
          margin-bottom: 0; // Reduced margin for a tighter layout
          padding: 8px;
        }

        .refinedContainer {
          padding: 0;
        }

        .directCause {
          background-color: var(--md-sys-color-primary);
          color: var(--md-sys-color-on-primary);
          margin-bottom: 16px !important;
          border-radius: 16px;
        }

        .assumption {
          background-color: var(--md-sys-color-secondary);
          color: var(--md-sys-color-on-secondary);
          margin-bottom: 16px !important;
          border-radius: 16px;
        }

        .assumptionCheckbox {
          --md-checkbox-outline-color: var(--md-sys-color-on-secondary);
          --md-checkbox-hover-outline-color: var(--md-sys-color-on-primary);
        }

        .directCauseCheckbox {
          --md-checkbox-outline-color: var(--md-sys-color-on-primary);
          --md-checkbox-hover-outline-color: var(--md-sys-color-on-secondary);
        }

        md-filled-button {
          max-width: 250px;
          margin-top: 16px;
          margin-bottom: 16px;
        }

        .refinedCausesSuggestions {
          margin-top: 8px;
          margin-left: 36px;
          margin-right: 36px;
          margin-bottom: 22px;
          padding: 8px;
          border-radius: 12px;
          background-color: var(--md-sys-color-tertiary-container);
          color: var(--md-sys-color-on-tertiary-container);
        }

        .suggestionsHeader {
          font-size: 18px;
          color: var(--md-sys-color-primary);
          margin-bottom: 16px;
        }
      `,
    ];
  }

  async addSelected() {
    const checkboxes = this.shadowRoot!.querySelectorAll('md-checkbox');

    // Arrays to hold selected causes and assumptions
    const selectedCauses: string[] = [];
    const selectedAssumptions: string[] = [];

    // Iterate over each checked checkbox
    checkboxes.forEach(checkbox => {
      if (checkbox.checked) {
        const item = checkbox.getAttribute('aria-label');
        const type = (checkbox as MdCheckbox).dataset.type;

        if (type === 'directCause') {
          selectedCauses.push(item!);
        } else if (type === 'assumption') {
          selectedAssumptions.push(item!);
        }
      }
    });

    this.isCreatingCauses = true;

    // Add causes and assumptions using separate API calls
    let nodes: LtpCurrentRealityTreeDataNode[] = [];

    if (this.lastChainCompletedAsValid) {
      if (selectedCauses.length) {
        const causesNodes = await this.api.addDirectCauses(
          this.crtId,
          this.parentNodeId,
          selectedCauses,
          'directCause'
        );
        nodes = nodes.concat(causesNodes);
      }

      if (selectedAssumptions.length) {
        const assumptionsNodes = await this.api.addDirectCauses(
          this.crtId,
          this.parentNodeId,
          selectedAssumptions,
          'assumption'
        );
        nodes = nodes.concat(assumptionsNodes);
      }

      this.fireGlobal('add-nodes', {
        parentNodeId: this.parentNodeId,
        nodes,
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      this.fire('close-add-cause-dialog');

      this.isCreatingCauses = false;
    } else {
      this.fire('validate-selected-causes', selectedCauses);
    }

    this.fire('scroll-down-enabled');
  }

  get isError() {
    return this.type == 'error' || this.type == 'moderation_error';
  }

  override renderJson() {
    if (!this.refinedCausesSuggestions) {
      return html``;
    }

    const renderSection = (
      suggestions: string[],
      headerText: string,
      typeClass: string
    ) => {
      if (!suggestions || suggestions.length === 0) return html``;

      return html`
        <div class="layout horizontal center-center">
          <div class="suggestionsHeader">${headerText}</div>
        </div>
        <div
          class="layout vertical refinedSuggestions ${typeClass} wrap"
          role="group"
        >
          ${suggestions.map(
            text => html`
              <label class="layout horizontal refinedContainer">
                <md-checkbox
                  aria-label="${text}"
                  .checked="${this.lastChainCompletedAsValid}"
                  .disabled="${this.lastChainCompletedAsValid}"
                  class="${typeClass}Checkbox"
                  data-type="${typeClass}"
                  touch-target="wrapper"
                ></md-checkbox>
                <div class="labelText">${text}</div>
              </label>
            `
          )}
        </div>
      `;
    };

    return html`
      ${renderSection(
        this.refinedCausesSuggestions ?? [],
        'Suggested Direct Causes',
        'directCause'
      )}

      <div class="layout horizontal center-center">
        <md-filled-button @click="${() => this.addSelected()}">
          ${this.lastChainCompletedAsValid
            ? this.t('Add selected')
            : this.t('Validate selected')}
        </md-filled-button>
      </div>
    `;
  }
}
