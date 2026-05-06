import type { NextApiRequest, NextApiResponse } from "next";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { dynamodb, TABLES } from "@/lib/aws/dynamodb";
import type { CreateParticipantInput, Participant, ApiError } from "@/lib/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Participant | Participant[] | ApiError>
) {
  // ── GET: 전체 참여자 조회 ──────────────────────────────
  if (req.method === "GET") {
    try {
      const result = await dynamodb.send(
        new ScanCommand({ TableName: TABLES.PARTICIPANTS })
      );
      return res.status(200).json((result.Items ?? []) as Participant[]);
    } catch (err) {
      console.error("[GET /api/participants]", err);
      return res.status(500).json({ error: "참여자 목록을 가져오지 못했습니다." });
    }
  }

  // ── POST: 참여자 등록 ─────────────────────────────────
  if (req.method === "POST") {
    const { name, phone, address, quizName, score, totalQuestions } =
      req.body as Partial<CreateParticipantInput>;

    if (!name || !phone || !address || !quizName || score === undefined || totalQuestions === undefined) {
      return res.status(400).json({ error: "필수 항목이 누락되었습니다." });
    }

    const participant: Participant = {
      "KGS-Participants-Code": `KGS-${randomUUID().slice(0, 8).toUpperCase()}`,
      name,
      phone,
      address,
      quizName,
      score,
      totalQuestions,
      submittedAt: new Date().toISOString(),
    };

    try {
      await dynamodb.send(
        new PutCommand({
          TableName: TABLES.PARTICIPANTS,
          Item: participant,
        })
      );
      return res.status(201).json(participant);
    } catch (err) {
      console.error("[POST /api/participants]", err);
      return res.status(500).json({ error: "참여자 등록에 실패했습니다." });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
