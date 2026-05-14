// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextApiRequest, NextApiResponse } from "next";
import handler from "@/pages/api/participants/index";

const mockSend = vi.fn();
vi.mock("@/lib/aws/dynamodb", () => ({
  dynamodb: { send: (...args: unknown[]) => mockSend(...args) },
  TABLES: { QUIZ: "KGS-Safety-Quiz", PARTICIPANTS: "KGS-Safety-Quiz-Participants" },
}));

function createReq(overrides: Partial<NextApiRequest> = {}): NextApiRequest {
  return { method: "GET", query: {}, body: {}, headers: {}, ...overrides } as NextApiRequest;
}

function createRes() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as NextApiResponse;
}

const VALID_BODY = {
  name: "홍길동",
  phone: "010-1234-5678",
  address: "서울특별시 강남구 테헤란로 1",
  quizName: "home-gas-safety",
  score: 4,
  totalQuestions: 5,
};

describe("GET /api/participants", () => {
  beforeEach(() => vi.clearAllMocks());

  it("참여자 목록을 200과 함께 반환한다", async () => {
    const items = [{ "KGS-Participants-Code": "KGS-ABCD1234", name: "홍길동" }];
    mockSend.mockResolvedValue({ Items: items });
    const req = createReq({ method: "GET" });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(items);
  });

  it("Items가 없으면 빈 배열을 반환한다", async () => {
    mockSend.mockResolvedValue({ Items: undefined });
    const req = createReq({ method: "GET" });
    const res = createRes();
    await handler(req, res);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("DynamoDB 오류 시 500을 반환한다", async () => {
    mockSend.mockRejectedValue(new Error("DB error"));
    const req = createReq({ method: "GET" });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "참여자 목록을 가져오지 못했습니다." });
  });
});

describe("POST /api/participants", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── 정상 등록 ────────────────────────────────────────────
  it("유효한 데이터로 201과 참여자 객체를 반환한다", async () => {
    mockSend.mockResolvedValue({});
    const req = createReq({ method: "POST", body: VALID_BODY });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(body.name).toBe("홍길동");
    expect(body.phone).toBe("010-1234-5678");
    expect(body.quizName).toBe("home-gas-safety");
    expect(body.score).toBe(4);
    expect(body.totalQuestions).toBe(5);
  });

  it("'KGS-Participants-Code'가 'KGS-XXXXXXXX' 형식으로 생성된다", async () => {
    mockSend.mockResolvedValue({});
    const req = createReq({ method: "POST", body: VALID_BODY });
    const res = createRes();
    await handler(req, res);
    const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(body["KGS-Participants-Code"]).toMatch(/^KGS-[0-9A-F]{8}$/);
  });

  it("submittedAt이 유효한 ISO 날짜 문자열이다", async () => {
    mockSend.mockResolvedValue({});
    const req = createReq({ method: "POST", body: VALID_BODY });
    const res = createRes();
    await handler(req, res);
    const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(() => new Date(body.submittedAt)).not.toThrow();
    expect(new Date(body.submittedAt).toISOString()).toBe(body.submittedAt);
  });

  // ── 필수 항목 검증 ───────────────────────────────────────
  it("name 없으면 400을 반환한다", async () => {
    const { name: _, ...body } = VALID_BODY;
    const req = createReq({ method: "POST", body });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "필수 항목이 누락되었습니다." });
  });

  it("phone 없으면 400을 반환한다", async () => {
    const { phone: _, ...body } = VALID_BODY;
    const req = createReq({ method: "POST", body });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("address 없으면 400을 반환한다", async () => {
    const { address: _, ...body } = VALID_BODY;
    const req = createReq({ method: "POST", body });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("quizName 없으면 400을 반환한다", async () => {
    const { quizName: _, ...body } = VALID_BODY;
    const req = createReq({ method: "POST", body });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("score 없으면 400을 반환한다", async () => {
    const { score: _, ...body } = VALID_BODY;
    const req = createReq({ method: "POST", body });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("totalQuestions 없으면 400을 반환한다", async () => {
    const { totalQuestions: _, ...body } = VALID_BODY;
    const req = createReq({ method: "POST", body });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("score=0은 유효한 값으로 처리된다 (0점도 등록 가능)", async () => {
    mockSend.mockResolvedValue({});
    const req = createReq({ method: "POST", body: { ...VALID_BODY, score: 0 } });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // ── 보안: 빈 문자열 입력 ─────────────────────────────────
  it("name이 빈 문자열이면 400을 반환한다 (서버사이드 검증)", async () => {
    const req = createReq({ method: "POST", body: { ...VALID_BODY, name: "" } });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("phone이 빈 문자열이면 400을 반환한다", async () => {
    const req = createReq({ method: "POST", body: { ...VALID_BODY, phone: "" } });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("address가 빈 문자열이면 400을 반환한다", async () => {
    const req = createReq({ method: "POST", body: { ...VALID_BODY, address: "" } });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ── DynamoDB 오류 ────────────────────────────────────────
  it("DynamoDB 오류 시 500을 반환한다", async () => {
    mockSend.mockRejectedValue(new Error("DB error"));
    const req = createReq({ method: "POST", body: VALID_BODY });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "참여자 등록에 실패했습니다." });
  });
});

describe("지원하지 않는 메서드", () => {
  it("PUT 요청에 405를 반환한다", async () => {
    const req = createReq({ method: "PUT" });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: "Method not allowed" });
  });

  it("DELETE 요청에 405를 반환한다", async () => {
    const req = createReq({ method: "DELETE" });
    const res = createRes();
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });
});
