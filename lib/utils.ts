import type { MessageKey } from "@/lib/i18n";

const S3_BASE =
  "https://kgs-safety-quiz-bucket.s3.ap-northeast-2.amazonaws.com";

export function getS3ImageUrl(imageKey: string): string {
  return `${S3_BASE}/${imageKey}`;
}

export type BtnVariant =
  | "neutral"
  | "correct"
  | "wrong"
  | "correct-reveal"
  | "dimmed";

export function getBtnVariant(
  btnVal: boolean,
  isAnswered: boolean,
  userAnswer: boolean | null,
  correctAnswer: boolean
): BtnVariant {
  if (!isAnswered) return "neutral";
  if (correctAnswer === btnVal && userAnswer === btnVal) return "correct";
  if (correctAnswer !== btnVal && userAnswer === btnVal) return "wrong";
  if (correctAnswer === btnVal && userAnswer !== btnVal) return "correct-reveal";
  return "dimmed";
}

export function getGrade(
  score: number,
  total: number
): { emoji: string; labelKey: MessageKey; color: string } {
  const ratio = total > 0 ? score / total : 0;
  if (ratio === 1) return { emoji: "🏆", labelKey: "grade.perfect", color: "#fbbf24" };
  if (ratio >= 0.8) return { emoji: "⭐", labelKey: "grade.expert", color: "#60a5fa" };
  if (ratio >= 0.6) return { emoji: "👍", labelKey: "grade.great", color: "#34d399" };
  if (ratio >= 0.4) return { emoji: "📚", labelKey: "grade.study", color: "#f97316" };
  return { emoji: "⚠️", labelKey: "grade.needTraining", color: "#ef4444" };
}
