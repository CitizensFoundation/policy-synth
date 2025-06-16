import { BaseController } from '@policysynth/api/controllers/baseController.js';
import { Topic } from '../models/topic.model.js'; // Assuming model exists
import { authMiddleware, roleGuard } from '../middlewares/authMiddleware.js';
export class TopicController extends BaseController {
    path = '/api/topics';
    constructor(wsClients) {
        super(wsClients);
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Public route to get all topics (or filter by query params)
        this.router.get(this.path, this.listTopics);
        // Public route to get a single topic by ID or slug
        this.router.get(`${this.path}/:idOrSlug`, this.getTopic);
        // Protected routes for admins
        this.router.post(this.path, authMiddleware, roleGuard('admin'), this.createTopic);
        this.router.put(`${this.path}/:id`, authMiddleware, roleGuard('admin'), this.updateTopic);
        this.router.delete(`${this.path}/:id`, authMiddleware, roleGuard('admin'), this.deleteTopic);
    }
    listTopics = async (req, res) => {
        try {
            // TODO: Add pagination, filtering (e.g., by language)
            const topics = await Topic.findAll();
            res.status(200).json(topics);
        }
        catch (error) {
            console.error('Error listing topics:', error);
            res.status(500).send('Internal Server Error');
        }
    };
    getTopic = async (req, res) => {
        const { idOrSlug } = req.params;
        try {
            // Attempt to convert idOrSlug to a number for ID-based search
            const id = parseInt(idOrSlug, 10);
            let topic;
            if (!isNaN(id)) {
                topic = await Topic.findByPk(id);
            }
            if (!topic) {
                // If not found by ID, or if idOrSlug was not a number, search by slug
                topic = await Topic.findOne({ where: { slug: idOrSlug } });
            }
            if (!topic) {
                return res.status(404).send('Topic not found');
            }
            res.status(200).json(topic);
        }
        catch (error) {
            console.error(`Error getting topic ${idOrSlug}:`, error);
            res.status(500).send('Internal Server Error');
        }
    };
    createTopic = async (req, res) => {
        try {
            const { title, slug, description, language } = req.body;
            if (!title || !slug) {
                return res.status(400).send('Missing required fields: title and slug');
            }
            const newTopic = await Topic.create({ title, slug, description, language });
            res.status(201).json(newTopic);
        }
        catch (error) { // Added :any to error for broader compatibility in catch
            // Check if the error is a Sequelize UniqueConstraintError
            if (error.name === 'SequelizeUniqueConstraintError') { // Check by error.name
                console.error('Error creating topic (Unique Constraint):', error);
                return res.status(409).send('Topic with this slug already exists.'); // 409 Conflict
            }
            console.error('Error creating topic:', error);
            res.status(500).send('Internal Server Error');
        }
    };
    updateTopic = async (req, res) => {
        const { id } = req.params;
        const { title, slug, description, language } = req.body;
        try {
            const topicId = parseInt(id, 10);
            if (isNaN(topicId)) {
                return res.status(400).send('Invalid topic ID');
            }
            const topic = await Topic.findByPk(topicId);
            if (!topic) {
                return res.status(404).send('Topic not found');
            }
            // Prepare update data, excluding undefined fields to avoid overwriting with null
            const updateData = {}; // Let TypeScript infer the type
            if (title !== undefined)
                updateData.title = title; // Use type assertion for assignment
            if (slug !== undefined)
                updateData.slug = slug;
            if (description !== undefined)
                updateData.description = description;
            if (language !== undefined)
                updateData.language = language;
            // Only update if there is data to update
            if (Object.keys(updateData).length === 0) {
                return res.status(400).send('No update data provided');
            }
            await topic.update(updateData);
            res.status(200).json(topic); // Return the updated topic
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') { // Check by error.name
                console.error('Error updating topic (Unique Constraint):', error);
                return res.status(409).send('Topic with this slug already exists.'); // 409 Conflict
            }
            console.error(`Error updating topic ${id}:`, error);
            res.status(500).send('Internal Server Error');
        }
    };
    deleteTopic = async (req, res) => {
        // TODO: Implement topic deletion logic
        res.status(501).send('Not Implemented');
    };
}
//# sourceMappingURL=topicController.js.map