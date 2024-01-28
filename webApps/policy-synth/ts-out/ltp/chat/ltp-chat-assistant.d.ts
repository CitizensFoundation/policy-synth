import '@material/web/fab/fab.js';
import '@material/web/radio/radio.js';
import '@material/web/button/elevated-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@yrpri/webapp/common/yp-image.js';
import { LtpAiChatElement } from './ltp-ai-chat-element.js';
import './ltp-ai-chat-element.js';
import { LtpServerApi } from '../LtpServerApi';
import { PsChatAssistant } from '../../chatBot/ps-chat-assistant';
export declare class LtpChatAssistant extends PsChatAssistant {
    crtData: LtpCurrentRealityTreeData;
    nodeToAddCauseTo: LtpCurrentRealityTreeDataNode;
    defaultInfoMessage: string;
    lastChainCompletedAsValid: boolean;
    chatElements?: LtpAiChatElement[];
    lastCausesToValidate: string[] | undefined;
    lastValidatedCauses: string[] | undefined;
    api: LtpServerApi;
    heartbeatInterval: number | undefined;
    defaultDevWsPort: number;
    constructor();
    connectedCallback(): void;
    addChatBotElement(data: PsAiChatWsMessage): Promise<void>;
    sendChatMessage(): Promise<void>;
    validateSelectedChoices(event: CustomEvent): Promise<void>;
    getSuggestionsFromValidation(agentName: string, validationResults: PsValidationAgentResult): Promise<void>;
    renderChatInput(): import("lit").TemplateResult<1>;
    render(): import("lit").TemplateResult<1>;
}
//# sourceMappingURL=ltp-chat-assistant.d.ts.map