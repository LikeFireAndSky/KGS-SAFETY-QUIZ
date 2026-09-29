"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  DEFAULT_LANG,
  isLang,
  translate,
  type Lang,
  type MessageKey,
  type TranslateVars,
} from "@/lib/i18n";

const STORAGE_KEY = "kgs_lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, vars?: TranslateVars) => string;
}

// Provider 밖(테스트 등)에서는 한국어로 동작
const LanguageContext = createContext<LanguageContextValue>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key, vars) => translate(DEFAULT_LANG, key, vars),
});

/* ── 언어 저장소 (localStorage, 접근 불가 시 메모리) ─────── */
const listeners = new Set<() => void>();
let memoryLang: Lang | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 사용자가 직접 고른 언어, 없으면 기본 언어(한국어) */
function getSnapshot(): Lang {
  let saved: string | null = memoryLang;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    // localStorage 접근 불가 시 메모리 값 사용
  }
  return isLang(saved) ? saved : DEFAULT_LANG;
}

// 서버 렌더링과 hydration은 항상 기본 언어
function getServerSnapshot(): Lang {
  return DEFAULT_LANG;
}

function setLang(next: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    memoryLang = next;
  }
  listeners.forEach((l) => l());
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
