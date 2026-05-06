import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: process.env.APP_REGION ?? "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.APP_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_SECRET_ACCESS_KEY!,
  },
});

export const S3_BUCKET = "kgs-safety-quiz-bucket";
export const S3_REGION = "ap-northeast-2";

/** 공개 URL (버킷 퍼블릭 접근 허용 시) */
export function getS3PublicUrl(key: string): string {
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
}

/** 프리사인 URL (버킷 비공개 시, 만료 시간 기본 1시간) */
export async function getS3PresignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}
