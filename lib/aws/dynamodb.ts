import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.APP_REGION ?? "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.APP_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_SECRET_ACCESS_KEY!,
  },
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
