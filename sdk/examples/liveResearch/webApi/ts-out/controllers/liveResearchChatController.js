import { BaseController } from "@policysynth/api/controllers/baseController.js";
import { LiveResearchChatBot } from "../liveResearchChatBot.js";
export class LiveResearchChatController extends BaseController {
    constructor(wsClients) {
        super(wsClients);
        this.path = "/api/live_research_chat";
        this.getChatLog = async (req, res) => {
            const memoryId = req.params.memoryId;
            let chatLog;
            let totalCosts;
            try {
                if (memoryId) {
                    const memory = await LiveResearchChatBot.loadMemoryFromRedis(memoryId);
                    if (memory) {
                        console.log(`memory loaded: ${JSON.stringify(memory, null, 2)}`);
                        chatLog = memory.chatLog;
                        totalCosts = LiveResearchChatBot.getFullCostOfMemory(memory);
                    }
                    else {
                        console.log(`memory not found for id ${memoryId}`);
                    }
                }
            }
            catch (error) {
                console.log(error);
                res.sendStatus(500);
            }
            if (chatLog) {
                res.send({ chatLog, totalCosts });
            }
            else {
                res.sendStatus(404);
            }
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
