"use client";

import OXButton from "./OXButton";
import { getBtnVariant } from "@/lib/utils";

interface Props {
  correctAnswer: boolean;
  userAnswer: boolean | null;
  isAnswered: boolean;
  onAnswer: (val: boolean) => void;
}

export default function QuizOXButtons({
  correctAnswer,
  userAnswer,
  isAnswered,
  onAnswer,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-5">
      <OXButton
        isO
        variant={getBtnVariant(true, isAnswered, userAnswer, correctAnswer)}
        disabled={isAnswered}
        onClick={() => onAnswer(true)}
      />
      <OXButton
        isO={false}
        variant={getBtnVariant(false, isAnswered, userAnswer, correctAnswer)}
        disabled={isAnswered}
        onClick={() => onAnswer(false)}
      />
    </div>
  );
}
