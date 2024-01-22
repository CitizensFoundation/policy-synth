import { YpServerApi } from "@yrpri/webapp";
export declare class SimpleChatServerApi extends YpServerApi {
    constructor(urlPath?: string);
    conversation(chatLog: PsSimpleChatLog[], wsClientId: string): Promise<void>;
}
//# sourceMappingURL=SimpleServerApi.d.ts.map