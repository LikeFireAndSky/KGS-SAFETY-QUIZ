import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// credentials 미지정 → SDK가 환경에 맞게 자동 선택
// · 로컬: AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY 환경변수
// · Amplify: 서비스 Role 임시 자격증명 (자동 주입)
export const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "ap-northeast-2",
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
