export const DEFAULT_GRADING_RULES = [
  { name: 'A+', minPercentage: 90, maxPercentage: 100, grade: 'A+', gradePoint: 4.0, isPassing: true, description: 'Outstanding' },
  { name: 'A', minPercentage: 80, maxPercentage: 89.99, grade: 'A', gradePoint: 3.7, isPassing: true, description: 'Excellent' },
  { name: 'B+', minPercentage: 75, maxPercentage: 79.99, grade: 'B+', gradePoint: 3.3, isPassing: true, description: 'Very Good' },
  { name: 'B', minPercentage: 70, maxPercentage: 74.99, grade: 'B', gradePoint: 3.0, isPassing: true, description: 'Good' },
  { name: 'C+', minPercentage: 60, maxPercentage: 69.99, grade: 'C+', gradePoint: 2.7, isPassing: true, description: 'Above Average' },
  { name: 'C', minPercentage: 50, maxPercentage: 59.99, grade: 'C', gradePoint: 2.0, isPassing: true, description: 'Average' },
  { name: 'D', minPercentage: 40, maxPercentage: 49.99, grade: 'D', gradePoint: 1.0, isPassing: true, description: 'Pass' },
  { name: 'F', minPercentage: 0, maxPercentage: 39.99, grade: 'F', gradePoint: 0.0, isPassing: false, description: 'Fail' },
];

/**
 * Determine grade, gradePoint, and pass status based on percentage and rules.
 * @param {number} percentage 
 * @param {Array} rules (sorted or unsorted array of rules)
 */
export function calculateGradeFromRules(percentage, rules = DEFAULT_GRADING_RULES) {
  const roundedPercent = Math.round(percentage * 100) / 100;
  
  // Sort rules descending by minPercentage
  const sorted = [...rules].sort((a, b) => b.minPercentage - a.minPercentage);

  for (const rule of sorted) {
    if (roundedPercent >= rule.minPercentage && roundedPercent <= rule.maxPercentage) {
      return {
        grade: rule.grade,
        gradePoint: rule.gradePoint,
        isPassing: rule.isPassing,
        description: rule.description,
      };
    }
  }

  // Fallback if not matched
  const lowest = sorted[sorted.length - 1];
  return {
    grade: lowest ? lowest.grade : 'F',
    gradePoint: lowest ? lowest.gradePoint : 0,
    isPassing: lowest ? lowest.isPassing : false,
    description: lowest ? lowest.description : 'Fail',
  };
}

/**
 * Calculate full exam result for a student given their subject marks and maxMarks.
 * @param {Array<{ subjectId: string, marksObtained: number, maxMarks: number, passingMarks?: number, isAbsent?: boolean }>} subjectMarks 
 * @param {Array} gradingRules 
 */
export function evaluateExamResult(subjectMarks, gradingRules = DEFAULT_GRADING_RULES) {
  let totalMarksObtained = 0;
  let totalMaxMarks = 0;
  let hasFailedSubject = false;

  const processedSubjects = subjectMarks.map((sm) => {
    const maxMarks = Number(sm.maxMarks) || 100;
    const isAbsent = Boolean(sm.isAbsent);
    const marksObtained = isAbsent ? 0 : Number(sm.marksObtained);

    if (marksObtained > maxMarks) {
      throw new Error(`Marks obtained (${marksObtained}) cannot exceed maximum marks (${maxMarks}) for subject ${sm.subject || sm.subjectId}`);
    }

    const subPercent = maxMarks > 0 ? (marksObtained / maxMarks) * 100 : 0;
    const subGrade = calculateGradeFromRules(subPercent, gradingRules);
    const passingMarks = sm.passingMarks !== undefined ? Number(sm.passingMarks) : (maxMarks * 0.4);

    const isSubjectPassed = !isAbsent && marksObtained >= passingMarks && subGrade.isPassing;
    if (!isSubjectPassed) {
      hasFailedSubject = true;
    }

    totalMarksObtained += marksObtained;
    totalMaxMarks += maxMarks;

    return {
      subject: sm.subject || sm.subjectId,
      marksObtained,
      maxMarks,
      passingMarks,
      isAbsent,
      percentage: Math.round(subPercent * 100) / 100,
      grade: subGrade.grade,
      isPassed: isSubjectPassed,
    };
  });

  const percentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
  const overallGrade = calculateGradeFromRules(percentage, gradingRules);
  const isPassed = !hasFailedSubject && overallGrade.isPassing;

  return {
    subjects: processedSubjects,
    totalMarksObtained,
    totalMaxMarks,
    percentage: Math.round(percentage * 100) / 100,
    grade: overallGrade.grade,
    gradePoint: overallGrade.gradePoint,
    isPassed,
  };
}

