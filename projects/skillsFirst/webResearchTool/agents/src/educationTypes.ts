// educationTypes.ts
export enum EducationType {
  HighSchool = "highschool", // Type1: High school degree or completion.
  CollegeCoursework = "collegeCoursework", // Type2: College coursework or study at a college/university.
  AssociatesDegree = "associatesDegree", // Type3: Associate's degree or equivalent.
  BachelorsDegree = "bachelorsDegree", // Type4: Bachelor's degree or equivalent.
  MastersDegree = "mastersDegree", // Type5: Master's degree or equivalent.
  DoctoralDegree = "doctoralDegree", // Type6: Doctoral degree or equivalent.
  undefined = "undefined", // undefined
}

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
  [EducationType.undefined]: {
    code: "undefined",
    phrases: []
  }
};