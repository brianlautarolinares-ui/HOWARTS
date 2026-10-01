import { describe, expect, it } from "vitest";
import { gradeQuiz } from "./quiz-scoring";

describe("gradeQuiz", () => {
  const questions = [
    { id: "one", correctAnswer: "Opción A" },
    { id: "two", correctAnswer: "Opción B" }
  ];

  it("calculates a rounded percentage without case sensitivity", () => {
    expect(gradeQuiz(questions, { one: " opción a ", two: "incorrecta" })).toEqual({
      scorePercent: 50,
      correctCount: 1
    });
  });

  it("returns zero for an empty assessment", () => {
    expect(gradeQuiz([], {})).toEqual({ scorePercent: 0, correctCount: 0 });
  });
});