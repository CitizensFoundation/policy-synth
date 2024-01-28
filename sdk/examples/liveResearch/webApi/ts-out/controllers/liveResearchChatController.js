import { BaseController } from "@policysynth/api/controllers/baseController.js";
import { LiveResearchChatBot } from "../liveResearchChatBot.js";
export class LiveResearchChatController extends BaseController {
    constructor(wsClients) {
        super(wsClients);
        this.path = "/api/live_research_chat";
        this.getChatLog = async (req, res) => {
            const memoryId = req.params.memoryId;
            let saveChatLog;
            try {
                //TODO: this is a hack to get the chat log from the memory, find a better way
                const bot = new LiveResearchChatBot("-1", this.wsClients, memoryId);
                if (memoryId) {
                    const memory = await bot.getLoadedMemory();
                    if (memory) {
                        saveChatLog = memory.chatLog;
                    }
                }
            }
            catch (error) {
                console.log(error);
                res.sendStatus(500);
            }
            res.send(saveChatLog);
        };
        this.liveResearchChat = async (req, res) => {
            const chatLog = req.body.chatLog;
            const wsClientId = req.body.wsClientId;
            const memoryId = req.body.memoryId;
            const numberOfSelectQueries = req.body.numberOfSelectQueries;
            const percentOfTopQueriesToSearch = req.body.percentOfTopQueriesToSearch;
            const percentOfTopResultsToScan = req.body.percentOfTopResultsToScan;
            let saveChatLog;
            try {
                const bot = new LiveResearchChatBot(wsClientId, this.wsClients, memoryId);
                if (memoryId) {
                    const memory = await bot.getLoadedMemory();
                    if (memory) {
                        saveChatLog = memory.chatLog;
                    }
                }
                bot.researchConversation(chatLog, numberOfSelectQueries, percentOfTopQueriesToSearch, percentOfTopResultsToScan);
            }
            catch (error) {
                console.log(error);
                res.sendStatus(500);
            }
            console.log(`LiveResearchChatController for id ${wsClientId} initialized chatLog of length ${chatLog?.length}`);
            if (saveChatLog) {
                res.send(saveChatLog);
            }
            else {
                res.sendStatus(200);
            }
        };
        this.initializeRoutes();
    }
    async initializeRoutes() {
        this.router.put(this.path + "/", this.liveResearchChat);
        this.router.get(this.path + "/:memoryId", this.getChatLog);
    }
}
