// educationTypes.ts

import { EducationType, EducationTypeInfo } from './types';

export const EducationTypes: Record<EducationType, EducationTypeInfo> = {
  [EducationType.HighSchool]: {
    code: "Type1",
    phrases: ["high school degree", "high school degree completion"],
  },
  [EducationType.CollegeCoursework]: {
    code: "Type2",
    phrases: ["college coursework", "study at a college", "study at a university"],
  },
  [EducationType.AssociatesDegree]: {
    code: "Type3",
    phrases: [
      "associate’s degree",
      "associate degree",
      "associates degree",
      "two-year college degree",
      "community college degree",
    ],
  },
  [EducationType.BachelorsDegree]: {
    code: "Type4",
    phrases: [
      "bachelor's degree",
      "bachelor degree",
      "bachelors degree",
      "college degree",
      "university degree",
      "four-year college degree",
    ],
  },
  [EducationType.MastersDegree]: {
    code: "Type5",
    phrases: [
      "master’s degree",
      "master degree",
      "masters degree",
      "graduate degree",
      "post-bachelors degree",
    ],
  },
  [EducationType.DoctoralDegree]: {
    code: "Type6",
    phrases: [
      "juris doctor",
      "law degree",
      "doctor of philosophy",
      "Ph.D.",
      "Psy.D.",
      "medical degree",
      "MD",
      "dental degree",
    ],
  },
};