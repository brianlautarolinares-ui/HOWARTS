export type ScorableQuestion = {
  id: string;
  correctAnswer: string;
};

export function gradeQuiz(questions: ScorableQuestion[], answers: Record<string, string>) {
  if (questions.length === 0) return { scorePercent: 0, correctCount: 0 };

  const correctCount = questions.reduce((total, question) => (
    answers[question.id]?.trim().toLocaleLowerCase() === question.correctAnswer.trim().toLocaleLowerCase()
      ? total + 1
      : total
  ), 0);

  return {
    scorePercent: Math.round((correctCount / questions.length) * 100),
    correctCount
  };
}