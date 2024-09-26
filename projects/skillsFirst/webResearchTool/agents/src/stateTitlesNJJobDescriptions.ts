import { OccupationalCategory, JobDescription, JobDescriptionAnalysis, EducationType } from './types';
import jobDescriptionsData from './stateTitlesNJJobDescriptions.json';

const stateTitlesNJJobDescriptions: JobDescription[] = jobDescriptionsData.map((job) => ({
  ...job,
  classification: EducationType[job.classification as keyof typeof EducationType],
}));

export default stateTitlesNJJobDescriptions;