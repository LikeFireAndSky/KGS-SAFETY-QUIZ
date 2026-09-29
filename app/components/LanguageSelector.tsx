"use client";

import { useId } from "react";
import { LANGUAGES, isLang } from "@/lib/i18n";
import { useLanguage } from "@/app/i18n/LanguageProvider";

export default function LanguageSelector() {
  const { lang, setLang, t } = useLanguage();
  const id = useId();

  return (
    <div className="flex flex-col items-center gap-0.5">
      <label
        htmlFor={id}
        className="mb-1.5 text-[11px] font-medium text-blue-300 leading-none whitespace-nowrap"
      >
        <span aria-hidden="true">🌐</span> {t("lang.change")}
      </label>
      <select
        id={id}
        value={lang}
        onChange={(e) => {
          if (isLang(e.target.value)) setLang(e.target.value);
        }}
        className="rounded-full px-3 py-1.5 text-xs font-semibold text-blue-100 outline-none cursor-pointer focus:ring-2 focus:ring-blue-400"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(96,165,250,0.3)",
        }}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} className="text-slate-900">
            {l.flag} {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
