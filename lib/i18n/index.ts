import ko, { type MessageKey, type Messages } from "./locales/ko";
import en from "./locales/en";
import zh from "./locales/zh";
import ja from "./locales/ja";
import vi from "./locales/vi";
import lo from "./locales/lo";
import ne from "./locales/ne";

export type { MessageKey, Messages };

/** 지원 언어 — 언어 추가 시 locales/에 파일을 만들고 여기와 MESSAGES에 등록 */
export const LANGUAGES = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "lo", label: "ລາວ" },
  { code: "ne", label: "नेपाली" },
] as const;

export type Lang = (typeof LANGUAGES)[number]["code"];

export const DEFAULT_LANG: Lang = "ko";

export const MESSAGES: Record<Lang, Messages> = { ko, en, zh, ja, vi, lo, ne };

export function isLang(value: unknown): value is Lang {
  return LANGUAGES.some((l) => l.code === value);
}

export type TranslateVars = Record<string, string | number>;

/** 키에 해당하는 문구를 반환. 번역이 비어 있으면 한국어로 대체하고 {name} 자리표시자를 치환 */
export function translate(lang: Lang, key: MessageKey, vars?: TranslateVars): string {
  const text = MESSAGES[lang]?.[key] || MESSAGES.ko[key];
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}
