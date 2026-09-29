"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/app/i18n/LanguageProvider";
import LanguageSelector from "@/app/components/LanguageSelector";

interface Props {
  title: string;
  index: number;
  total: number;
  backHref?: string;
}

export default function QuizHeader({
  title,
  index,
  total,
  backHref = "/",
}: Props) {
  const { t } = useLanguage();

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(15,23,42,0.6)",
        }}
      >
        <Link
          href={backHref}
          className="flex items-center gap-2 text-sm text-blue-300 hover:text-white transition-colors"
          aria-label={t("quiz.backAria")}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t("quiz.back")}
        </Link>

        <span className="text-sm font-bold text-white">{title}</span>

        <LanguageSelector />
      </motion.header>

      {/* Progress dots + 진행 카운터 */}
      <div className="px-5 pt-4 pb-1 shrink-0 flex items-center gap-3">
        <div className="flex flex-1 gap-1.5 mb-1" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <motion.div
              key={i}
              className="h-1.5 flex-1 rounded-full"
              animate={{
                background:
                  i < index
                    ? "rgb(34,197,94)"
                    : i === index
                    ? "rgb(249,115,22)"
                    : "rgba(255,255,255,0.12)",
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
        <span
          className="text-sm font-semibold text-blue-300 shrink-0"
          aria-live="polite"
        >
          {index + 1} / {total}
        </span>
      </div>
    </>
  );
}
