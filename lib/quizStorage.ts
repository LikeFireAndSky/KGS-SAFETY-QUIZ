export interface QuizCompletion {
  score: number;
  totalQuestions: number;
  completedAt: string;
}

/** 추가되는 퀴즈는 여기에 순서대로 등록 */
export const QUIZ_LIST = [
  {
    quizName: "home-gas-safety",
    label: "가정 가스 안전",
    href: "/quiz/home-gas",
  },
  // { quizName: "industrial-gas", label: "산업 가스 안전", href: "/quiz/industrial-gas" },
] as const;

export type QuizName = (typeof QUIZ_LIST)[number]["quizName"];

const STORAGE_KEY = "kgs_quiz_completions";

function load(): Record<string, QuizCompletion> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getCompletions(): Record<string, QuizCompletion> {
  return load();
}

export function markCompleted(
  quizName: string,
  score: number,
  total: number
): void {
  if (typeof window === "undefined") return;
  const data = load();
  data[quizName] = { score, totalQuestions: total, completedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * 순서 기준으로 첫 번째 미완료 퀴즈를 반환.
 * 모두 완료했으면 첫 번째 퀴즈를 반환 (다시 도전).
 */
export function getNextQuiz(): (typeof QUIZ_LIST)[number] {
  const done = load();
  return QUIZ_LIST.find((q) => !done[q.quizName]) ?? QUIZ_LIST[0];
}
