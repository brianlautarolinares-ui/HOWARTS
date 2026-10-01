"use client";

import { FormEvent, useState } from "react";

type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
};

type QuizResult = {
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  passingPercent: number;
  passed: boolean;
};

export function QuizAttemptForm({ quizId, questions }: { quizId: string; questions: QuizQuestion[] }) {
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const answers = Object.fromEntries(formData.entries());
    try {
      const response = await fetch(`/api/quizzes/${quizId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });
      const data: unknown = await response.json();
      if (!response.ok) {
        const message = typeof data === "object" && data !== null && "error" in data
          ? String((data as { error: unknown }).error)
          : "No se pudo enviar la evaluación.";
        setError(message);
        return;
      }
      setResult(data as QuizResult);
    } catch {
      setError("No se pudo conectar con el servidor. Intentá nuevamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5 border-t border-slate-200 pt-4">
      <h4 className="font-semibold">Evaluación</h4>
      <form onSubmit={handleSubmit} className="mt-4 space-y-5">
        {questions.map((question, index) => (
          <fieldset key={question.id} className="space-y-2">
            <legend className="font-medium">{index + 1}. {question.prompt}</legend>
            {question.choices.map((choice) => (
              <label key={choice} className="flex items-start gap-2 py-1 text-sm">
                <input required type="radio" name={question.id} value={choice} className="mt-1 accent-brand" />
                <span>{choice}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <button disabled={submitting} type="submit" className="rounded-md bg-brand px-4 py-2 font-semibold text-white disabled:opacity-50">
          {submitting ? "Enviando…" : "Enviar evaluación"}
        </button>
      </form>
      {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}
      {result ? (
        <p role="status" className="mt-4 border-l-4 border-brand bg-paper p-3 text-sm" aria-live="polite">
          {result.passed ? "Aprobada" : "Podés volver a intentarlo"}: {result.scorePercent}% ({result.correctCount} de {result.totalQuestions}).
          {" "}Mínimo para aprobar: {result.passingPercent}%.
        </p>
      ) : null}
    </div>
  );
}