import { BaseController } from '@policysynth/api/controllers/baseController.js';
import { authMiddleware, roleGuard } from '../middlewares/authMiddleware.js';
import { QaService } from '../services/qaService.js';
import multer from 'multer';
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });
export class QAController extends BaseController {
    path = '/api/qa';
    qaService = new QaService();
    constructor(wsClients) {
        super(wsClients);
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(this.path, this.listQAPairs); // Public or authed based on general policy
        this.router.get(`${this.path}/:id`, this.getQAPair);
        this.router.post(this.path, authMiddleware, roleGuard('admin'), this.createQAPair);
        this.router.put(`${this.path}/:id`, authMiddleware, roleGuard('admin'), this.updateQAPair);
        this.router.delete(`${this.path}/:id`, authMiddleware, roleGuard('admin'), this.deleteQAPair);
        this.router.post(`${this.path}/import-xlsx`, authMiddleware, roleGuard('admin'), upload.single('file'), this.importXLSX);
    }
    listQAPairs = async (req, res) => {
        const { topicId, page, pageSize } = req.query;
        try {
            const result = await this.qaService.list(topicId ? Number(topicId) : undefined, page ? Number(page) : 1, pageSize ? Number(pageSize) : 20);
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error listing Q&A pairs:', error);
            res.status(500).send(error.message || 'Internal Server Error');
        }
    };
    getQAPair = async (req, res) => {
        const { id } = req.params;
        try {
            const qaPair = await this.qaService.findById(Number(id));
            if (!qaPair) {
                return res.status(404).send('Q&A Pair not found');
            }
            res.status(200).json(qaPair);
        }
        catch (error) {
            console.error(`Error getting Q&A pair ${id}:`, error);
            res.status(500).send(error.message || 'Internal Server Error');
        }
    };
    createQAPair = async (req, res) => {
        const { topicId, question, answer, questionType, source } = req.body;
        if (!topicId || !question || !answer) {
            return res.status(400).send('topicId, question, and answer are required');
        }
        try {
            const newQAPair = await this.qaService.create({ topicId, question, answer, questionType, source });
            res.status(201).json(newQAPair);
        }
        catch (error) {
            console.error('Error creating Q&A pair:', error);
            res.status(500).send(error.message || 'Internal Server Error');
        }
    };
    updateQAPair = async (req, res) => {
        const { id } = req.params;
        const { question, answer, questionType, source } = req.body; // topicId is not updatable here
        if (!question && !answer && !questionType && !source) {
            return res.status(400).send('At least one field to update is required');
        }
        try {
            const [affectedCount] = await this.qaService.update(Number(id), { question, answer, questionType, source });
            if (affectedCount === 0) {
                return res.status(404).send('Q&A Pair not found or no changes made');
            }
            res.status(200).json({ message: 'Q&A Pair updated successfully' });
        }
        catch (error) {
            console.error(`Error updating Q&A pair ${id}:`, error);
            res.status(500).send(error.message || 'Internal Server Error');
        }
    };
    deleteQAPair = async (req, res) => {
        const { id } = req.params;
        try {
            const affectedCount = await this.qaService.delete(Number(id));
            if (affectedCount === 0) {
                return res.status(404).send('Q&A Pair not found');
            }
            res.status(200).json({ message: 'Q&A Pair deleted successfully' });
        }
        catch (error) {
            console.error(`Error deleting Q&A pair ${id}:`, error);
            res.status(500).send(error.message || 'Internal Server Error');
        }
    };
    importXLSX = async (req, res) => {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const { topicId } = req.body; // topicId should be sent in the form data
        if (!topicId) {
            return res.status(400).send('topicId is required for XLSX import.');
        }
        try {
            const result = await this.qaService.bulkImportFromXlsx(Number(topicId), req.file.buffer);
            if (result.errorCount > 0) {
                return res.status(207).json(result); // Multi-Status response
            }
            res.status(201).json(result);
        }
        catch (error) {
            console.error('Error importing XLSX:', error);
            res.status(500).send(error.message || 'Error during XLSX import.');
        }
    };
}
//# sourceMappingURL=qaController.js.map