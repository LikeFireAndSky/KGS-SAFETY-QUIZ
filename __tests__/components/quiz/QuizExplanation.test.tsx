import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuizExplanation from "@/app/components/quiz/QuizExplanation";

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag: string) =>
        React.forwardRef(
          ({ children, ...props }: React.ComponentPropsWithRef<"div">, ref) =>
            React.createElement(tag, { ...props, ref }, children)
        ),
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

const DEFAULT_PROPS = {
  isCorrect: true,
  answerLabel: "O (있습니다)",
  explanation: "가스는 환기가 필요합니다.",
  isLast: false,
  onNext: vi.fn(),
};

describe("QuizExplanation", () => {
  // ── 정답 상태 ────────────────────────────────────────────
  it("정답(isCorrect=true)일 때 '✅ 정답!'이 표시된다", () => {
    render(<QuizExplanation {...DEFAULT_PROPS} isCorrect={true} />);
    expect(screen.getByText("✅ 정답!")).toBeInTheDocument();
  });

  it("오답(isCorrect=false)일 때 '❌ 오답!'이 표시된다", () => {
    render(<QuizExplanation {...DEFAULT_PROPS} isCorrect={false} />);
    expect(screen.getByText("❌ 오답!")).toBeInTheDocument();
  });

  // ── 정답 라벨·해설 ──────────────────────────────────────
  it("answerLabel이 '정답 :' 형식으로 표시된다", () => {
    render(<QuizExplanation {...DEFAULT_PROPS} answerLabel="O (있습니다)" />);
    expect(screen.getByText("정답 : O (있습니다)")).toBeInTheDocument();
  });

  it("explanation 텍스트가 표시된다", () => {
    render(<QuizExplanation {...DEFAULT_PROPS} explanation="가스는 환기가 필요합니다." />);
    expect(screen.getByText("가스는 환기가 필요합니다.")).toBeInTheDocument();
  });

  // ── 버튼 텍스트 ─────────────────────────────────────────
  it("isLast=false이면 '다음 문제 →' 버튼이 표시된다", () => {
    render(<QuizExplanation {...DEFAULT_PROPS} isLast={false} />);
    expect(screen.getByRole("button", { name: "다음 문제 →" })).toBeInTheDocument();
  });

  it("isLast=true이면 '결과 보기 🏆' 버튼이 표시된다", () => {
    render(<QuizExplanation {...DEFAULT_PROPS} isLast={true} />);
    expect(screen.getByRole("button", { name: "결과 보기 🏆" })).toBeInTheDocument();
  });

  // ── 콜백 ────────────────────────────────────────────────
  it("버튼 클릭 시 onNext가 호출된다", () => {
    const onNext = vi.fn();
    render(<QuizExplanation {...DEFAULT_PROPS} onNext={onNext} />);
    fireEvent.click(screen.getByRole("button", { name: "다음 문제 →" }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});
