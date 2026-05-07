import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuizResult from "@/app/components/quiz/QuizResult";
import type { QuizQuestion } from "@/lib/types";

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

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// ParticipantForm은 별도 테스트 — 여기서는 모킹
vi.mock("@/app/components/quiz/ParticipantForm", () => ({
  default: () => <div data-testid="participant-form">ParticipantForm</div>,
}));

const MOCK_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Q1 질문",
    answer: false,
    answerLabel: "X (안 됩니다)",
    explanation: "해설 1",
    imageKey: "Q1.webp",
  },
  {
    id: 2,
    question: "Q2 질문",
    answer: true,
    answerLabel: "O (있습니다)",
    explanation: "해설 2",
    imageKey: "Q2.webp",
  },
  {
    id: 3,
    question: "Q3 질문",
    answer: false,
    answerLabel: "X (위험합니다)",
    explanation: "해설 3",
    imageKey: "Q3.webp",
  },
];

describe("QuizResult", () => {
  const defaultProps = {
    score: 2,
    questions: MOCK_QUESTIONS,
    picks: [false, true, false] as (boolean | null)[],
    quizName: "home-gas-safety",
    onRestart: vi.fn(),
  };

  // ── 점수 표시 ────────────────────────────────────────────
  it("점수를 올바르게 표시한다 (aria-label)", () => {
    render(<QuizResult {...defaultProps} />);
    expect(
      screen.getByLabelText("3문제 중 2개 정답")
    ).toBeInTheDocument();
  });

  it("만점(3/3)이면 퀴즈왕 등급이 표시된다", () => {
    render(
      <QuizResult {...defaultProps} score={3} picks={[false, true, false]} />
    );
    expect(screen.getByText("가스안전 퀴즈왕!")).toBeInTheDocument();
  });

  it("0점이면 안전 교육 등급이 표시된다", () => {
    render(
      <QuizResult {...defaultProps} score={0} picks={[true, false, true]} />
    );
    expect(screen.getByText("안전 교육이 필요해요")).toBeInTheDocument();
  });

  // ── 문항별 결과 리뷰 ─────────────────────────────────────
  it("정답 문항에 ✅, 오답 문항에 ❌가 표시된다", () => {
    // picks: [false, true, false] → Q1:O, Q2:O, Q3:O
    // answers: Q1:false(X), Q2:true(O), Q3:false(X)
    // 정답: Q1(false===false ✅), Q2(true===true ✅), Q3(false===false ✅)
    render(<QuizResult {...defaultProps} score={3} picks={[false, true, false]} />);
    const correct = screen.getAllByText("✅");
    expect(correct).toHaveLength(3);
  });

  it("오답이 있으면 ❌가 표시된다", () => {
    // Q2를 틀림: answer=true, pick=false
    render(
      <QuizResult {...defaultProps} score={2} picks={[false, false, false]} />
    );
    expect(screen.getAllByText("❌")).toHaveLength(1);
  });

  it("각 문항의 정답(O/X)이 표시된다", () => {
    render(<QuizResult {...defaultProps} />);
    expect(screen.getAllByText(/정답: X/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/정답: O/).length).toBeGreaterThan(0);
  });

  // ── 액션 버튼 ────────────────────────────────────────────
  it("'다시 도전' 버튼 클릭 시 onRestart가 호출된다", () => {
    const onRestart = vi.fn();
    render(<QuizResult {...defaultProps} onRestart={onRestart} />);
    fireEvent.click(screen.getByText(/다시 도전/));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it("'홈으로' 링크가 '/'로 연결된다", () => {
    render(<QuizResult {...defaultProps} />);
    const homeLink = screen.getByRole("link", { name: /홈으로/ });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  // ── 경품 응모 버튼 ──────────────────────────────────────
  it("'경품 응모 등록하기' 버튼이 렌더링된다", () => {
    render(<QuizResult {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /경품 응모 등록하기/ })
    ).toBeInTheDocument();
  });

  it("'경품 응모 등록하기' 클릭 시 ParticipantForm이 표시된다", () => {
    render(<QuizResult {...defaultProps} />);
    fireEvent.click(
      screen.getByRole("button", { name: /경품 응모 등록하기/ })
    );
    expect(screen.getByTestId("participant-form")).toBeInTheDocument();
  });
});
