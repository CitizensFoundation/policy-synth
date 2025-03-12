// educationTypes.ts
export var EducationType;
(function (EducationType) {
    EducationType["HighSchool"] = "High school";
    EducationType["CollegeCoursework"] = "Some college";
    EducationType["AssociatesDegree"] = "Associate's degree";
    EducationType["BachelorsDegree"] = "Bachelor's degree";
    EducationType["MastersDegree"] = "Master's degree";
    EducationType["DoctoralDegree"] = "Doctoral degree";
    EducationType["None"] = "none";
})(EducationType || (EducationType = {}));
export const EducationTypes = {
    [EducationType.HighSchool]: {
        code: "High school",
        phrases: ["high school", "high school degree", "high school degree completion"],
    },
    [EducationType.CollegeCoursework]: {
        code: "Some college",
        phrases: ["some college", "college coursework", "study at a college", "study at a university"],
    },
    [EducationType.AssociatesDegree]: {
        code: "Associate's degree",
        phrases: [
            "associate’s degree",
            "associate degree",
            "associates degree",
            "two-year college degree",
            "community college degree",
            "associate's degree",
        ],
    },
    [EducationType.BachelorsDegree]: {
        code: "Bachelor's degree",
        phrases: [
            "bachelor's degree",
            "bachelor’s degree",
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
            "master's degree",
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
            "doctoral degree",
            "law degree",
            "doctor of philosophy",
            "Ph.D.",
            "Psy.D.",
            "medical degree",
            "MD",
            "dental degree",
        ],
    },
    [EducationType.None]: {
        code: "None",
        phrases: ["none", "no degree", "no degree required", "no degree needed"],
    },
};
//# sourceMappingURL=educationTypes.js.map