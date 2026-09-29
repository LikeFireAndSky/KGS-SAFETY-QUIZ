// @vitest-environment node
import { describe, it, expect } from "vitest";
import { LANGUAGES, MESSAGES, DEFAULT_LANG, isLang, translate, type MessageKey } from "@/lib/i18n";

const KO_KEYS = Object.keys(MESSAGES.ko) as MessageKey[];

// ── 언어 데이터베이스 ────────────────────────────────────
describe("MESSAGES", () => {
  it("LANGUAGES의 모든 언어에 번역 사전이 있다", () => {
    for (const { code } of LANGUAGES) {
      expect(MESSAGES[code]).toBeDefined();
    }
  });

  it.each(LANGUAGES.map((l) => l.code))("%s 사전은 한국어의 모든 키를 비어 있지 않게 가진다", (code) => {
    const dict = MESSAGES[code];
    expect(Object.keys(dict).sort()).toEqual([...KO_KEYS].sort());
    for (const key of KO_KEYS) {
      expect(dict[key].trim(), `${code}.${key}`).not.toBe("");
    }
  });

  it.each(LANGUAGES.map((l) => l.code))("%s 사전은 한국어와 같은 {자리표시자}를 사용한다", (code) => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of KO_KEYS) {
      expect(placeholders(MESSAGES[code][key]), `${code}.${key}`).toEqual(
        placeholders(MESSAGES.ko[key])
      );
    }
  });
});

// ── isLang ───────────────────────────────────────────────
describe("isLang", () => {
  it("지원 언어 코드만 true", () => {
    expect(isLang("en")).toBe(true);
    expect(isLang("ne")).toBe(true);
    expect(isLang("fr")).toBe(false);
    expect(isLang(null)).toBe(false);
  });

  it("기본 언어는 한국어", () => {
    expect(DEFAULT_LANG).toBe("ko");
  });
});

// ── translate ────────────────────────────────────────────
describe("translate", () => {
  it("언어별 문구를 반환한다", () => {
    expect(translate("ko", "quiz.next")).toBe("다음 문제 →");
    expect(translate("en", "quiz.next")).toBe("Next question →");
  });

  it("{자리표시자}를 값으로 치환한다", () => {
    expect(translate("ko", "result.scoreAria", { total: 5, score: 3 })).toBe("5문제 중 3개 정답");
    expect(translate("en", "home.card.questions", { n: 5 })).toBe("5 questions");
  });

  it("값이 없는 자리표시자는 그대로 둔다", () => {
    expect(translate("ko", "home.hero.line2")).toContain("{funQuiz}");
  });
});
