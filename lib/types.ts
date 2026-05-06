export interface QuizQuestion {
  id: number;
  question: string;
  answer: boolean;
  answerLabel: string;
  explanation: string;
  imageKey?: string;  // S3 object key  (e.g. "home-gas-safety/Q1.png")
  imageUrl?: string;  // Presigned URL  (서버에서 생성, 1시간 유효)
}

export interface Quiz {
  QuizName: string;      // DynamoDB Partition Key
  category: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  createdAt: string;
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
