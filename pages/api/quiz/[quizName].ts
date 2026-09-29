import type { NextApiRequest, NextApiResponse } from "next";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamodb, TABLES } from "@/lib/aws/dynamodb";
import { getS3PresignedUrl } from "@/lib/aws/s3";
import type { Quiz, ApiError } from "@/lib/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Quiz | ApiError>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { quizName, lang } = req.query;

  if (!quizName || typeof quizName !== "string") {
    return res.status(400).json({ error: "quizName 파라미터가 필요합니다." });
  }

  try {
    const result = await dynamodb.send(
      new GetCommand({
        TableName: TABLES.QUIZ,
        Key: { QuizName: quizName },
      })
    );

    if (!result.Item) {
      return res.status(404).json({ error: "퀴즈를 찾을 수 없습니다." });
    }

    // translations는 응답에서 제외하고, 요청 언어의 번역만 원문 위에 덮어씀
    const { translations, ...quiz } = result.Item as Quiz;
    const tr = typeof lang === "string" ? translations?.[lang] : undefined;

    // imageKey → Presigned URL 변환 (버킷 비공개 유지, 1시간 유효)
    const questions = await Promise.all(
      quiz.questions.map(async (q) => {
        const tq = tr?.questions?.find((t) => t.id === q.id);
        return {
          ...q,
          question: tq?.question || q.question,
          answerLabel: tq?.answerLabel || q.answerLabel,
          explanation: tq?.explanation || q.explanation,
          imageUrl: q.imageKey ? await getS3PresignedUrl(q.imageKey) : undefined,
        };
      })
    );

    return res.status(200).json({
      ...quiz,
      title: tr?.title || quiz.title,
      category: tr?.category || quiz.category,
      description: tr?.description || quiz.description,
      questions,
    });
  } catch (err) {
    console.error(`[GET /api/quiz/${quizName}]`, err);
    return res.status(500).json({ error: "퀴즈를 가져오지 못했습니다." });
  }
}
