import { BaseController } from "@policysynth/api/controllers/baseController.js";
import { RebootingDemocracyChatBot } from "../chatbot/chatBot.js";
export class ChatController extends BaseController {
    path = "/api/live_research_chat";
    constructor(wsClients) {
        super(wsClients);
        this.initializeRoutes();
    }
    async initializeRoutes() {
        this.router.put(this.path + "/", this.rebootDemocracyChat);
        this.router.get(this.path + "/:memoryId", this.getChatLog);
    }
    getChatLog = async (req, res) => {
        const memoryId = req.params.memoryId;
        let chatLog;
        let totalCosts;
        try {
            if (memoryId) {
                const memory = await RebootingDemocracyChatBot.loadMemoryFromRedis(memoryId);
                if (memory) {
                    console.log(`memory loaded: ${JSON.stringify(memory, null, 2)}`);
                    chatLog = memory.chatLog;
                    totalCosts = RebootingDemocracyChatBot.getFullCostOfMemory(memory);
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
    rebootDemocracyChat = async (req, res) => {
        const chatLog = req.body.chatLog;
        const wsClientId = req.body.wsClientId;
        const memoryId = req.body.memoryId;
        let saveChatLog;
        try {
            const bot = new RebootingDemocracyChatBot(wsClientId, this.wsClients, memoryId);
            if (memoryId) {
                const memory = await bot.getLoadedMemory();
                if (memory) {
                    saveChatLog = memory.chatLog;
                }
            }
            bot.rebootingDemocracyConversation(chatLog, []);
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
}
