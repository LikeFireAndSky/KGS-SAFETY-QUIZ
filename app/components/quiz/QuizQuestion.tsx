"use client";

import Image from "next/image";
import type { QuizQuestion as QuizQuestionType } from "@/lib/types";
import { useLanguage } from "@/app/i18n/LanguageProvider";

interface Props {
  question: QuizQuestionType;
  questionNumber: number;
}

export default function QuizQuestion({ question, questionNumber }: Props) {
  const { t } = useLanguage();
  // imageUrl  → 서버에서 생성한 Presigned URL (S3 비공개 버킷)
  // fallback  → public/images 로컬 이미지
  const imageSrc =
    question.imageUrl ?? `/images/Q${questionNumber}.webp`;

  return (
    <>
      {/* Image */}
      <div
        className="rounded-2xl overflow-hidden mb-5 shadow-2xl"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <Image
          src={imageSrc}
          alt={t("quiz.imageAlt", { n: questionNumber })}
          width={600}
          height={600}
          className="w-full h-auto"
          priority
          unoptimized={!!question.imageUrl}
        />
      </div>

      {/* Question number badge */}
      <div className="flex justify-center mb-3">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: "rgba(249,115,22,0.2)",
            color: "#fb923c",
            border: "1px solid rgba(249,115,22,0.3)",
          }}
        >
          Q{questionNumber}
        </span>
      </div>

      {/* Question text */}
      <p className="text-xl sm:text-2xl font-black text-white text-center mb-8 whitespace-pre-line leading-snug">
        {question.question}
      </p>
    </>
  );
}
