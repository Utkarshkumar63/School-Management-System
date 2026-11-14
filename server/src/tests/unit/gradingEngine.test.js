import { describe, it, expect } from '@jest/globals';
import { calculateGradeFromRules, evaluateExamResult } from '../../utils/gradingEngine.js';

describe('Unit Test: Grading Engine & Rules Calculation', () => {
  const customRules = [
    { name: 'A+', minPercentage: 90, maxPercentage: 100, grade: 'A+', gradePoint: 4.0, isPassing: true, description: 'Outstanding' },
    { name: 'A', minPercentage: 80, maxPercentage: 89.99, grade: 'A', gradePoint: 3.7, isPassing: true, description: 'Excellent' },
    { name: 'B', minPercentage: 70, maxPercentage: 79.99, grade: 'B', gradePoint: 3.0, isPassing: true, description: 'Good' },
    { name: 'C', minPercentage: 50, maxPercentage: 69.99, grade: 'C', gradePoint: 2.0, isPassing: true, description: 'Average' },
    { name: 'F', minPercentage: 0, maxPercentage: 49.99, grade: 'F', gradePoint: 0.0, isPassing: false, description: 'Fail' },
  ];

  it('correctly maps percentages to grades according to configured rules', () => {
    expect(calculateGradeFromRules(95, customRules).grade).toBe('A+');
    expect(calculateGradeFromRules(90, customRules).grade).toBe('A+');
    expect(calculateGradeFromRules(85.5, customRules).grade).toBe('A');
    expect(calculateGradeFromRules(72, customRules).grade).toBe('B');
    expect(calculateGradeFromRules(55, customRules).grade).toBe('C');
    expect(calculateGradeFromRules(49, customRules).grade).toBe('F');
    expect(calculateGradeFromRules(0, customRules).grade).toBe('F');
  });

  it('calculates total marks, overall percentage, grade and pass status', () => {
    const subjectMarks = [
      { subject: 'Math', marksObtained: 85, maxMarks: 100, passingMarks: 40 },
      { subject: 'Physics', marksObtained: 90, maxMarks: 100, passingMarks: 40 },
      { subject: 'English', marksObtained: 80, maxMarks: 100, passingMarks: 40 },
    ];

    const result = evaluateExamResult(subjectMarks, customRules);

    expect(result.totalMarksObtained).toBe(255);
    expect(result.totalMaxMarks).toBe(300);
    expect(result.percentage).toBe(85);
    expect(result.grade).toBe('A');
    expect(result.gradePoint).toBe(3.7);
    expect(result.isPassed).toBe(true);
  });

  it('marks student as failed if any subject marks are below passing threshold', () => {
    const subjectMarks = [
      { subject: 'Math', marksObtained: 90, maxMarks: 100, passingMarks: 40 },
      { subject: 'Physics', marksObtained: 35, maxMarks: 100, passingMarks: 40 }, // Failed subject
    ];

    const result = evaluateExamResult(subjectMarks, customRules);
    expect(result.isPassed).toBe(false);
  });

  it('marks absent student as 0 marks and failed for that subject', () => {
    const subjectMarks = [
      { subject: 'Math', marksObtained: 95, maxMarks: 100, passingMarks: 40 },
      { subject: 'Physics', marksObtained: 0, maxMarks: 100, isAbsent: true, passingMarks: 40 },
    ];

    const result = evaluateExamResult(subjectMarks, customRules);
    expect(result.subjects[1].isAbsent).toBe(true);
    expect(result.subjects[1].marksObtained).toBe(0);
    expect(result.isPassed).toBe(false);
  });

  it('throws an error if marks obtained exceeds max marks', () => {
    const invalidMarks = [
      { subject: 'Math', marksObtained: 105, maxMarks: 100 },
    ];

    expect(() => evaluateExamResult(invalidMarks, customRules)).toThrow(
      /cannot exceed maximum marks/
    );
  });
});

