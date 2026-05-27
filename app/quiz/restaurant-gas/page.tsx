import QuizShell from "@/app/components/quiz/QuizShell";

export const metadata = {
  title: "식당 가스 안전 퀴즈 | 가스안전 퀴즈왕",
  description:
    "식당·음식점에서 반드시 알아야 할 가스 안전 수칙을 O/X 퀴즈로 확인해보세요. 5문제로 구성된 식당 가스 안전 퀴즈입니다.",
};

export default function RestaurantGasQuizPage() {
  return <QuizShell quizName="restaurant-gas-safety" />;
}
