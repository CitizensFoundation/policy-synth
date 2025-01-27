// educationTypes.ts
export enum EducationType {
  HighSchool = "highschool", // Type1: High school degree or completion.
  CollegeCoursework = "collegeCoursework", // Type2: College coursework or study at a college/university.
  AssociatesDegree = "associatesDegree", // Type3: Associate's degree or equivalent.
  BachelorsDegree = "bachelorsDegree", // Type4: Bachelor's degree or equivalent.
  MastersDegree = "mastersDegree", // Type5: Master's degree or equivalent.
  DoctoralDegree = "doctoralDegree"
}


export const EducationTypes: Record<EducationType, EducationTypeInfo> = {
  [EducationType.HighSchool]: {
    code: "High school",
    phrases: ["high school degree", "high school degree completion"],
  },
  [EducationType.CollegeCoursework]: {
    code: "Some college",
    phrases: ["college coursework", "study at a college", "study at a university"],
  },
  [EducationType.AssociatesDegree]: {
    code: "Associate's degree",
    phrases: [
      "associate’s degree",
      "associate degree",
      "associates degree",
      "two-year college degree",
      "community college degree",
    ],
  },
  [EducationType.BachelorsDegree]: {
    code: "Bachelor's degree",
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
    code: "Master's degree",
    phrases: [
      "master’s degree",
      "master degree",
      "masters degree",
      "graduate degree",
      "post-bachelors degree",
    ],
  },
  [EducationType.DoctoralDegree]: {
    code: "Doctoral degree",
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
  }
};
