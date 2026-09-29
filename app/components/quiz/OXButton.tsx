"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { BtnVariant } from "@/lib/utils";
import { useLanguage } from "@/app/i18n/LanguageProvider";

const STYLE_MAP: Record<BtnVariant, { bg: string; border: string; text: string }> = {
  neutral:          { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.15)", text: "#e2e8f0" },
  correct:          { bg: "rgba(34,197,94,0.25)",   border: "rgb(34,197,94)",         text: "#bbf7d0" },
  wrong:            { bg: "rgba(239,68,68,0.25)",   border: "rgb(239,68,68)",          text: "#fecaca" },
  "correct-reveal": { bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.5)",    text: "#86efac" },
  dimmed:           { bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.25)" },
};

interface Props {
  isO: boolean;
  variant: BtnVariant;
  disabled: boolean;
  onClick: () => void;
}

export default function OXButton({ isO, variant, disabled, onClick }: Props) {
  const { t } = useLanguage();
  const s = STYLE_MAP[variant];
  const showCheck = variant === "correct" || variant === "correct-reveal";
  const showCross = variant === "wrong";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={
        !disabled
          ? {
              scale: 1.04,
              boxShadow: isO
                ? "0 0 24px rgba(34,197,94,0.3)"
                : "0 0 24px rgba(239,68,68,0.3)",
            }
          : {}
      }
      whileTap={!disabled ? { scale: 0.94 } : {}}
      animate={showCross ? { x: [0, -12, 12, -10, 10, -6, 6, 0] } : { x: 0 }}
      transition={{
        x: { duration: 0.5 },
        scale: { type: "spring", stiffness: 300, damping: 20 },
      }}
      aria-label={isO ? t("quiz.oAria") : t("quiz.xAria")}
      className="relative flex flex-col items-center justify-center gap-2 py-7 rounded-3xl font-black cursor-pointer"
      style={{
        background: s.bg,
        border: `2px solid ${s.border}`,
        backdropFilter: "blur(8px)",
        color: s.text,
      }}
    >
      <span className="text-5xl leading-none" aria-hidden="true">
        {isO ? "⭕" : "❌"}
      </span>
      <span className="text-3xl font-black">{isO ? "O" : "X"}</span>

      <AnimatePresence>
        {showCheck && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "rgb(34,197,94)", boxShadow: "0 0 10px rgba(34,197,94,0.5)" }}
            aria-hidden="true"
          >
            ✓
          </motion.span>
        )}
        {showCross && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: "rgb(239,68,68)", boxShadow: "0 0 10px rgba(239,68,68,0.5)" }}
            aria-hidden="true"
          >
            ✕
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
