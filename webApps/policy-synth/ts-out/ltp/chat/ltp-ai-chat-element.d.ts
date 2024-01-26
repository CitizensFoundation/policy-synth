import { TemplateResult } from 'lit';
import '@material/web/icon/icon.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/progress/circular-progress.js';
import '@yrpri/webapp/common/yp-image.js';
import { LtpServerApi } from '../LtpServerApi';
import { PsAiChatElement } from '../../chatBot/ps-ai-chat-element';
export declare class LtpAiChatElement extends PsAiChatElement {
    parentNodeId: string;
    crtId: string | number;
    refinedCausesSuggestions: string[] | undefined;
    lastChainCompletedAsValid: boolean;
    lastValidateCauses: string[] | undefined;
    isCreatingCauses: boolean;
    api: LtpServerApi;
    constructor();
    handleJsonLoadingEnd: (event: any) => void;
    static get styles(): (any[] | import("lit").CSSResult)[];
    addSelected(): Promise<void>;
    get isError(): boolean;
    renderJson(): TemplateResult<1>;
}
//# sourceMappingURL=ltp-ai-chat-element.d.ts.map