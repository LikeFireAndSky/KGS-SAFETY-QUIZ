"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/app/i18n/LanguageProvider";

interface Props {
  isCorrect: boolean;
  answerLabel: string;
  explanation: string;
  isLast: boolean;
  onNext: () => void;
}

export default function QuizExplanation({
  isCorrect,
  answerLabel,
  explanation,
  isLast,
  onNext,
}: Props) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="rounded-2xl p-5 mb-4"
        style={{
          background: isCorrect ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${isCorrect ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
        }}
      >
        <p
          className="text-lg font-black mb-1"
          style={{ color: isCorrect ? "#4ade80" : "#f87171" }}
        >
          {isCorrect ? t("quiz.correct") : t("quiz.wrong")}
        </p>
        <p
          className="text-sm font-bold mb-3"
          style={{ color: isCorrect ? "#86efac" : "#fca5a5" }}
        >
          {t("quiz.answerIs", { label: answerLabel })}
        </p>
        <p className="text-sm text-blue-100 leading-relaxed">{explanation}</p>
      </motion.div>

      <motion.button
        type="button"
        onClick={onNext}
        whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(249,115,22,0.45)" }}
        whileTap={{ scale: 0.97 }}
        className="w-full py-4 rounded-2xl font-bold text-white text-lg"
        style={{
          background: "linear-gradient(135deg, #f97316, #ef4444)",
          boxShadow: "0 0 20px rgba(249,115,22,0.3)",
        }}
      >
        {isLast ? t("quiz.showResult") : t("quiz.next")}
      </motion.button>
    </motion.div>
  );
}
