import { describe, it, expect, beforeEach } from "vitest";
import {
  markCompleted,
  getCompletions,
  getNextQuiz,
  QUIZ_LIST,
} from "@/lib/quizStorage";

const STORAGE_KEY = "kgs_quiz_completions";

beforeEach(() => {
  localStorage.clear();
});

// ── markCompleted ────────────────────────────────────────
describe("markCompleted", () => {
  it("퀴즈 완료 정보를 localStorage에 저장한다", () => {
    markCompleted("home-gas-safety", 4, 5);
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(data["home-gas-safety"].score).toBe(4);
    expect(data["home-gas-safety"].totalQuestions).toBe(5);
  });

  it("completedAt이 ISO 날짜 형식으로 저장된다", () => {
    markCompleted("home-gas-safety", 5, 5);
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(() => new Date(data["home-gas-safety"].completedAt)).not.toThrow();
  });

  it("여러 퀴즈 완료 정보를 중복 없이 저장한다", () => {
    markCompleted("quiz-a", 3, 5);
    markCompleted("quiz-b", 5, 5);
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(Object.keys(data)).toHaveLength(2);
  });

  it("같은 퀴즈를 다시 완료하면 점수가 덮어씌워진다", () => {
    markCompleted("home-gas-safety", 2, 5);
    markCompleted("home-gas-safety", 5, 5);
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(data["home-gas-safety"].score).toBe(5);
  });
});

// ── getCompletions ───────────────────────────────────────
describe("getCompletions", () => {
  it("저장된 데이터가 없으면 빈 객체를 반환한다", () => {
    expect(getCompletions()).toEqual({});
  });

  it("저장된 완료 이력을 반환한다", () => {
    markCompleted("home-gas-safety", 3, 5);
    const completions = getCompletions();
    expect(completions["home-gas-safety"]).toBeDefined();
    expect(completions["home-gas-safety"].score).toBe(3);
  });

  it("localStorage가 손상돼도 크래시 없이 빈 객체를 반환한다", () => {
    localStorage.setItem(STORAGE_KEY, "invalid_json");
    expect(getCompletions()).toEqual({});
  });
});

// ── getNextQuiz ──────────────────────────────────────────
describe("getNextQuiz", () => {
  it("미완료 퀴즈가 있으면 첫 번째 미완료 퀴즈를 반환한다", () => {
    const next = getNextQuiz();
    expect(next.quizName).toBe(QUIZ_LIST[0].quizName);
  });

  it("모든 퀴즈를 완료했으면 첫 번째 퀴즈로 돌아간다 (다시 도전)", () => {
    QUIZ_LIST.forEach((q) => markCompleted(q.quizName, 5, 5));
    const next = getNextQuiz();
    expect(next.quizName).toBe(QUIZ_LIST[0].quizName);
  });

  it("반환된 퀴즈에 href가 있다", () => {
    const next = getNextQuiz();
    expect(next.href).toBeTruthy();
  });
});
