import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ParticipantForm from "@/app/components/quiz/ParticipantForm";

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

vi.mock("next/script", () => ({ default: () => null }));

const mockCreate = vi.fn();
vi.mock("@/lib/api/participants", () => ({
  useCreateParticipant: () => ({
    mutate: mockCreate,
    isPending: false,
  }),
}));

const DEFAULT_PROPS = {
  quizName: "home-gas-safety",
  score: 4,
  totalQuestions: 5,
};

describe("ParticipantForm", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  // ── 렌더링 ──────────────────────────────────────────────
  it("이름, 전화번호, 주소 검색 버튼, 개인정보 체크박스가 렌더링된다", () => {
    render(<ParticipantForm {...DEFAULT_PROPS} />);
    expect(screen.getByLabelText("이름 *")).toBeInTheDocument();
    expect(screen.getByLabelText("전화번호 *")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "주소 검색" })).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /개인정보 수집·이용에 동의합니다/ })
    ).toBeInTheDocument();
  });

  it("'응모 등록하기' 제출 버튼이 렌더링된다", () => {
    render(<ParticipantForm {...DEFAULT_PROPS} />);
    expect(
      screen.getByRole("button", { name: /응모 등록하기/ })
    ).toBeInTheDocument();
  });

  // ── 필수 필드 유효성 검사 ────────────────────────────────
  it("이름이 비어있으면 에러 메시지가 표시된다", async () => {
    render(<ParticipantForm {...DEFAULT_PROPS} />);
    fireEvent.click(screen.getByRole("button", { name: /응모 등록하기/ }));
    expect(
      await screen.findByText("이름을 입력해주세요.")
    ).toBeInTheDocument();
  });

  it("이름이 1글자이면 에러 메시지가 표시된다", async () => {
    render(<ParticipantForm {...DEFAULT_PROPS} />);
    await userEvent.type(screen.getByLabelText("이름 *"), "김");
    fireEvent.click(screen.getByRole("button", { name: /응모 등록하기/ }));
    expect(
      await screen.findByText("2글자 이상 입력해주세요.")
    ).toBeInTheDocument();
  });

  it("전화번호가 비어있으면 에러 메시지가 표시된다", async () => {
    render(<ParticipantForm {...DEFAULT_PROPS} />);
    await userEvent.type(screen.getByLabelText("이름 *"), "홍길동");
    fireEvent.click(screen.getByRole("button", { name: /응모 등록하기/ }));
    expect(
      await screen.findByText("전화번호를 입력해주세요.")
    ).toBeInTheDocument();
  });

  it("개인정보 동의 미체크 시 에러 메시지가 표시된다", async () => {
    render(<ParticipantForm {...DEFAULT_PROPS} />);
    await userEvent.type(screen.getByLabelText("이름 *"), "홍길동");
    await userEvent.type(screen.getByLabelText("전화번호 *"), "010-1234-5678");
    fireEvent.click(screen.getByRole("button", { name: /응모 등록하기/ }));
    expect(
      await screen.findByText("개인정보 수집·이용에 동의해주세요.")
    ).toBeInTheDocument();
  });

  // ── 전화번호 자동 포맷 ───────────────────────────────────
  it("숫자 입력 시 010-XXXX-XXXX 형식으로 자동 포맷된다", async () => {
    render(<ParticipantForm {...DEFAULT_PROPS} />);
    const phoneInput = screen.getByLabelText("전화번호 *") as HTMLInputElement;
    await userEvent.type(phoneInput, "01012345678");
    expect(phoneInput.value).toBe("010-1234-5678");
  });

  it("잘못된 전화번호 형식이면 패턴 에러가 표시된다", async () => {
    render(<ParticipantForm {...DEFAULT_PROPS} />);
    await userEvent.type(screen.getByLabelText("전화번호 *"), "12345");
    fireEvent.click(screen.getByRole("button", { name: /응모 등록하기/ }));
    await screen.findByText("형식을 확인해주세요. (예: 010-1234-5678)");
  });

  // ── 개인정보 동의 토글 ───────────────────────────────────
  it("개인정보 안내 토글 버튼 클릭 시 내용이 표시된다", async () => {
    const user = userEvent.setup();
    render(<ParticipantForm {...DEFAULT_PROPS} />);

    // 초기: 내용이 숨겨져 있음
    expect(screen.queryByText(/수집 항목/)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /개인정보 수집·이용 동의 내용 보기/ })
    );

    // 클릭 후: 내용이 나타남
    await waitFor(() => {
      expect(screen.getByText(/수집 항목/)).toBeInTheDocument();
    });
  });

  // ── 성공 시 완료 화면 ────────────────────────────────────
  it("주소를 입력하지 않고 제출하면 주소 에러 메시지가 표시된다", async () => {
    const user = userEvent.setup();
    render(<ParticipantForm {...DEFAULT_PROPS} />);

    await user.type(screen.getByLabelText("이름 *"), "홍길동");
    await user.type(screen.getByLabelText("전화번호 *"), "01012345678");
    await user.click(
      screen.getByRole("checkbox", { name: /개인정보 수집·이용에 동의합니다/ })
    );
    await user.click(screen.getByRole("button", { name: /응모 등록하기/ }));

    // 주소 미입력 → mutate는 호출되지 않아야 함
    expect(await screen.findByText("주소를 검색해주세요.")).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
