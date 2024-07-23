import { PsBaseConnector } from "./baseConnector.js";
export class PsBaseIdeasCollaborationConnector extends PsBaseConnector {
    // Optional method for image generation, if supported by the collaboration platform
    async generateImage(groupId, prompt) {
        throw new Error("Image generation not supported by this collaboration connector.");
    }
}
//# sourceMappingURL=baseIdeasCollaborationConnector.js.map