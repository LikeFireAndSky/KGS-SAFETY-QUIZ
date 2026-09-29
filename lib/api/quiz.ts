import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type { Quiz } from "@/lib/types";
import { DEFAULT_LANG, type Lang } from "@/lib/i18n";

const BASE = "/api/quiz";

export const quizApi = {
  getAll: (): Promise<Quiz[]> =>
    axios.get<Quiz[]>(BASE).then((r) => r.data),

  getByName: (quizName: string, lang: Lang = DEFAULT_LANG): Promise<Quiz> =>
    axios.get<Quiz>(`${BASE}/${quizName}`, { params: { lang } }).then((r) => r.data),
};

export const quizKeys = {
  all: ["quizzes"] as const,
  detail: (name: string, lang: Lang) => ["quizzes", name, lang] as const,
};

export function useQuizzes() {
  return useQuery({
    queryKey: quizKeys.all,
    queryFn: quizApi.getAll,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useQuiz(quizName: string, lang: Lang = DEFAULT_LANG) {
  return useQuery({
    queryKey: quizKeys.detail(quizName, lang),
    queryFn: () => quizApi.getByName(quizName, lang),
    enabled: !!quizName,
    staleTime: 5 * 60 * 1000,
  });
}
