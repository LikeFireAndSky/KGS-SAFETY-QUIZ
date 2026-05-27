"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { getCompletions, getNextQuiz, type QuizCompletion } from "@/lib/quizStorage";

const MotionLink = motion(Link);

const BUBBLES = [
  { size: 20, left: "8%", delay: 0, duration: 8 },
  { size: 35, left: "23%", delay: 2.5, duration: 12 },
  { size: 15, left: "40%", delay: 1, duration: 9 },
  { size: 28, left: "57%", delay: 4, duration: 11 },
  { size: 42, left: "72%", delay: 0.5, duration: 15 },
  { size: 18, left: "87%", delay: 3, duration: 10 },
  { size: 32, left: "15%", delay: 6, duration: 13 },
  { size: 25, left: "93%", delay: 2, duration: 9.5 },
  { size: 48, left: "63%", delay: 5, duration: 14 },
  { size: 12, left: "35%", delay: 3.5, duration: 7 },
];

const CATEGORIES = [
  {
    icon: "🏠",
    title: "가정 가스 안전",
    description: "가정에서 가스를 올바르고 안전하게 사용하는 방법",
    questions: 5,
    accentColor: "#3b82f6",
    badge: "기초",
    href: "/quiz/home-gas",
    quizName: "home-gas-safety",
  },
  {
    icon: "🍳",
    title: "식당 가스 안전",
    description: "식당·음식점에서 반드시 알아야 할 가스 안전 수칙",
    questions: 5,
    accentColor: "#f97316",
    badge: "기초",
    href: "/quiz/restaurant-gas",
    quizName: "restaurant-gas-safety",
  },
  {
    icon: "🔧",
    title: "가스 기기 점검",
    description: "가스 기기의 올바른 점검과 유지 관리 방법",
    questions: 15,
    accentColor: "#10b981",
    badge: "실용",
    href: null,
    quizName: null,
  },
  {
    icon: "📋",
    title: "안전 규정 & 법규",
    description: "가스 관련 안전 법규와 기준에 대한 이해",
    questions: 12,
    accentColor: "#8b5cf6",
    badge: "심화",
    href: null,
    quizName: null,
  },
];

const SAFETY_TIPS = [
  "💡 가스 누출 의심 시 즉시 환기하고 점화원을 멀리하세요",
  "🔒 외출 전 가스 밸브가 잠겼는지 반드시 확인하세요",
  "📞 가스 사고 시 119 또는 가스안전공사(1544-4500)에 신고하세요",
  "🔧 가스 기기는 정기적으로 전문업체에 점검받으세요",
  "⚠️ 가스 기기 주변에 가연성 물질을 두지 마세요",
];


const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

type CatItem = (typeof CATEGORIES)[number];

function CardInner({
  cat,
  available,
  completion,
}: {
  cat: CatItem;
  available: boolean;
  completion?: QuizCompletion;
}) {
  const isDone = !!completion;

  return (
    <div className="flex items-start gap-4">
      <span className="text-4xl shrink-0" style={{ display: "inline-block" }} aria-hidden="true">
        {cat.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <h3 className="text-base sm:text-lg font-bold text-white">{cat.title}</h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold text-white shrink-0"
            style={{ background: cat.accentColor }}
          >
            {cat.badge}
          </span>
          {isDone && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0"
              style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.35)" }}
            >
              ✓ 완료
            </span>
          )}
          {!available && !isDone && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold text-blue-300 shrink-0"
              style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)" }}
            >
              준비 중
            </span>
          )}
        </div>
        <p className="text-sm text-blue-200/80 mb-4 leading-relaxed">{cat.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-blue-400">{cat.questions}문제</span>
          {available && (
            <span className="text-sm font-semibold flex items-center gap-1" style={{ color: isDone ? "#4ade80" : cat.accentColor }}>
              {isDone ? "다시 도전" : "도전하기"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
        {isDone && (
          <p className="text-xs text-green-400/70 mt-1">
            {completion.score}/{completion.totalQuestions}점 · {new Date(completion.completedAt).toLocaleDateString("ko-KR")} 완료
          </p>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [tipIndex, setTipIndex] = useState(0);
  const [completions, setCompletions] = useState<Record<string, QuizCompletion>>({});

  useEffect(() => {
    setCompletions(getCompletions());
  }, []);

  function handleStartQuiz() {
    const next = getNextQuiz();
    router.push(next.href);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % SAFETY_TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      }}
    >
      {/* Floating bubbles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {BUBBLES.map((bubble, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -1600, opacity: [0, 0.5, 0.3, 0] }}
            transition={{
              duration: bubble.duration,
              delay: bubble.delay,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              position: "absolute",
              left: bubble.left,
              bottom: "-60px",
              width: bubble.size,
              height: bubble.size,
              borderRadius: "50%",
              border: "1px solid rgba(96, 165, 250, 0.25)",
              background: "rgba(96, 165, 250, 0.06)",
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 flex items-center justify-between px-6 py-4"
        style={{
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(15, 23, 42, 0.6)",
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{
              background: "linear-gradient(135deg, #f97316, #ef4444)",
              boxShadow: "0 0 20px rgba(249, 115, 22, 0.4)",
            }}
          >
            🔥
          </motion.div>
          <div>
            <p className="text-xs text-blue-300 font-medium">
              강원영동
            </p>
            <p className="text-sm font-bold text-white">가스안전 퀴즈</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-blue-200">
          <a href="#categories" className="hover:text-white transition-colors">
            카테고리
          </a>
          <a
            href="https://m.blog.naver.com/PostList.naver?blogId=kgs_safety&tab=1"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            안전 정보
          </a>
          <motion.button
            type="button"
            onClick={handleStartQuiz}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2 rounded-full text-white font-semibold text-sm cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #f97316, #ef4444)",
              boxShadow: "0 0 15px rgba(249,115,22,0.3)",
            }}
          >
            시작하기
          </motion.button>
        </nav>

        <button type="button" className="md:hidden text-white p-1" aria-label="메뉴 열기">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 pb-12 text-center">
        {/* Animated Flame */}
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative mb-10"
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          aria-hidden="true"
        >
          {/* Outer ambient glow */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              filter: "blur(40px)",
              background:
                "radial-gradient(circle, rgba(249,115,22,0.5), rgba(239,68,68,0.3), transparent)",
              transform: "scale(3)",
              transformOrigin: "center bottom",
            }}
          />

          {/* Outer flame */}
          <motion.div
            animate={{
              scaleY: [1, 1.06, 0.96, 1.03, 1],
              scaleX: [1, 0.94, 1.04, 0.97, 1],
              rotate: [-1.5, 1, -0.5, 1.5, -1.5],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 72,
              height: 110,
              background:
                "linear-gradient(to top, #fbbf24, #f97316 45%, #ef4444 90%)",
              borderRadius: "50% 50% 30% 30% / 60% 60% 40% 40%",
              transformOrigin: "bottom center",
              boxShadow:
                "0 0 30px rgba(249,115,22,0.6), 0 0 60px rgba(249,115,22,0.25)",
              position: "relative",
            }}
          >
            {/* Middle flame */}
            <motion.div
              animate={{
                scaleY: [1, 1.1, 0.93, 1.05, 1],
                scaleX: [1, 0.91, 1.07, 0.95, 1],
                rotate: [1, -2, 1.5, -0.5, 1],
              }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                bottom: 6,
                left: 14,
                width: 44,
                height: 72,
                background:
                  "linear-gradient(to top, #fde68a, #fbbf24 40%, #f97316)",
                borderRadius: "50% 50% 30% 30% / 60% 60% 40% 40%",
                transformOrigin: "bottom center",
              }}
            >
              {/* Inner blue flame */}
              <motion.div
                animate={{
                  scaleY: [1, 1.14, 0.9, 1.08, 1],
                  scaleX: [1, 0.88, 1.1, 0.93, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  bottom: 4,
                  left: 11,
                  width: 22,
                  height: 36,
                  background:
                    "linear-gradient(to top, #bfdbfe, #93c5fd 40%, #60a5fa)",
                  borderRadius: "50% 50% 35% 35% / 60% 60% 40% 40%",
                  transformOrigin: "bottom center",
                }}
              />
            </motion.div>
          </motion.div>

          {/* Base glow */}
          <div
            style={{
              width: 80,
              height: 12,
              background:
                "radial-gradient(ellipse, rgba(249,115,22,0.7), transparent)",
              borderRadius: "50%",
              filter: "blur(4px)",
              marginTop: 4,
            }}
          />
        </motion.div>

        {/* Hero Title */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={itemVariants} className="mb-4">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold border"
              style={{
                background: "rgba(249,115,22,0.15)",
                borderColor: "rgba(249,115,22,0.3)",
                color: "#fb923c",
              }}
            >
              ✦ 강원영동 가스안전 퀴즈 ✦
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-2"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, #bfdbfe 40%, #93c5fd 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            가스안전
          </motion.h1>
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6"
            style={{
              background:
                "linear-gradient(135deg, #fde68a 0%, #f97316 50%, #ef4444 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            퀴즈왕 🏆
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-blue-200 max-w-lg mx-auto leading-relaxed"
          >
            가스 생활 안전에 대해 얼마나 알고 계신가요?
            <br />
            <span className="text-white font-semibold">재미있는 퀴즈</span>로
            안전 지식을 확인하고{" "}
            <span className="text-orange-400 font-semibold">퀴즈왕</span>에
            도전하세요!
          </motion.p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-10 w-full max-w-sm sm:max-w-none justify-center"
        >
          <motion.button
            type="button"
            onClick={handleStartQuiz}
            whileHover={{
              scale: 1.06,
              boxShadow: "0 0 40px rgba(249,115,22,0.55)",
            }}
            whileTap={{ scale: 0.96 }}
            className="px-8 py-4 rounded-2xl text-lg font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #f97316, #ef4444)",
              boxShadow: "0 0 24px rgba(249,115,22,0.35)",
            }}
          >
            <span aria-hidden="true">🚀</span> 퀴즈 시작하기
          </motion.button>
          <motion.a
            href="https://m.blog.naver.com/PostList.naver?blogId=kgs_safety&tab=1"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{
              scale: 1.04,
              boxShadow: "0 0 20px rgba(96,165,250,0.2)",
            }}
            whileTap={{ scale: 0.96 }}
            className="px-8 py-4 rounded-2xl text-lg font-semibold text-blue-200 flex items-center justify-center"
            style={{
              border: "1px solid rgba(96,165,250,0.3)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span aria-hidden="true">📖</span>&nbsp;안전 정보 보기
          </motion.a>
        </motion.div>

        {/* Safety Tip Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="w-full max-w-2xl rounded-2xl px-5 py-4"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(96,165,250,0.15)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-orange-400 shrink-0 tracking-widest uppercase">
              안전 TIP
            </span>
            <div
              style={{
                width: 1,
                height: 16,
                background: "rgba(96,165,250,0.3)",
                flexShrink: 0,
              }}
            />
            <div className="overflow-hidden h-5 flex-1">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm text-blue-100 text-left"
                >
                  {SAFETY_TIPS[tipIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Quiz Categories */}
      <section id="categories" className="relative z-10 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              퀴즈 카테고리
            </h2>
            <p className="text-blue-300">
              원하는 분야를 선택하고 도전해보세요!
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              visible: { transition: { staggerChildren: 0.12 } },
              hidden: {},
            }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {CATEGORIES.map((cat, i) =>
              cat.href ? (
                <MotionLink
                  key={i}
                  href={cat.href}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px ${cat.accentColor}55`,
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="block rounded-3xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <CardInner
                    cat={cat}
                    available
                    completion={cat.quizName ? completions[cat.quizName] : undefined}
                  />
                </MotionLink>
              ) : (
                <motion.div
                  key={i}
                  variants={cardVariants}
                  className="rounded-3xl p-6 cursor-not-allowed"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    opacity: 0.55,
                  }}
                >
                  <CardInner cat={cat} available={false} />
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 px-6 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(249,115,22,0.18), rgba(239,68,68,0.12), rgba(59,130,246,0.18))",
            border: "1px solid rgba(249,115,22,0.25)",
            backdropFilter: "blur(12px)",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: "50%",
              opacity: 0.1,
              background: "radial-gradient(circle, #f97316, transparent)",
              pointerEvents: "none",
            }}
          />
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            지금 바로 도전해보세요!
          </h2>
          <p className="text-blue-200 mb-8 max-w-md mx-auto">
            가스 안전 지식을 테스트하고 안전한 가스 생활 습관을 만들어보세요.
          </p>
          <motion.button
            type="button"
            onClick={handleStartQuiz}
            whileHover={{
              scale: 1.06,
              boxShadow: "0 0 40px rgba(249,115,22,0.5)",
            }}
            whileTap={{ scale: 0.96 }}
            className="px-10 py-4 rounded-2xl text-lg font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #f97316, #ef4444)",
              boxShadow: "0 0 24px rgba(249,115,22,0.35)",
            }}
          >
            <span aria-hidden="true">🚀</span> 퀴즈 시작하기
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 px-6 py-8 mt-4"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          background: "rgba(15,23,42,0.6)",
        }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{
                background: "linear-gradient(135deg, #f97316, #ef4444)",
                boxShadow: "0 0 12px rgba(249,115,22,0.4)",
              }}
            >
              🔥
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                강원영동 가스안전 퀴즈
              </p>
              <p className="text-xs text-blue-400">
                가스안전 퀴즈왕 · YeongDong Gas Safety
              </p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs text-blue-300">
              📞 1544-4500 (가스 누출 신고 · 24시간)
            </p>
            <p className="text-xs text-blue-500 mt-1">
              © 2026 강원영동 가스안전 퀴즈. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
