import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// AWS SDK 크리덴셜 자동 탐색:
// · 로컬 개발 → .env.local 의 AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
// · Amplify   → 서비스 Role 임시 자격증명 (자동 주입, 별도 설정 불필요)
const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "ap-northeast-2",
});

export const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
});

export const TABLES = {
  QUIZ: "KGS-Safety-Quiz",
  PARTICIPANTS: "KGS-Safety-Quiz-Participants",
} as const;
