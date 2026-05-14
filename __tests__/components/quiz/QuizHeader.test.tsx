import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import QuizHeader from "@/app/components/quiz/QuizHeader";

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
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

describe("QuizHeader", () => {
  // ── 뒤로가기 링크 ───────────────────────────────────────
  it("기본 backHref가 '/'인 홈 링크를 렌더링한다", () => {
    render(<QuizHeader title="퀴즈 제목" index={0} total={5} />);
    expect(screen.getByRole("link", { name: "홈으로 돌아가기" })).toHaveAttribute("href", "/");
  });

  it("backHref prop이 전달되면 해당 경로로 링크된다", () => {
    render(<QuizHeader title="퀴즈 제목" index={0} total={5} backHref="/quiz" />);
    expect(screen.getByRole("link", { name: "홈으로 돌아가기" })).toHaveAttribute("href", "/quiz");
  });

  // ── 제목 ────────────────────────────────────────────────
  it("title prop이 화면에 표시된다", () => {
    render(<QuizHeader title="가정 가스 안전" index={0} total={5} />);
    expect(screen.getByText("가정 가스 안전")).toBeInTheDocument();
  });

  // ── 진행 카운터 ─────────────────────────────────────────
  it("진행 카운터가 '{index+1} / {total}' 형식으로 표시된다", () => {
    render(<QuizHeader title="제목" index={2} total={5} />);
    expect(screen.getByText("3 / 5")).toBeInTheDocument();
  });

  it("첫 번째 문제(index=0)에서 '1 / 5'가 표시된다", () => {
    render(<QuizHeader title="제목" index={0} total={5} />);
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("진행 카운터에 aria-live='polite' 속성이 있다", () => {
    render(<QuizHeader title="제목" index={0} total={5} />);
    expect(screen.getByText("1 / 5")).toHaveAttribute("aria-live", "polite");
  });

  // ── 진행 점 ─────────────────────────────────────────────
  it("total 개수만큼 진행 점이 렌더링된다", () => {
    const { container } = render(<QuizHeader title="제목" index={0} total={5} />);
    // SVG(aria-hidden)를 제외하고 div[aria-hidden]이 점 컨테이너
    const dotsWrapper = container.querySelector('div[aria-hidden="true"]');
    expect(dotsWrapper?.children.length).toBe(5);
  });

  it("진행 점 컨테이너(div)에 aria-hidden='true' 속성이 있다 (장식 요소)", () => {
    const { container } = render(<QuizHeader title="제목" index={0} total={5} />);
    expect(container.querySelector('div[aria-hidden="true"]')).toBeInTheDocument();
  });
});
