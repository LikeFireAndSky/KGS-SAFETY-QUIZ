import QuizShell from "@/app/components/quiz/QuizShell";

export const metadata = {
  title: "장마철 가스안전 퀴즈 | 가스안전 퀴즈왕",
  description:
    "장마철 침수·강풍 상황에서 반드시 알아야 할 가스 안전 수칙을 O/X 퀴즈로 확인해보세요. 5문제로 구성된 장마철 가스안전 퀴즈입니다.",
};

export default function RainySeasonGasQuizPage() {
  return <QuizShell quizName="rainy-season-gas-safety" />;
}
