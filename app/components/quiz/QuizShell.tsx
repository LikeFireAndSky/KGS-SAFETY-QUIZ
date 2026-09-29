"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuiz } from "@/lib/api/quiz";
import { markCompleted } from "@/lib/quizStorage";
import { useLanguage } from "@/app/i18n/LanguageProvider";
import QuizHeader from "./QuizHeader";
import QuizQuestion from "./QuizQuestion";
import QuizOXButtons from "./QuizOXButtons";
import QuizExplanation from "./QuizExplanation";
import QuizResult from "./QuizResult";

type Phase = "question" | "answered" | "result";

interface Props {
  quizName: string;
}

export default function QuizShell({ quizName }: Props) {
  const { lang, t } = useLanguage();
  const { data: quiz, isLoading, isError, refetch } = useQuiz(quizName, lang);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [picks, setPicks] = useState<(boolean | null)[]>([]);
  const [score, setScore] = useState(0);

  // picks 배열을 문제 수에 맞게 초기화
  useEffect(() => {
    if (quiz?.questions?.length) {
      setPicks(Array(quiz.questions.length).fill(null));
    }
  }, [quiz?.questions?.length]);

  // 퀴즈 데이터 로드 직후 모든 이미지 프리로드
  // → Q1을 푸는 동안 Q2~Q5가 브라우저 캐시에 올라감
  useEffect(() => {
    if (!quiz?.questions) return;
    quiz.questions.forEach((q) => {
      if (!q.imageUrl) return;
      const img = new window.Image();
      img.src = q.imageUrl;
    });
  }, [quiz]);

  // ── 로딩 ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent"
          aria-label={t("quiz.loadingAria")}
        />
        <p className="text-blue-300 text-sm">{t("quiz.loading")}</p>
      </div>
    );
  }

  // ── 에러 ──────────────────────────────────────────────
  if (isError || !quiz) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}
      >
        <p className="text-5xl" aria-hidden="true">⚠️</p>
        <p className="text-white font-bold text-lg">{t("quiz.errorTitle")}</p>
        <p className="text-blue-300 text-sm">{t("quiz.errorHint")}</p>
        <motion.button
          type="button"
          onClick={() => refetch()}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="px-8 py-3 rounded-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}
        >
          {t("quiz.retry")}
        </motion.button>
      </div>
    );
  }

  const questions = quiz.questions;
  const total = questions.length;
  const currentQ = questions[index];
  const isAnswered = phase === "answered";
  const userAnswer = picks[index] ?? null;
  const isCorrect = isAnswered && userAnswer === currentQ.answer;

  function choose(val: boolean) {
    if (isAnswered) return;
    const next = [...picks];
    next[index] = val;
    setPicks(next);
    if (val === currentQ.answer) setScore((s) => s + 1);
    setPhase("answered");
  }

  function goNext() {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setPhase("question");
    } else {
      markCompleted(quizName, score, total);
      setPhase("result");
    }
  }

  function restart() {
    setIndex(0);
    setPhase("question");
    setPicks(Array(total).fill(null));
    setScore(0);
  }

  // ── 결과 화면 ─────────────────────────────────────────
  if (phase === "result") {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}
      >
        <QuizHeader
          title={quiz.title}
          index={total - 1}
          total={total}
        />
        <div className="flex-1 overflow-y-auto pt-6">
          <QuizResult
            score={score}
            questions={questions}
            picks={picks}
            quizName={quizName}
            onRestart={restart}
          />
        </div>
      </div>
    );
  }

  // ── 퀴즈 화면 ─────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)" }}
    >
      <QuizHeader title={quiz.title} index={index} total={total} />

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="px-4 pt-4 pb-8 max-w-xl mx-auto w-full"
          >
            <QuizQuestion
              question={currentQ}
              questionNumber={index + 1}
            />

            <QuizOXButtons
              correctAnswer={currentQ.answer}
              userAnswer={userAnswer}
              isAnswered={isAnswered}
              onAnswer={choose}
            />

            <AnimatePresence>
              {isAnswered && (
                <QuizExplanation
                  key="explanation"
                  isCorrect={isCorrect}
                  answerLabel={currentQ.answerLabel}
                  explanation={currentQ.explanation}
                  isLast={index === total - 1}
                  onNext={goNext}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
