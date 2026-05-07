import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OXButton from "@/app/components/quiz/OXButton";

// framer-motion 모킹 — 애니메이션 없이 일반 요소로 렌더링
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag: string) =>
        React.forwardRef(({ children, ...props }: React.ComponentPropsWithRef<"button">, ref) =>
          React.createElement(tag, { ...props, ref }, children)
        ),
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

describe("OXButton", () => {
  // ── 렌더링 ──────────────────────────────────────────────
  it("O 버튼이 'O (그렇다)' 레이블로 렌더링된다", () => {
    render(
      <OXButton isO variant="neutral" disabled={false} onClick={() => {}} />
    );
    expect(
      screen.getByRole("button", { name: "O (그렇다)" })
    ).toBeInTheDocument();
  });

  it("X 버튼이 'X (아니다)' 레이블로 렌더링된다", () => {
    render(
      <OXButton isO={false} variant="neutral" disabled={false} onClick={() => {}} />
    );
    expect(
      screen.getByRole("button", { name: "X (아니다)" })
    ).toBeInTheDocument();
  });

  // ── 클릭 이벤트 ─────────────────────────────────────────
  it("활성화 상태에서 클릭 시 onClick이 호출된다", () => {
    const onClick = vi.fn();
    render(
      <OXButton isO variant="neutral" disabled={false} onClick={onClick} />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 상태에서 클릭해도 onClick이 호출되지 않는다", () => {
    const onClick = vi.fn();
    render(
      <OXButton isO variant="neutral" disabled={true} onClick={onClick} />
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  // ── 배지 표시 ────────────────────────────────────────────
  it("correct 변형에서 체크 배지(✓)가 표시된다", () => {
    render(
      <OXButton isO variant="correct" disabled={true} onClick={() => {}} />
    );
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("correct-reveal 변형에서도 체크 배지(✓)가 표시된다", () => {
    render(
      <OXButton isO={false} variant="correct-reveal" disabled={true} onClick={() => {}} />
    );
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("wrong 변형에서 X 배지(✕)가 표시된다", () => {
    render(
      <OXButton isO variant="wrong" disabled={true} onClick={() => {}} />
    );
    expect(screen.getByText("✕")).toBeInTheDocument();
  });

  it("neutral/dimmed 변형에서는 배지가 표시되지 않는다", () => {
    render(
      <OXButton isO variant="dimmed" disabled={true} onClick={() => {}} />
    );
    expect(screen.queryByText("✓")).not.toBeInTheDocument();
    expect(screen.queryByText("✕")).not.toBeInTheDocument();
  });
});
