// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/quiz/[quizName]";

const mockSend = vi.fn();
vi.mock("@/lib/aws/dynamodb", () => ({
  dynamodb: { send: (...args: unknown[]) => mockSend(...args) },
  TABLES: { QUIZ: "KGS-Safety-Quiz", PARTICIPANTS: "KGS-Safety-Quiz-Participants" },
}));

const mockGetS3PresignedUrl = vi.fn();
vi.mock("@/lib/aws/s3", () => ({
  getS3PresignedUrl: (...args: unknown[]) => mockGetS3PresignedUrl(...args),
}));

const MOCK_QUIZ = {
  QuizName: "home-gas-safety",
  category: "home",
  title: "가정 가스 안전",
  createdAt: "2025-01-01T00:00:00.000Z",
  questions: [
    {
      id: 1,
      question: "Q1",
      answer: true,
      answerLabel: "O",
      explanation: "해설",
      imageKey: "home-gas-safety/Q1.webp",
    },
    {
      id: 2,
      question: "Q2",
      answer: false,
      answerLabel: "X",
      explanation: "해설2",
      // imageKey 없음
    },
  ],
};

function createReq(overrides: Partial<NextApiRequest> = {}): NextApiRequest {
  return { method: "GET", query: { quizName: "home-gas-safety" }, body: {}, headers: {}, ...overrides } as NextApiRequest;
}

function createRes() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as NextApiResponse;
}

describe("GET /api/quiz/[quizName]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetS3PresignedUrl.mockResolvedValue("https://presigned.url/Q1.webp");
  });

  // ── 메서드 검증 ─────────────────────────────────────────
  it("GET 이외의 메서드에 405를 반환한다", async () => {
    for (const method of ["POST", "PUT", "DELETE", "PATCH"]) {
      const req = createReq({ method });
      const res = createRes();
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: "Method not allowed" });
      vi.clearAllMocks();
    }
  });

  // ── 파라미터 검증 ───────────────────────────────────────
  it("quizName 없이 요청 시 400을 반환한다", async () => {
    const req = createReq({ query: {} });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "quizName 파라미터가 필요합니다." });
  });

  it("quizName이 배열이면 400을 반환한다", async () => {
    const req = createReq({ query: { quizName: ["a", "b"] } });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ── 퀴즈 없음 ───────────────────────────────────────────
  it("DynamoDB에 퀴즈가 없으면 404를 반환한다", async () => {
    mockSend.mockResolvedValue({ Item: undefined });
    const req = createReq();
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "퀴즈를 찾을 수 없습니다." });
  });

  // ── 정상 응답 ────────────────────────────────────────────
  it("퀴즈를 찾으면 200과 함께 questions 배열을 반환한다", async () => {
    mockSend.mockResolvedValue({ Item: MOCK_QUIZ });
    const req = createReq();
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(body.questions).toHaveLength(2);
  });

  it("imageKey가 있는 문항은 imageUrl(Presigned URL)을 포함한다", async () => {
    mockSend.mockResolvedValue({ Item: MOCK_QUIZ });
    mockGetS3PresignedUrl.mockResolvedValue("https://presigned.url/Q1.webp");
    const req = createReq();
    const res = createRes();
    await handler(req, res);
    const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(body.questions[0].imageUrl).toBe("https://presigned.url/Q1.webp");
  });

  it("imageKey가 없는 문항은 imageUrl이 undefined이다", async () => {
    mockSend.mockResolvedValue({ Item: MOCK_QUIZ });
    const req = createReq();
    const res = createRes();
    await handler(req, res);
    const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(body.questions[1].imageUrl).toBeUndefined();
  });

  it("imageKey가 있는 문항만큼 getS3PresignedUrl이 호출된다", async () => {
    mockSend.mockResolvedValue({ Item: MOCK_QUIZ });
    const req = createReq();
    const res = createRes();
    await handler(req, res);
    // questions[0]만 imageKey 보유
    expect(mockGetS3PresignedUrl).toHaveBeenCalledTimes(1);
    expect(mockGetS3PresignedUrl).toHaveBeenCalledWith("home-gas-safety/Q1.webp");
  });

  // ── 다국어 ──────────────────────────────────────────────
  describe("lang 파라미터", () => {
    const TRANSLATED_QUIZ = {
      ...MOCK_QUIZ,
      translations: {
        en: {
          title: "Home Gas Safety",
          questions: [
            { id: 1, question: "Q1 en", answerLabel: "O (Yes)", explanation: "Explanation en" },
            { id: 2, question: "Q2 en" }, // answerLabel·explanation 없음 → 한국어 대체
          ],
        },
      },
    };

    async function getBody(lang?: string) {
      mockSend.mockResolvedValue({ Item: TRANSLATED_QUIZ });
      const res = createRes();
      await handler(createReq({ query: { quizName: "home-gas-safety", ...(lang && { lang }) } }), res);
      expect(res.status).toHaveBeenCalledWith(200);
      return (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    }

    it("번역이 있으면 제목과 문항을 해당 언어로 덮어쓴다", async () => {
      const body = await getBody("en");
      expect(body.title).toBe("Home Gas Safety");
      expect(body.questions[0]).toMatchObject({
        question: "Q1 en",
        answerLabel: "O (Yes)",
        explanation: "Explanation en",
        answer: true,
      });
    });

    it("번역이 빠진 항목은 한국어 원문을 유지한다", async () => {
      const body = await getBody("en");
      expect(body.category).toBe("home");
      expect(body.questions[1]).toMatchObject({ question: "Q2 en", answerLabel: "X", explanation: "해설2" });
    });

    it("번역이 없는 언어나 lang 미지정 시 한국어 원문을 반환한다", async () => {
      for (const lang of ["fr", undefined]) {
        const body = await getBody(lang);
        expect(body.title).toBe("가정 가스 안전");
        expect(body.questions[0].question).toBe("Q1");
        vi.clearAllMocks();
      }
    });

    it("translations 필드는 응답에 포함하지 않는다", async () => {
      const body = await getBody("en");
      expect(body).not.toHaveProperty("translations");
    });
  });

  // ── DynamoDB 오류 ────────────────────────────────────────
  it("DynamoDB 오류 시 500을 반환한다", async () => {
    mockSend.mockRejectedValue(new Error("DB error"));
    const req = createReq();
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "퀴즈를 가져오지 못했습니다." });
  });
});
