import { BaseController } from "@policysynth/api/controllers/baseController.js";
import { LiveResearchChatBot } from "../liveResearchChatBot.js";
export class LiveResearchChatController extends BaseController {
    constructor(wsClients) {
        super(wsClients);
        this.path = "/api/live_research_chat";
        this.liveResearchChat = async (req, res) => {
            const chatLog = req.body.chatLog;
            const wsClientId = req.body.wsClientId;
            const numberOfSelectQueries = req.body.numberOfSelectQueries;
            const percentOfTopQueriesToSearch = req.body.percentOfTopQueriesToSearch;
            const percentOfTopResultsToScan = req.body.percentOfTopResultsToScan;
            try {
                const bot = new LiveResearchChatBot(wsClientId, this.wsClients);
                bot.researchConversation(chatLog, numberOfSelectQueries, percentOfTopQueriesToSearch, percentOfTopResultsToScan);
            }
            catch (error) {
                console.log(error);
                res.sendStatus(500);
            }
            console.log(`LiveResearchChatController for id ${wsClientId} initialized`);
            res.sendStatus(200);
        };
        this.initializeRoutes();
    }
    async initializeRoutes() {
        this.router.put(this.path + "/", this.liveResearchChat);
    }
}
