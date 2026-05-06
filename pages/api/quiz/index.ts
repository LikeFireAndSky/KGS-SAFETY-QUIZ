import type { NextApiRequest, NextApiResponse } from "next";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLES } from "@/lib/aws/dynamodb";
import type { Quiz, ApiError } from "@/lib/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Quiz[] | ApiError>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await dynamodb.send(
      new ScanCommand({ TableName: TABLES.QUIZ })
    );
    return res.status(200).json((result.Items ?? []) as Quiz[]);
  } catch (err) {
    console.error("[GET /api/quiz]", err);
    return res.status(500).json({ error: "퀴즈 목록을 가져오지 못했습니다." });
  }
}
