export interface QuizQuestion {
  id: number;
  question: string;
  answer: boolean;
  answerLabel: string;
  explanation: string;
  imageKey?: string;  // S3 object key  (e.g. "home-gas-safety/Q1.png")
  imageUrl?: string;  // Presigned URL  (서버에서 생성, 1시간 유효)
}

/** 언어별 퀴즈 번역 — 비어 있는 항목은 한국어 원문으로 대체 */
export interface QuizTranslation {
  title?: string;
  category?: string;
  description?: string;
  questions?: {
    id: number;          // QuizQuestion.id 와 매칭
    question?: string;
    answerLabel?: string;
    explanation?: string;
  }[];
}

export interface Quiz {
  QuizName: string;      // DynamoDB Partition Key
  category: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  createdAt: string;
  translations?: Record<string, QuizTranslation>; // 언어 코드(en, zh …) → 번역
}

export interface Participant {
  "KGS-Participants-Code": string; // DynamoDB Partition Key
  name: string;
  phone: string;
  address: string;               // 도로명 주소 + 상세 주소
  quizName: string;
  score: number;
  totalQuestions: number;
  submittedAt: string;
}

export interface CreateParticipantInput {
  name: string;
  phone: string;
  address: string;
  quizName: string;
  score: number;
  totalQuestions: number;
}

export interface ApiError {
  error: string;
}
