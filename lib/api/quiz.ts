import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { Quiz } from "@/lib/types";

const BASE = "/api/quiz";

export const quizApi = {
  getAll: (): Promise<Quiz[]> =>
    axios.get<Quiz[]>(BASE).then((r) => r.data),

  getByName: (quizName: string): Promise<Quiz> =>
    axios.get<Quiz>(`${BASE}/${quizName}`).then((r) => r.data),
};

export const quizKeys = {
  all: ["quizzes"] as const,
  detail: (name: string) => ["quizzes", name] as const,
};

export function useQuizzes() {
  return useQuery({
    queryKey: quizKeys.all,
    queryFn: quizApi.getAll,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useQuiz(quizName: string) {
  return useQuery({
    queryKey: quizKeys.detail(quizName),
    queryFn: () => quizApi.getByName(quizName),
    enabled: !!quizName,
    staleTime: 5 * 60 * 1000,
  });
}
