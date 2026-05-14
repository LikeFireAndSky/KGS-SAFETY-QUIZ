import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import QuizQuestion from "@/app/components/quiz/QuizQuestion";
import type { QuizQuestion as QuizQuestionType } from "@/lib/types";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    unoptimized,
    priority,
    ...rest
  }: {
    src: string;
    alt: string;
    unoptimized?: boolean;
    priority?: boolean;
    [k: string]: unknown;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      data-unoptimized={String(unoptimized ?? false)}
      data-priority={String(priority ?? false)}
      {...rest}
    />
  ),
}));

const BASE_QUESTION: QuizQuestionType = {
  id: 1,
  question: "가스 밸브는 사용 후 잠가야 한다",
  answer: true,
  answerLabel: "O (맞습니다)",
  explanation: "항상 밸브를 잠가야 합니다.",
};

describe("QuizQuestion", () => {
  // ── 이미지 소스 ─────────────────────────────────────────
  it("imageUrl이 있으면 Presigned URL을 src로 사용한다", () => {
    const q = { ...BASE_QUESTION, imageUrl: "https://s3.example.com/Q1.webp" };
    render(<QuizQuestion question={q} questionNumber={1} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://s3.example.com/Q1.webp");
  });

  it("imageUrl이 없으면 로컬 fallback 경로를 사용한다", () => {
    render(<QuizQuestion question={BASE_QUESTION} questionNumber={3} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/images/Q3.webp");
  });

  // ── unoptimized 속성 ─────────────────────────────────────
  it("imageUrl이 있으면 unoptimized=true (Next.js 최적화 비활성화)", () => {
    const q = { ...BASE_QUESTION, imageUrl: "https://s3.example.com/Q1.webp" };
    render(<QuizQuestion question={q} questionNumber={1} />);
    expect(screen.getByRole("img")).toHaveAttribute("data-unoptimized", "true");
  });

  it("imageUrl이 없으면 unoptimized=false (Next.js 최적화 활성화)", () => {
    render(<QuizQuestion question={BASE_QUESTION} questionNumber={1} />);
    expect(screen.getByRole("img")).toHaveAttribute("data-unoptimized", "false");
  });

  // ── alt 텍스트 ───────────────────────────────────────────
  it("이미지 alt가 '문제 {questionNumber} 관련 이미지' 형식이다", () => {
    render(<QuizQuestion question={BASE_QUESTION} questionNumber={2} />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", "문제 2 관련 이미지");
  });

  // ── 문제 번호 배지 ──────────────────────────────────────
  it("'Q{questionNumber}' 배지가 표시된다", () => {
    render(<QuizQuestion question={BASE_QUESTION} questionNumber={4} />);
    expect(screen.getByText("Q4")).toBeInTheDocument();
  });

  // ── 문제 텍스트 ─────────────────────────────────────────
  it("question 텍스트가 화면에 표시된다", () => {
    render(<QuizQuestion question={BASE_QUESTION} questionNumber={1} />);
    expect(screen.getByText("가스 밸브는 사용 후 잠가야 한다")).toBeInTheDocument();
  });

  it("priority=true 속성이 이미지에 전달된다", () => {
    render(<QuizQuestion question={BASE_QUESTION} questionNumber={1} />);
    expect(screen.getByRole("img")).toHaveAttribute("data-priority", "true");
  });
});
