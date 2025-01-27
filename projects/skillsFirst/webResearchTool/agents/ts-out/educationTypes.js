// educationTypes.ts
export var EducationType;
(function (EducationType) {
    EducationType["HighSchool"] = "highschool";
    EducationType["CollegeCoursework"] = "collegeCoursework";
    EducationType["AssociatesDegree"] = "associatesDegree";
    EducationType["BachelorsDegree"] = "bachelorsDegree";
    EducationType["MastersDegree"] = "mastersDegree";
    EducationType["DoctoralDegree"] = "doctoralDegree";
})(EducationType || (EducationType = {}));
export const EducationTypes = {
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
//# sourceMappingURL=educationTypes.js.map