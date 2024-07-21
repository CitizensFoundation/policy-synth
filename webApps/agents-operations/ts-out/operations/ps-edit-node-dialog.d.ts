import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';
import '@yrpri/webapp/yp-survey/yp-structured-question-edit.js';
import './ps-ai-model-selector.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element';
export declare class PsEditNodeDialog extends YpBaseElement {
    open: boolean;
    nodeToEditInfo: any;
    private activeAiModels;
    private selectedAiModels;
    private api;
    connectedCallback(): Promise<void>;
    fetchActiveAiModels(): Promise<void>;
    disableScrim(event: CustomEvent): void;
    render(): import("lit").TemplateResult<1>;
    _renderNodeEditHeadline(): import("lit").TemplateResult<1>;
    _renderEditForm(): import("lit").TemplateResult<1>;
    _renderAiModelSelector(): import("lit").TemplateResult<1> | "";
    _getCurrentModels(): {
        large?: PsAiModelAttributes;
        medium?: PsAiModelAttributes;
        small?: PsAiModelAttributes;
    };
    _getInitialAnswers(): {
        uniqueId: string;
        value: unknown;
    }[];
    _handleClose(): void;
    _handleAiModelsChanged(e: CustomEvent): void;
    _handleSave(): void;
    static get styles(): any[];
}
//# sourceMappingURL=ps-edit-node-dialog.d.ts.map