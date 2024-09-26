import { EducationType } from './types';
import jobDescriptionsData from './stateTitlesNJJobDescriptions.json';
const stateTitlesNJJobDescriptions = jobDescriptionsData.map((job) => ({
    ...job,
    classification: EducationType[job.classification],
}));
export default stateTitlesNJJobDescriptions;
//# sourceMappingURL=stateTitlesNJJobDescriptions.js.map