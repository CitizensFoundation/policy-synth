import { TemplateResult } from 'lit';
import '@material/web/icon/icon';
import '@material/web/checkbox/checkbox';
import '@material/web/button/outlined-button';
import '@material/web/button/filled-button';
import '@material/web/textfield/filled-text-field';
import '@material/web/progress/circular-progress';
import '@yrpri/webapp/common/yp-image';
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