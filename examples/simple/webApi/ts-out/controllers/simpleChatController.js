import { BaseController } from "@policysynth/api/controllers/baseController.js";
import { SimpleChatBot } from "../simpleChatBot.js";
export class SimpleChatController extends BaseController {
    constructor(wsClients) {
        super(wsClients);
        this.path = "/api/simple_chat";
        this.simpleChat = async (req, res) => {
            const chatLog = req.body.chatLog;
            const wsClientId = req.body.wsClientId;
            try {
                const bot = new SimpleChatBot(wsClientId, this.wsClients);
                bot.conversation(chatLog);
            }
            catch (error) {
                console.log(error);
                res.sendStatus(500);
            }
            console.log(`SimpleChatController for id ${wsClientId} initialized`);
            res.sendStatus(200);
        };
        this.initializeRoutes();
    }
    async initializeRoutes() {
        this.router.put(this.path + "/", this.simpleChat);
    }
}
