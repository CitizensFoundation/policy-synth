import { QAPair } from '../models/qaPair.model';
import { Topic } from '../models/topic.model';
import XLSX from 'xlsx';
export class QaService {
    async list(topicId, page = 1, pageSize = 20) {
        const offset = (page - 1) * pageSize;
        const where = {};
        if (topicId) {
            where.topicId = topicId;
        }
        return QAPair.findAndCountAll({
            where,
            limit: pageSize,
            offset,
            include: [Topic], // Include Topic info if needed
            order: [['createdAt', 'DESC']]
        });
    }
    async findById(id) {
        return QAPair.findByPk(id, { include: [Topic] });
    }
    async create(data) {
        const qaPair = await QAPair.create(data);
        // Trigger vector sync asynchronously (don't wait)
        // vectorSyncService.upsertEmbedding(qaPair.id).catch(console.error);
        return qaPair;
    }
    async update(id, data) {
        // Exclude topicId from update data if present, as it shouldn't change?
        const { topicId, ...updateData } = data;
        const result = await QAPair.update(updateData, { where: { id } });
        if (result[0] > 0) {
            // Trigger vector sync asynchronously
            // vectorSyncService.upsertEmbedding(id).catch(console.error);
        }
        return result;
    }
    async delete(id) {
        const result = await QAPair.destroy({ where: { id } });
        if (result > 0) {
            // Trigger vector removal asynchronously
            // vectorSyncService.removeEmbedding(id).catch(console.error);
        }
        return result;
    }
    async bulkImportFromXlsx(topicId, fileBuffer) {
        console.log(`Starting XLSX import for topic ${topicId}`);
        let successCount = 0;
        let errorCount = 0;
        const errors = [];
        let rows = []; // Initialize rows
        try {
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Assign here
            console.log(`Found ${rows.length} rows in XLSX.`);
            for (const [index, row] of rows.entries()) {
                const [question, answer] = row;
                if (!question || !answer) {
                    console.warn(`Skipping row ${index + 1}: Empty question or answer.`);
                    errors.push(`Row ${index + 1}: Empty question or answer.`);
                    errorCount++;
                    continue;
                }
                try {
                    await this.create({
                        topicId,
                        question: String(question).trim(),
                        answer: String(answer).trim(),
                        source: 'XLSX Import', // Set source
                        // Default questionType or parse from another column if available
                    });
                    successCount++;
                }
                catch (err) {
                    console.error(`Error importing row ${index + 1}: ${err.message}`);
                    errors.push(`Row ${index + 1}: ${err.message}`);
                    errorCount++;
                }
            }
            console.log(`XLSX import completed for topic ${topicId}. Success: ${successCount}, Errors: ${errorCount}`);
        }
        catch (err) {
            console.error(`Fatal error during XLSX import: ${err.message}`);
            errors.push(`Fatal error during import: ${err.message}`);
            // errorCount is now correctly calculated whether rows was populated or not
            errorCount = (rows && rows.length > 0) ? rows.length - successCount : errorCount + 1; // Adjust error count
        }
        return { successCount, errorCount, errors };
    }
}
//# sourceMappingURL=qaService.js.map