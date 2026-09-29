// @vitest-environment node
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { LANGUAGES } from "@/lib/i18n";
import type { Quiz } from "@/lib/types";

const SEED_FILES = [
  "db-seed/KGS-Safety-Quiz_home-gas-safety.json",
  "db-seed/KGS-Safety-Quiz_rainy-season-gas-safety.json",
  "db-seed/KGS-Safety-Quiz_restaurant-gas-safety.json",
];

const TARGET_LANGS = LANGUAGES.map((l) => l.code).filter((c) => c !== "ko");

/** DynamoDB JSON({ S }, { N }, { L }, { M } …) → 일반 객체 */
function fromDynamo(v: Record<string, unknown>): unknown {
  if ("S" in v) return v.S;
  if ("N" in v) return Number(v.N);
  if ("BOOL" in v) return v.BOOL;
  if ("L" in v) return (v.L as Record<string, unknown>[]).map(fromDynamo);
  if ("M" in v) return unmarshall(v.M as Record<string, Record<string, unknown>>);
  throw new Error(`unsupported type: ${JSON.stringify(v)}`);
}

function unmarshall(item: Record<string, Record<string, unknown>>) {
  return Object.fromEntries(Object.entries(item).map(([k, v]) => [k, fromDynamo(v)]));
}

describe.each(SEED_FILES)("%s 번역", (file) => {
  const quiz = unmarshall(JSON.parse(readFileSync(join(process.cwd(), file), "utf8"))) as unknown as Quiz;

  it.each(TARGET_LANGS)("%s: 제목·카테고리·설명이 있다", (lang) => {
    const tr = quiz.translations?.[lang];
    expect(tr?.title).toBeTruthy();
    expect(tr?.category).toBeTruthy();
    expect(tr?.description).toBeTruthy();
  });

  it.each(TARGET_LANGS)("%s: 모든 문항을 번역하고 O/X가 원문과 같다", (lang) => {
    const trQuestions = quiz.translations?.[lang]?.questions ?? [];
    expect(trQuestions.map((q) => q.id).sort()).toEqual(quiz.questions.map((q) => q.id).sort());

    for (const q of quiz.questions) {
      const tq = trQuestions.find((t) => t.id === q.id)!;
      expect(tq.question, `${lang} Q${q.id}`).toBeTruthy();
      expect(tq.explanation, `${lang} Q${q.id}`).toBeTruthy();
      expect(tq.answerLabel?.[0], `${lang} Q${q.id}`).toBe(q.answerLabel[0]);
      expect(tq.answerLabel?.[0]).toBe(q.answer ? "O" : "X");
    }
  });
});
