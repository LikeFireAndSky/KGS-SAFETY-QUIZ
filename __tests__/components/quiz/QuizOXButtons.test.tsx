import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuizOXButtons from "@/app/components/quiz/QuizOXButtons";

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag: string) =>
        React.forwardRef(
          ({ children, ...props }: React.ComponentPropsWithRef<"button">, ref) =>
            React.createElement(tag, { ...props, ref }, children)
        ),
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe("QuizOXButtons", () => {
  const defaultProps = {
    correctAnswer: true,
    userAnswer: null as boolean | null,
    isAnswered: false,
    onAnswer: vi.fn(),
  };

  // ── 렌더링 ──────────────────────────────────────────────
  it("O 버튼과 X 버튼이 모두 렌더링된다", () => {
    render(<QuizOXButtons {...defaultProps} />);
    expect(screen.getByRole("button", { name: "O (그렇다)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "X (아니다)" })).toBeInTheDocument();
  });

  // ── 답변 전 클릭 ────────────────────────────────────────
  it("isAnswered=false일 때 O 클릭 시 onAnswer(true)가 호출된다", () => {
    const onAnswer = vi.fn();
    render(<QuizOXButtons {...defaultProps} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole("button", { name: "O (그렇다)" }));
    expect(onAnswer).toHaveBeenCalledWith(true);
  });

  it("isAnswered=false일 때 X 클릭 시 onAnswer(false)가 호출된다", () => {
    const onAnswer = vi.fn();
    render(<QuizOXButtons {...defaultProps} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole("button", { name: "X (아니다)" }));
    expect(onAnswer).toHaveBeenCalledWith(false);
  });

  // ── 답변 후 비활성화 ────────────────────────────────────
  it("isAnswered=true이면 두 버튼 모두 disabled 상태이다", () => {
    render(
      <QuizOXButtons
        {...defaultProps}
        isAnswered={true}
        userAnswer={true}
      />
    );
    expect(screen.getByRole("button", { name: "O (그렇다)" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "X (아니다)" })).toBeDisabled();
  });

  it("isAnswered=true이면 클릭해도 onAnswer가 호출되지 않는다", () => {
    const onAnswer = vi.fn();
    render(
      <QuizOXButtons
        {...defaultProps}
        isAnswered={true}
        userAnswer={true}
        onAnswer={onAnswer}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "X (아니다)" }));
    expect(onAnswer).not.toHaveBeenCalled();
  });

  // ── 배지(variant) ────────────────────────────────────────
  it("정답을 선택한 버튼에 ✓ 배지가 표시된다", () => {
    // correctAnswer=true, userAnswer=true → O 버튼이 correct
    render(
      <QuizOXButtons
        correctAnswer={true}
        userAnswer={true}
        isAnswered={true}
        onAnswer={vi.fn()}
      />
    );
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("오답을 선택한 버튼에 ✕ 배지가 표시된다", () => {
    // correctAnswer=true, userAnswer=false → X 버튼이 wrong
    render(
      <QuizOXButtons
        correctAnswer={true}
        userAnswer={false}
        isAnswered={true}
        onAnswer={vi.fn()}
      />
    );
    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("정답 버튼(선택 안 한)에 ✓(correct-reveal) 배지가 표시된다", () => {
    // correctAnswer=true, userAnswer=false → O 버튼이 correct-reveal
    render(
      <QuizOXButtons
        correctAnswer={true}
        userAnswer={false}
        isAnswered={true}
        onAnswer={vi.fn()}
      />
    );
    // ✓ 배지가 하나 이상 있어야 함 (correct-reveal)
    expect(screen.getAllByText("✓").length).toBeGreaterThanOrEqual(1);
  });
});
