import { BaseController } from "@policysynth/api/dist/controllers/baseController.js";
import { BaseChatBot } from "../baseChatBot.js";
export class SimpleChatController extends BaseController {
    constructor(wsClients) {
        super(wsClients);
        this.path = "/api/simple_chat";
        this.simpleChat = async (req, res) => {
            const userQuestion = req.body.userQuestion;
            const chatConversation = req.body.chatConversation;
            const wsClientId = req.body.wsClientId;
            try {
                new BaseChatBot(userQuestion, chatConversation, wsClientId, this.wsClients);
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
        this.router.get(this.path, this.simpleChat);
    }
}
