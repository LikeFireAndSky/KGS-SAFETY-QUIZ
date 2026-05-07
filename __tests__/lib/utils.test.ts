import { describe, it, expect } from "vitest";
import { getS3ImageUrl, getBtnVariant, getGrade } from "@/lib/utils";

// ── getS3ImageUrl ────────────────────────────────────────
describe("getS3ImageUrl", () => {
  it("S3 버킷 베이스 URL을 올바르게 조합한다", () => {
    expect(getS3ImageUrl("home-gas-safety/Q1.webp")).toBe(
      "https://kgs-safety-quiz-bucket.s3.ap-northeast-2.amazonaws.com/home-gas-safety/Q1.webp"
    );
  });

  it("중첩 경로도 올바르게 처리한다", () => {
    expect(getS3ImageUrl("a/b/c.png")).toBe(
      "https://kgs-safety-quiz-bucket.s3.ap-northeast-2.amazonaws.com/a/b/c.png"
    );
  });
});

// ── getBtnVariant ────────────────────────────────────────
describe("getBtnVariant", () => {
  it("미답변 상태에서는 neutral 반환", () => {
    expect(getBtnVariant(true, false, null, true)).toBe("neutral");
    expect(getBtnVariant(false, false, null, false)).toBe("neutral");
  });

  it("정답을 선택했을 때 correct 반환", () => {
    expect(getBtnVariant(true, true, true, true)).toBe("correct");
    expect(getBtnVariant(false, true, false, false)).toBe("correct");
  });

  it("오답을 선택했을 때 wrong 반환", () => {
    // O를 눌렀는데 정답은 X
    expect(getBtnVariant(true, true, true, false)).toBe("wrong");
    // X를 눌렀는데 정답은 O
    expect(getBtnVariant(false, true, false, true)).toBe("wrong");
  });

  it("선택하지 않은 정답 버튼은 correct-reveal 반환", () => {
    // 정답 O인데 X를 눌렀을 때 O 버튼 상태
    expect(getBtnVariant(true, true, false, true)).toBe("correct-reveal");
  });

  it("선택하지 않은 오답 버튼은 dimmed 반환", () => {
    // 정답 X인데 X를 눌렀을 때 O 버튼 상태
    expect(getBtnVariant(true, true, false, false)).toBe("dimmed");
  });
});

// ── getGrade ─────────────────────────────────────────────
describe("getGrade", () => {
  it("5/5 → 가스안전 퀴즈왕!", () => {
    const g = getGrade(5, 5);
    expect(g.label).toBe("가스안전 퀴즈왕!");
    expect(g.emoji).toBe("🏆");
  });

  it("4/5 → 가스안전 전문가!", () => {
    expect(getGrade(4, 5).label).toBe("가스안전 전문가!");
  });

  it("3/5 → 훌륭해요!", () => {
    expect(getGrade(3, 5).label).toBe("훌륭해요!");
  });

  it("2/5 → 조금 더 공부해봐요", () => {
    expect(getGrade(2, 5).label).toBe("조금 더 공부해봐요");
  });

  it("1/5 → 안전 교육이 필요해요", () => {
    expect(getGrade(1, 5).label).toBe("안전 교육이 필요해요");
  });

  it("0/0 처럼 total이 0이어도 크래시 없음", () => {
    expect(() => getGrade(0, 0)).not.toThrow();
  });
});
