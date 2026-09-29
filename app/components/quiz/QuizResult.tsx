"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getGrade } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/types";
import { useLanguage } from "@/app/i18n/LanguageProvider";
import ParticipantForm from "./ParticipantForm";

/** 경품 응모 이벤트 진행 중인 퀴즈 (예: "rainy-season-gas-safety"). null 이면 응모 버튼 숨김 */
const RAFFLE_QUIZ_NAME: string | null = null;

interface Props {
  score: number;
  questions: QuizQuestion[];
  picks: (boolean | null)[];
  quizName: string;
  onRestart: () => void;
}

export default function QuizResult({
  score,
  questions,
  picks,
  quizName,
  onRestart,
}: Props) {
  const { t } = useLanguage();
  const total = questions.length;
  const grade = getGrade(score, total);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col items-center px-4 py-8 max-w-xl mx-auto w-full">
      {/* ── 점수 ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center mb-10"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-7xl mb-4 leading-none"
          aria-hidden="true"
        >
          {grade.emoji}
        </motion.div>

        <div
          className="text-6xl font-black mb-2"
          style={{ color: grade.color }}
          aria-label={t("result.scoreAria", { total, score })}
        >
          {score}{" "}
          <span className="text-3xl text-white/40">/ {total}</span>
        </div>
        <div className="text-xl font-bold text-white mb-3">{t(grade.labelKey)}</div>

        <div className="flex gap-1 justify-center" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="text-2xl"
              style={{ color: i < score ? "#fbbf24" : "rgba(255,255,255,0.2)" }}
            >
              ★
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* ── 문항별 결과 ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full space-y-2 mb-8"
        aria-label={t("result.listAria")}
      >
        {questions.map((q, i) => {
          const correct = picks[i] === q.answer;
          return (
            <div
              key={q.id}
              className="flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{
                background: correct
                  ? "rgba(34,197,94,0.08)"
                  : "rgba(239,68,68,0.08)",
                border: `1px solid ${
                  correct ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"
                }`,
              }}
            >
              <span aria-hidden="true" className="text-lg shrink-0">
                {correct ? "✅" : "❌"}
              </span>
              <span className="text-xs font-bold text-blue-400 shrink-0">
                Q{q.id}
              </span>
              <span className="text-sm text-white/80 flex-1 truncate">
                {q.question.replace("\n", " ")}
              </span>
              <span
                className="text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full"
                style={{
                  background: q.answer
                    ? "rgba(34,197,94,0.2)"
                    : "rgba(239,68,68,0.2)",
                  color: q.answer ? "#86efac" : "#fca5a5",
                }}
              >
                {t("result.answer", { answer: q.answer ? "O" : "X" })}
              </span>
            </div>
          );
        })}
      </motion.div>

      {/* ── 경품 응모 ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className={`w-full mb-5${quizName !== RAFFLE_QUIZ_NAME ? " hidden" : ""}`}
      >
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <ParticipantForm
                quizName={quizName}
                score={score}
                totalQuestions={total}
              />
            </motion.div>
          ) : (
            <motion.button
              key="cta"
              type="button"
              onClick={() => setShowForm(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 30px rgba(34,197,94,0.4)",
              }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg"
              style={{
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 0 20px rgba(16,185,129,0.3)",
              }}
            >
              {t("result.enterRaffle")}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── 액션 버튼 ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="flex flex-col sm:flex-row gap-3 w-full"
      >
        <motion.button
          type="button"
          onClick={onRestart}
          whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(249,115,22,0.4)" }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 py-4 rounded-2xl font-bold text-white text-lg"
          style={{
            background: "linear-gradient(135deg, #f97316, #ef4444)",
            boxShadow: "0 0 20px rgba(249,115,22,0.3)",
          }}
        >
          {t("result.retry")}
        </motion.button>
        <Link
          href="/"
          className="flex-1 py-4 rounded-2xl font-bold text-blue-200 text-lg text-center hover:text-white transition-colors"
          style={{
            border: "1px solid rgba(96,165,250,0.3)",
            backdropFilter: "blur(8px)",
          }}
        >
          {t("result.home")}
        </Link>
      </motion.div>
    </div>
  );
}
