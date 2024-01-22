import { BaseController } from "@policysynth/api/dist/controllers/baseController.js";
import { SimpleChatBot } from "../simpleChatBot.js";
export class SimpleChatController extends BaseController {
    constructor(wsClients) {
        super(wsClients);
        this.path = "/api/simple_chat";
        this.simpleChat = async (req, res) => {
            const userQuestion = req.body.userQuestion;
            const chatLog = req.body.chatLog;
            const wsClientId = req.body.wsClientId;
            try {
                new SimpleChatBot(userQuestion, chatLog, wsClientId, this.wsClients);
            }
            catch (error) {
                console.log(error);
                res.sendStatus(500);
            }
            console.log(`SimpleChatController: ${userQuestion}`);
            res.sendStatus(200);
        };
        this.initializeRoutes();
    }
    async initializeRoutes() {
        this.router.put(this.path + "/", this.simpleChat);
    }
}
