import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuizShell from "@/app/components/quiz/QuizShell";
import { useQuiz } from "@/lib/api/quiz";

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

vi.mock("next/image", () => ({
  default: ({ src, alt, ...rest }: { src: string; alt: string; [k: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...rest} />
  ),
}));

vi.mock("@/lib/api/quiz", () => ({ useQuiz: vi.fn() }));

const mockMarkCompleted = vi.fn();
vi.mock("@/lib/quizStorage", () => ({
  markCompleted: (...args: unknown[]) => mockMarkCompleted(...args),
}));

// QuizResult는 별도 테스트 — 여기서는 재시작 버튼만 노출
vi.mock("@/app/components/quiz/QuizResult", () => ({
  default: ({ onRestart }: { onRestart: () => void }) => (
    <div data-testid="quiz-result">
      <button onClick={onRestart}>다시 시작</button>
    </div>
  ),
}));

const MOCK_QUIZ = {
  QuizName: "home-gas-safety",
  category: "home",
  title: "가정 가스 안전",
  createdAt: "2025-01-01T00:00:00.000Z",
  questions: [
    {
      id: 1,
      question: "Q1 질문",
      answer: true,
      answerLabel: "O (있습니다)",
      explanation: "해설 1",
      imageUrl: "https://s3.example.com/Q1.webp",
    },
    {
      id: 2,
      question: "Q2 질문",
      answer: false,
      answerLabel: "X (안 됩니다)",
      explanation: "해설 2",
      imageUrl: "https://s3.example.com/Q2.webp",
    },
  ],
};

const mockRefetch = vi.fn();

function setupQuiz(overrides = {}) {
  (useQuiz as ReturnType<typeof vi.fn>).mockReturnValue({
    data: MOCK_QUIZ,
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
    ...overrides,
  });
}

let imageInstances: { src: string }[] = [];

describe("QuizShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    imageInstances = [];
    class FakeImage {
      src = "";
      constructor() {
        imageInstances.push(this);
      }
    }
    vi.stubGlobal("Image", FakeImage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── 로딩 상태 ────────────────────────────────────────────
  it("로딩 중에는 스피너(aria-label='로딩 중')가 표시된다", () => {
    (useQuiz as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    });
    render(<QuizShell quizName="home-gas-safety" />);
    expect(screen.getByLabelText("로딩 중")).toBeInTheDocument();
  });

  // ── 에러 상태 ────────────────────────────────────────────
  it("오류 발생 시 에러 메시지와 '다시 시도' 버튼이 표시된다", () => {
    (useQuiz as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });
    render(<QuizShell quizName="home-gas-safety" />);
    expect(screen.getByText("퀴즈를 불러오지 못했습니다.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("'다시 시도' 버튼 클릭 시 refetch가 호출된다", () => {
    (useQuiz as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });
    render(<QuizShell quizName="home-gas-safety" />);
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  // ── 이미지 프리로드 ─────────────────────────────────────
  it("퀴즈 로드 시 모든 imageUrl을 프리로드한다", () => {
    setupQuiz();
    render(<QuizShell quizName="home-gas-safety" />);
    expect(imageInstances).toHaveLength(MOCK_QUIZ.questions.length);
    const srcs = imageInstances.map((o) => o.src);
    expect(srcs).toContain("https://s3.example.com/Q1.webp");
    expect(srcs).toContain("https://s3.example.com/Q2.webp");
  });

  // ── 정상 렌더링 ──────────────────────────────────────────
  it("첫 번째 문제가 화면에 표시된다", () => {
    setupQuiz();
    render(<QuizShell quizName="home-gas-safety" />);
    expect(screen.getByText("Q1 질문")).toBeInTheDocument();
  });

  // ── 정답 선택 ────────────────────────────────────────────
  it("정답(O) 클릭 시 '✅ 정답!' 해설이 표시된다", async () => {
    setupQuiz();
    render(<QuizShell quizName="home-gas-safety" />);
    await userEvent.click(screen.getByRole("button", { name: "O (그렇다)" }));
    expect(screen.getByText("✅ 정답!")).toBeInTheDocument();
    expect(screen.getByText("해설 1")).toBeInTheDocument();
  });

  it("오답(X) 클릭 시 '❌ 오답!' 해설이 표시된다", async () => {
    setupQuiz();
    render(<QuizShell quizName="home-gas-safety" />);
    // Q1 answer=true, X를 누르면 오답
    await userEvent.click(screen.getByRole("button", { name: "X (아니다)" }));
    expect(screen.getByText("❌ 오답!")).toBeInTheDocument();
  });

  // ── 이중 답변 방지 ───────────────────────────────────────
  it("답변 후 O/X 버튼이 비활성화된다", async () => {
    setupQuiz();
    render(<QuizShell quizName="home-gas-safety" />);
    await userEvent.click(screen.getByRole("button", { name: "O (그렇다)" }));
    expect(screen.getByRole("button", { name: "O (그렇다)" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "X (아니다)" })).toBeDisabled();
  });

  // ── 다음 문제 ────────────────────────────────────────────
  it("'다음 문제 →' 클릭 시 다음 문제로 이동한다", async () => {
    setupQuiz();
    render(<QuizShell quizName="home-gas-safety" />);
    await userEvent.click(screen.getByRole("button", { name: "O (그렇다)" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 문제 →" }));
    expect(screen.getByText("Q2 질문")).toBeInTheDocument();
  });

  it("다음 문제로 이동하면 버튼이 다시 활성화된다", async () => {
    setupQuiz();
    render(<QuizShell quizName="home-gas-safety" />);
    await userEvent.click(screen.getByRole("button", { name: "O (그렇다)" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 문제 →" }));
    expect(screen.getByRole("button", { name: "O (그렇다)" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "X (아니다)" })).not.toBeDisabled();
  });

  // ── 완료 처리 ────────────────────────────────────────────
  it("마지막 문제 완료 시 markCompleted가 올바른 인수로 호출된다", async () => {
    setupQuiz();
    render(<QuizShell quizName="home-gas-safety" />);
    // Q1: O(정답 true) → 정답
    await userEvent.click(screen.getByRole("button", { name: "O (그렇다)" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 문제 →" }));
    // Q2: X(정답 false) → 정답
    await userEvent.click(screen.getByRole("button", { name: "X (아니다)" }));
    await userEvent.click(screen.getByRole("button", { name: "결과 보기 🏆" }));
    expect(mockMarkCompleted).toHaveBeenCalledWith("home-gas-safety", 2, 2);
  });

  it("오답 선택 시 score가 증가하지 않는다", async () => {
    setupQuiz();
    render(<QuizShell quizName="home-gas-safety" />);
    // Q1: X(오답) → score 0
    await userEvent.click(screen.getByRole("button", { name: "X (아니다)" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 문제 →" }));
    // Q2: O(오답 — 정답은 false) → score 0
    await userEvent.click(screen.getByRole("button", { name: "O (그렇다)" }));
    await userEvent.click(screen.getByRole("button", { name: "결과 보기 🏆" }));
    expect(mockMarkCompleted).toHaveBeenCalledWith("home-gas-safety", 0, 2);
  });

  it("마지막 문제 완료 시 결과 화면이 표시된다", async () => {
    setupQuiz();
    render(<QuizShell quizName="home-gas-safety" />);
    await userEvent.click(screen.getByRole("button", { name: "O (그렇다)" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 문제 →" }));
    await userEvent.click(screen.getByRole("button", { name: "X (아니다)" }));
    await userEvent.click(screen.getByRole("button", { name: "결과 보기 🏆" }));
    expect(screen.getByTestId("quiz-result")).toBeInTheDocument();
  });

  // ── 재시작 ──────────────────────────────────────────────
  it("재시작 시 첫 번째 문제로 돌아오고 버튼이 활성화된다", async () => {
    setupQuiz();
    render(<QuizShell quizName="home-gas-safety" />);
    await userEvent.click(screen.getByRole("button", { name: "O (그렇다)" }));
    await userEvent.click(screen.getByRole("button", { name: "다음 문제 →" }));
    await userEvent.click(screen.getByRole("button", { name: "X (아니다)" }));
    await userEvent.click(screen.getByRole("button", { name: "결과 보기 🏆" }));
    await userEvent.click(screen.getByRole("button", { name: "다시 시작" }));
    expect(screen.getByText("Q1 질문")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "O (그렇다)" })).not.toBeDisabled();
  });
});
