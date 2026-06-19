export const getLetterGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 33) return "D";
  return "F";
};

export const getPassFail = (percentage) => {
  return percentage >= 33 ? "Pass" : "Fail";
};

export const calculateSubjectStats = (sub) => {
  let obtained = 0;
  let max = 0;

  if (sub.midTerm) {
    obtained += sub.midTerm.marksObtained;
    max += sub.midTerm.maxMarks;
  }

  if (sub.endTerm) {
    obtained += sub.endTerm.marksObtained;
    max += sub.endTerm.maxMarks;
  }

  const percentage = max ? (obtained / max) * 100 : 0;

  return {
    ...sub,
    marksObtained: obtained,
    maxMarks: max,
    percentage,
    grade: getLetterGrade(percentage),
  };
};

export const processResultSubjects = (subjects) => {
  let totalObtained = 0;
  let totalMax = 0;

  const processedSubjects = subjects.map((sub) => {
    const stats = calculateSubjectStats(sub);
    totalObtained += stats.marksObtained;
    totalMax += stats.maxMarks;

    return {
      subject: sub.subject,
      midTerm: sub.midTerm,
      endTerm: sub.endTerm,
      grade: stats.grade,
    };
  });

  const percentage = totalMax ? (totalObtained / totalMax) * 100 : 0;

  return {
    subjects: processedSubjects,
    totalMarks: totalObtained,
    percentage,
    grade: getLetterGrade(percentage),
    result: getPassFail(percentage),
  };
};
