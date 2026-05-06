import QuizShell from "@/app/components/quiz/QuizShell";

export const metadata = {
  title: "가정 가스 안전 퀴즈 | 가스안전 퀴즈왕",
  description:
    "가정에서 안전하게 가스를 사용하는 방법을 O/X 퀴즈로 확인해보세요. 5문제로 구성된 가정 가스 안전 퀴즈입니다.",
};

export default function HomeGasQuizPage() {
  return <QuizShell quizName="home-gas-safety" />;
}
