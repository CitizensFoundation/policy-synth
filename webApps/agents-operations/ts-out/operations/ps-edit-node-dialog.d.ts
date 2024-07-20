import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-button.js';
import '@yrpri/webapp/yp-survey/yp-structured-question-edit.js';
import { YpBaseElement } from '@yrpri/webapp/common/yp-base-element';
export declare class PsEditNodeDialog extends YpBaseElement {
    open: boolean;
    nodeToEditInfo: any;
    disableScrim(event: CustomEvent): void;
    render(): import("lit").TemplateResult<1>;
    _renderNodeEditHeadline(): import("lit").TemplateResult<1>;
    _renderEditForm(): import("lit").TemplateResult<1>;
    _getInitialAnswers(): {
        uniqueId: string;
        value: unknown;
    }[];
    _handleClose(): void;
    _handleSave(): void;
    static get styles(): any[];
}
//# sourceMappingURL=ps-edit-node-dialog.d.ts.map