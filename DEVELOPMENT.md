# 강원영동 가스안전 퀴즈 — 개발 내역서

> **프로젝트명** : 강원영동 가스안전 퀴즈  
> **클라이언트** : 한국가스안전공사 강원영동지사  
> **작성일** : 2026-05-15  
> **배포 환경** : AWS Amplify (SSR)  
> **저장소** : https://github.com/LikeFireAndSky/KGS-SAFETY-QUIZ

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [디렉토리 구조](#3-디렉토리-구조)
4. [데이터베이스 구조](#4-데이터베이스-구조-dynamodb)
5. [AWS 인프라](#5-aws-인프라)
6. [API 명세](#6-api-명세)
7. [컴포넌트 구조](#7-컴포넌트-구조)
8. [상태 관리](#8-상태-관리)
9. [주요 기능 상세](#9-주요-기능-상세)
10. [환경 변수](#10-환경-변수)
11. [테스트](#11-테스트)
12. [빌드 및 배포](#12-빌드-및-배포)
13. [개발 이력](#13-개발-이력)
14. [알려진 이슈 및 제약사항](#14-알려진-이슈-및-제약사항)

---

## 1. 프로젝트 개요

가스 생활 안전 지식을 O/X 퀴즈 형식으로 제공하는 인터랙티브 웹 서비스. 퀴즈 완료 후 경품 응모가 가능하며, 참여자 정보를 AWS DynamoDB에 저장한다.

| 항목 | 내용 |
|---|---|
| 서비스 유형 | O/X 안전 퀴즈 + 경품 응모 |
| 문제 수 | 카테고리당 최대 5문제 |
| 현재 운영 퀴즈 | 가정 가스 안전 (home-gas-safety) |
| 준비 중 퀴즈 | 가스 누출 대처, 가스 기기 점검, 안전 규정 & 법규 |
| 타겟 디바이스 | 모바일 우선 (반응형) |

---

## 2. 기술 스택

### 프론트엔드

| 분류 | 라이브러리 / 버전 |
|---|---|
| 프레임워크 | Next.js 16.2.4 (App Router + Pages Router 하이브리드) |
| UI 라이브러리 | React 19.2.4 |
| 언어 | TypeScript 5 |
| 스타일 | Tailwind CSS v4 |
| 애니메이션 | Framer Motion v12 |
| 폼 관리 | React Hook Form v7 |
| 서버 상태 | TanStack Query v5 (React Query) |
| HTTP 클라이언트 | Axios v1 |
| 주소 검색 | Daum 우편번호 API (next/script로 로드) |
| 폰트 | Geist Sans (Google Fonts via next/font) |

### 백엔드 / 인프라

| 분류 | 서비스 / 버전 |
|---|---|
| API 라우트 | Next.js Pages Router (`pages/api/`) |
| 데이터베이스 | AWS DynamoDB (ap-northeast-2) |
| 파일 스토리지 | AWS S3 (비공개 버킷, Presigned URL) |
| AWS SDK | @aws-sdk v3 (client-dynamodb, lib-dynamodb, client-s3, s3-request-presigner) |
| 배포 플랫폼 | AWS Amplify (SSR 모드) |
| Node.js | v22 (Amplify 빌드 환경) |
| npm | 10.9.x+ |

### 개발 도구

| 분류 | 도구 / 버전 |
|---|---|
| 테스트 프레임워크 | Vitest v4 |
| 테스트 유틸 | @testing-library/react v16, @testing-library/user-event v14 |
| 테스트 환경 | jsdom (컴포넌트), node (API 라우트) |
| 린터 | ESLint 9 + eslint-config-next |
| 번들러 | Vite (Vitest 내부), Next.js webpack (프로덕션) |

---

## 3. 디렉토리 구조

```
my-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 루트 레이아웃 (메타데이터, 파비콘, 폰트)
│   ├── page.tsx                  # 메인 페이지 (/)
│   ├── providers.tsx             # TanStack Query Provider
│   ├── globals.css               # Tailwind 전역 CSS
│   ├── favicon.ico               # 기본 파비콘 (fallback)
│   ├── components/
│   │   ├── HomePage.tsx          # 메인 랜딩 페이지 컴포넌트
│   │   └── quiz/
│   │       ├── QuizShell.tsx     # 퀴즈 상태머신 (핵심)
│   │       ├── QuizHeader.tsx    # 헤더 (뒤로가기, 진행 표시)
│   │       ├── QuizQuestion.tsx  # 문제 이미지 + 텍스트
│   │       ├── QuizOXButtons.tsx # O/X 버튼 컨테이너
│   │       ├── OXButton.tsx      # 개별 O/X 버튼
│   │       ├── QuizExplanation.tsx # 해설 + 다음 버튼
│   │       ├── QuizResult.tsx    # 결과 화면 (점수, 리뷰, 등급)
│   │       └── ParticipantForm.tsx # 경품 응모 폼
│   └── quiz/
│       └── home-gas/
│           └── page.tsx          # /quiz/home-gas 라우트
│
├── pages/
│   └── api/                      # Next.js API 라우트 (서버사이드)
│       ├── health.ts             # GET /api/health (환경변수 상태 확인)
│       ├── quiz/
│       │   ├── index.ts          # GET /api/quiz (전체 퀴즈 목록)
│       │   └── [quizName].ts     # GET /api/quiz/:quizName (단일 퀴즈)
│       └── participants/
│           └── index.ts          # GET/POST /api/participants
│
├── lib/
│   ├── types.ts                  # 공통 타입 정의
│   ├── utils.ts                  # 유틸 함수 (getBtnVariant, getGrade 등)
│   ├── quizStorage.ts            # localStorage 퀴즈 완료 이력 관리
│   ├── api/
│   │   ├── quiz.ts               # TanStack Query 훅 (useQuiz, useQuizzes)
│   │   └── participants.ts       # TanStack Query 훅 (useCreateParticipant)
│   └── aws/
│       ├── dynamodb.ts           # DynamoDB 클라이언트 + 테이블 상수
│       └── s3.ts                 # S3 클라이언트 + Presigned URL 생성
│
├── public/
│   └── images/
│       ├── favicons/             # 파비콘 (32, 64, 256, 512px PNG)
│       └── Q1~Q5.webp            # 퀴즈 문제 이미지 (로컬 fallback)
│
├── __tests__/                    # Vitest 테스트
│   ├── api/
│   │   ├── quiz-name.test.ts
│   │   └── participants.test.ts
│   ├── components/quiz/
│   │   ├── OXButton.test.tsx
│   │   ├── QuizExplanation.test.tsx
│   │   ├── QuizHeader.test.tsx
│   │   ├── QuizOXButtons.test.tsx
│   │   ├── QuizQuestion.test.tsx
│   │   ├── QuizResult.test.tsx
│   │   ├── QuizShell.test.tsx
│   │   └── ParticipantForm.test.tsx
│   └── lib/
│       ├── quizStorage.test.ts
│       └── utils.test.ts
│
├── amplify.yml                   # AWS Amplify 빌드 설정
├── vitest.config.mts             # Vitest 설정
├── vitest.setup.ts               # jest-dom 전역 설정
├── tsconfig.json
├── next.config.ts
└── package.json
```

---

## 4. 데이터베이스 구조 (DynamoDB)

리전: `ap-northeast-2` (서울)

### 4-1. KGS-Safety-Quiz (퀴즈 테이블)

퀴즈 카테고리별 문제 데이터를 저장한다.

| 속성 | 타입 | 역할 |
|---|---|---|
| `QuizName` | String | **Partition Key** (예: `home-gas-safety`) |
| `category` | String | 카테고리 분류 |
| `title` | String | 화면 표시 제목 |
| `description` | String (optional) | 퀴즈 설명 |
| `questions` | List\<Map\> | 문제 배열 |
| `createdAt` | String | ISO 날짜 |

**questions 배열 항목 구조**

| 속성 | 타입 | 설명 |
|---|---|---|
| `id` | Number | 문제 순서 (1-based) |
| `question` | String | 문제 텍스트 |
| `answer` | Boolean | 정답 (`true` = O, `false` = X) |
| `answerLabel` | String | 정답 설명 레이블 (예: "O (있습니다)") |
| `explanation` | String | 해설 텍스트 |
| `imageKey` | String (optional) | S3 오브젝트 키 (예: `home-gas-safety/Q1.webp`) |

> `imageKey`는 API가 Presigned URL(`imageUrl`)로 변환하여 응답한다. S3 버킷은 비공개이므로 직접 URL은 접근 불가.

**예시 아이템**

```json
{
  "QuizName": "home-gas-safety",
  "category": "home",
  "title": "가정 가스 안전 퀴즈",
  "questions": [
    {
      "id": 1,
      "question": "가스를 사용한 후에는 반드시 밸브를 잠가야 한다",
      "answer": true,
      "answerLabel": "O (맞습니다)",
      "explanation": "가스 사용 후 밸브를 잠그는 것은 기본 안전 수칙입니다.",
      "imageKey": "home-gas-safety/Q1.webp"
    }
  ],
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

---

### 4-2. KGS-Safety-Quiz-Participants (참여자 테이블)

경품 응모 신청 정보를 저장한다.

| 속성 | 타입 | 역할 |
|---|---|---|
| `KGS-Participants-Code` | String | **Partition Key** (예: `KGS-A1B2C3D4`) |
| `name` | String | 참여자 이름 |
| `phone` | String | 전화번호 (포맷: `010-XXXX-XXXX`) |
| `address` | String | 도로명 주소 + 상세 주소 |
| `quizName` | String | 응모한 퀴즈 이름 |
| `score` | Number | 획득 점수 |
| `totalQuestions` | Number | 전체 문제 수 |
| `submittedAt` | String | 제출 시각 (ISO) |

**Partition Key 생성 규칙**

```
KGS-{randomUUID().slice(0, 8).toUpperCase()}
예: KGS-A4F72C1E
```

---

## 5. AWS 인프라

### S3 버킷 구조

| 항목 | 값 |
|---|---|
| 버킷명 | `kgs-safety-quiz-bucket` |
| 리전 | `ap-northeast-2` |
| 접근 방식 | 비공개 (Presigned URL, 유효시간 1시간) |

**오브젝트 키 네이밍**

```
{quizName}/{파일명}.webp
예: home-gas-safety/Q1.webp
        home-gas-safety/Q2.webp
```

### AWS Amplify 배포

| 항목 | 값 |
|---|---|
| 앱 ID | `d26tpfg710qffd` |
| 브랜치 | `main` |
| 렌더링 방식 | SSR (Server-Side Rendering) |
| Node.js 버전 | 22 (nvm use 22) |
| 빌드 아티팩트 | `.next/**/*` |

**빌드 흐름 (amplify.yml)**

```
preBuild  → nvm use 22 → npm ci
build     → 환경변수 .env.production 주입 → npm run build
artifacts → .next/**/*
cache     → .next/cache/**/*
```

---

## 6. API 명세

### GET /api/quiz

전체 퀴즈 목록 조회 (DynamoDB Scan).

| | |
|---|---|
| **응답 200** | `Quiz[]` |
| **응답 405** | `{ error: "Method not allowed" }` |
| **응답 500** | `{ error: "퀴즈 목록을 가져오지 못했습니다." }` |

---

### GET /api/quiz/:quizName

단일 퀴즈 조회. `imageKey` → S3 Presigned URL (`imageUrl`) 변환 포함.

| 파라미터 | 위치 | 설명 |
|---|---|---|
| `quizName` | Path | 퀴즈 식별자 (예: `home-gas-safety`) |

| 상태 코드 | 응답 |
|---|---|
| 200 | `Quiz` (questions에 `imageUrl` 포함) |
| 400 | `{ error: "quizName 파라미터가 필요합니다." }` |
| 404 | `{ error: "퀴즈를 찾을 수 없습니다." }` |
| 405 | `{ error: "Method not allowed" }` |
| 500 | `{ error: "퀴즈를 가져오지 못했습니다." }` |

---

### GET /api/participants

전체 참여자 목록 조회 (DynamoDB Scan).

| 상태 코드 | 응답 |
|---|---|
| 200 | `Participant[]` |
| 500 | `{ error: "참여자 목록을 가져오지 못했습니다." }` |

---

### POST /api/participants

경품 응모 등록.

**Request Body**

```json
{
  "name": "홍길동",
  "phone": "010-1234-5678",
  "address": "강원특별자치도 강릉시 경강로 1234",
  "quizName": "home-gas-safety",
  "score": 4,
  "totalQuestions": 5
}
```

| 상태 코드 | 응답 |
|---|---|
| 201 | `Participant` (KGS-Participants-Code, submittedAt 포함) |
| 400 | `{ error: "필수 항목이 누락되었습니다." }` |
| 405 | `{ error: "Method not allowed" }` |
| 500 | `{ error: "참여자 등록에 실패했습니다." }` |

**서버사이드 검증 항목**

- `name`, `phone`, `address`, `quizName` — 누락 또는 빈 문자열 거부
- `score`, `totalQuestions` — `undefined` 거부 (`0` 허용)

---

### GET /api/health

AWS 환경변수 주입 상태 확인용.

```json
{
  "status": "ok",
  "env": {
    "APP_REGION": true,
    "APP_ACCESS_KEY_ID": true,
    "APP_SECRET_ACCESS_KEY": true
  }
}
```

---

## 7. 컴포넌트 구조

### 메인 페이지 (`/`)

```
HomePage
├── 헤더 (네비게이션: 홈 로고, 안전정보→네이버블로그, 시작하기→getNextQuiz)
├── 히어로 섹션 (애니메이션 버블, 타이틀, 시작 버튼)
├── 안전 팁 티커 (5가지 팁 자동 순환, 4초 간격)
├── 카테고리 카드 그리드 (4개)
│   ├── 가정 가스 안전 (활성, /quiz/home-gas)
│   ├── 가스 누출 대처 (준비 중)
│   ├── 가스 기기 점검 (준비 중)
│   └── 안전 규정 & 법규 (준비 중)
└── 푸터
```

### 퀴즈 페이지 (`/quiz/home-gas`)

```
QuizShell (상태머신)
├── [로딩] → 스피너 (aria-label="로딩 중")
├── [에러] → 에러 메시지 + 다시 시도 버튼
├── [퀴즈 진행 중]
│   ├── QuizHeader (뒤로가기, 제목, 진행 카운터, 진행 점)
│   ├── QuizQuestion (S3 이미지, 문제 번호 배지, 문제 텍스트)
│   ├── QuizOXButtons → OXButton × 2
│   └── QuizExplanation (정답/오답, 해설, 다음 문제/결과 버튼)
└── [결과]
    ├── QuizHeader
    └── QuizResult
        ├── 점수 표시 (aria-label로 접근성)
        ├── 등급 배지 (퀴즈왕 ~ 안전 교육 필요)
        ├── 문항별 정오 리뷰 (✅/❌)
        ├── 다시 도전 / 홈으로 버튼
        └── 경품 응모 → ParticipantForm (토글)
            ├── 이름, 전화번호 (자동 포맷)
            ├── 주소 (Daum 우편번호 API)
            ├── 개인정보 동의 체크박스 (토글 상세 보기)
            └── 응모 등록하기 버튼
```

### OXButton 변형 (variant)

| Variant | 조건 | 외형 |
|---|---|---|
| `neutral` | 미답변 | 기본 (파란/빨간 그라디언트) |
| `correct` | 선택한 버튼이 정답 | 초록색 + ✓ 배지 |
| `wrong` | 선택한 버튼이 오답 | 빨간색 + ✕ 배지 + 흔들림 애니메이션 |
| `correct-reveal` | 정답이지만 선택 안 함 | 초록 아웃라인 + ✓ 배지 |
| `dimmed` | 오답이고 선택 안 함 | 흐릿한 회색 |

### 등급 시스템

| 비율 | 등급 | 이모지 |
|---|---|---|
| 100% | 가스안전 퀴즈왕! | 🏆 |
| 80% 이상 | 가스안전 전문가! | ⭐ |
| 60% 이상 | 훌륭해요! | 👍 |
| 40% 이상 | 조금 더 공부해봐요 | 📚 |
| 40% 미만 | 안전 교육이 필요해요 | ⚠️ |

---

## 8. 상태 관리

### 퀴즈 진행 상태 (QuizShell 로컬 상태)

| 상태 | 타입 | 설명 |
|---|---|---|
| `index` | `number` | 현재 문제 인덱스 (0-based) |
| `phase` | `"question" \| "answered" \| "result"` | 퀴즈 단계 |
| `picks` | `(boolean \| null)[]` | 각 문제에 대한 사용자 선택 |
| `score` | `number` | 누적 정답 수 |

### 상태 전이

```
[question] → 답변 클릭 → [answered] → 다음/결과 클릭 → [question] 또는 [result]
[result] → 재시작 클릭 → [question] (index=0, score=0 리셋)
```

### 서버 상태 (TanStack Query)

| 훅 | 키 | staleTime | 설명 |
|---|---|---|---|
| `useQuiz(quizName)` | `["quizzes", quizName]` | 5분 | 단일 퀴즈 조회 |
| `useQuizzes()` | `["quizzes"]` | 5분 | 전체 퀴즈 목록 |
| `useCreateParticipant()` | — | — | 참여자 등록 mutation |
| `useParticipants()` | `["participants"]` | 1분 | 전체 참여자 목록 |

### localStorage (퀴즈 완료 이력)

```
키: kgs_quiz_completions
값: {
  "home-gas-safety": {
    "score": 4,
    "totalQuestions": 5,
    "completedAt": "2025-05-14T10:00:00.000Z"
  }
}
```

- `markCompleted(quizName, score, total)` — 마지막 문제 정답 처리 직후 호출
- `getNextQuiz()` — 미완료 퀴즈 중 첫 번째 반환, 전체 완료 시 첫 번째 재반환
- 홈 화면 카드에 완료 배지 및 점수 표시

---

## 9. 주요 기능 상세

### 이미지 프리로드

퀴즈 데이터 로드 직후 모든 문제 이미지를 브라우저 캐시에 미리 적재한다.

```ts
useEffect(() => {
  if (!quiz?.questions) return;
  quiz.questions.forEach((q) => {
    if (!q.imageUrl) return;
    const img = new window.Image();
    img.src = q.imageUrl;   // 백그라운드 다운로드 트리거
  });
}, [quiz]);
```

Q1을 푸는 동안 Q2~Q5가 캐시에 올라오므로 문제 전환 시 이미지 지연이 없다.

### 전화번호 자동 포맷

React Hook Form의 `register`를 구조 분해하여 `onChange`를 인터셉트한다.

```ts
const { onChange: phoneRhfOnChange, ...phoneReg } = register("phone", { ... });
// input onChange:
onChange={(e) => {
  e.target.value = formatPhone(e.target.value);  // 숫자→XXX-XXXX-XXXX
  phoneRhfOnChange(e);
}}
```

### 접근성 (aria)

| 요소 | 패턴 |
|---|---|
| 폼 에러 메시지 | `aria-describedby` + `role="alert"` |
| 개인정보 토글 | `aria-expanded="true"` / `"false"` (문자열 리터럴) |
| 진행 카운터 | `aria-live="polite"` |
| 진행 점 | `aria-hidden="true"` (장식 요소) |
| 점수 표시 | `aria-label="N문제 중 M개 정답"` |

### Presigned URL 흐름

```
클라이언트              API 서버              AWS
    │                    │                   │
    │── GET /api/quiz/X ─▶│                   │
    │                    │── GetItem ────────▶│ DynamoDB
    │                    │◀─ Item (imageKey) ─│
    │                    │── GetSignedUrl ───▶│ S3
    │                    │◀─ Presigned URL ───│
    │◀── Quiz + imageUrl ─│                   │
    │                    │                   │
    │── GET presignedUrl ────────────────────▶│ S3 (직접)
    │◀── 이미지 바이너리 ──────────────────────│
```

---

## 10. 환경 변수

AWS SDK 자격증명은 Amplify 환경변수로 주입된다.  
`AWS_*` 네임스페이스는 Amplify 예약어이므로 `APP_*` 접두사 사용.

| 변수명 | 설명 | 예시 |
|---|---|---|
| `APP_REGION` | AWS 리전 | `ap-northeast-2` |
| `APP_ACCESS_KEY_ID` | IAM Access Key | `AKIA...` |
| `APP_SECRET_ACCESS_KEY` | IAM Secret Key | `wJalr...` |

**빌드 시 .env.production 주입 방식 (amplify.yml)**

```yaml
- echo "APP_REGION=${APP_REGION}" >> .env.production
- echo "APP_ACCESS_KEY_ID=${APP_ACCESS_KEY_ID}" >> .env.production
- echo "APP_SECRET_ACCESS_KEY=${APP_SECRET_ACCESS_KEY}" >> .env.production
```

---

## 11. 테스트

### 테스트 환경

```
vitest.config.mts:
  environment: jsdom        # 컴포넌트 기본값
  globals: true
  setupFiles: vitest.setup.ts  (@testing-library/jest-dom)

// @vitest-environment node  # API 라우트 파일에 개별 지정
```

### 테스트 현황 (2026-05-15 기준)

| 파일 | 테스트 수 | 대상 |
|---|---|---|
| `QuizShell.test.tsx` | 13 | 상태머신, 로딩/에러, 프리로드, 답변 흐름, 점수, 재시작 |
| `QuizExplanation.test.tsx` | 7 | 정답/오답 표시, 버튼 텍스트, 콜백 |
| `QuizHeader.test.tsx` | 8 | 링크, 제목, 카운터, aria, 진행 점 |
| `QuizQuestion.test.tsx` | 7 | Presigned URL vs fallback, unoptimized, alt |
| `QuizOXButtons.test.tsx` | 7 | 클릭 콜백, disabled, variant 배지 |
| `OXButton.test.tsx` | 8 | 렌더링, 클릭, 배지 종류 |
| `QuizResult.test.tsx` | 10 | 점수 표시, 등급, 정오 표시, 버튼 |
| `ParticipantForm.test.tsx` | 10 | 렌더링, 유효성, 포맷, 주소 에러 |
| `quiz-name.test.ts` | 9 | GET API — 메서드, 파라미터, 404, 500, presigned |
| `participants.test.ts` | 14 | GET/POST API — 검증, UUID, 빈값 거부, 405 |
| `quizStorage.test.ts` | 9 | markCompleted, getCompletions, getNextQuiz |
| `utils.test.ts` | 12 | getBtnVariant, getGrade, getS3ImageUrl |
| **합계** | **124** | |

### 테스트 실행

```bash
npm run test:run    # 단발 실행
npm run test        # watch 모드
```

---

## 12. 빌드 및 배포

### 로컬 개발

```bash
npm install
npm run dev      # http://localhost:3000
```

### 프로덕션 빌드 (로컬)

```bash
npm run build
npm run start
```

### Amplify 자동 배포

`main` 브랜치에 push 시 자동 빌드 & 배포가 트리거된다.

```yaml
# amplify.yml 핵심
preBuild:
  - nvm use 22
  - node --version
  - npm ci
build:
  - echo "APP_REGION=..." >> .env.production
  - npm run build
artifacts:
  baseDirectory: .next
cache:
  paths: [".next/cache/**/*"]
```

---

## 13. 개발 이력

| 커밋 | 내용 |
|---|---|
| `79862b2` | Next.js 앱 초기 생성 (Create Next App) |
| `d7cb49f` | 가스안전 퀴즈 사이트 초기 구현 (메인 페이지, 퀴즈 화면, DynamoDB/S3 연동) |
| `980b46d` | Amplify 배포용 AWS 자격증명 처리 방식 구현 |
| `173c2d0` | 환경변수명 `AWS_*` → `APP_*` 변경 (Amplify 예약 변수 충돌 해결) |
| `ca46e58` | amplify.yml에 Node.js 22 버전 명시 |
| `f8d86c9` | Amplify 환경변수 주입 방식 변경 + `/api/health` 엔드포인트 추가 |
| `eebbd68` | 개인정보 안내 문구에 "경품 수령 외 미사용" 명시 |
| `e2f6f2b` | 퀴즈 완료 이력 localStorage 저장 및 순차 진행 구현 |
| `06d31e3` | WebP 이미지 전환 + 전체 이미지 프리로드 구현 |
| `aab9a93` | `aria-invalid` → `aria-describedby + role=alert` 패턴 교체 (axe 접근성 오류 해결) |
| `3ea1738` | `aria-expanded` boolean → 문자열 리터럴 변환 |
| `f720e05` | 응모 등록 버튼 색상 주황 → 초록 (#10b981, #059669) |
| `45480d0` | 통계 배너 제거 (실제 데이터 부재) |
| `254302b` | 안전 정보 보기 → 네이버 블로그 새 탭 연결 |
| `c0c7999` | 기업명 제거 → "강원영동 가스안전 퀴즈" 브랜딩으로 통일 |
| `98d975a` | 헤더 네비게이션 정리 (퀴즈소개 제거, 시작하기→퀴즈, 안전정보→블로그) |
| `2a73b2b` | Vitest + RTL 테스트 환경 구축 및 51개 테스트 케이스 작성 |
| `a1473eb` | package-lock.json 최초 커밋 |
| `0be46ce` | Amplify `npm ci --cache .npm --prefer-offline` → `npm ci` (EUSAGE 해결) |
| `4d32fee` | Amplify `npm install -g npm@latest` 추가 (npm 10.9.x 버그 우회) |
| `4d0d8b5` | package-lock.json 재생성 (@emnapi 크로스플랫폼 의존성 동기화) |
| `d1fdc05` | 파비콘 추가 (32, 64, 256, 512px PNG, Apple Touch Icon) |
| `6cecbf5` | 추가 우선순위 테스트 케이스 작성 (QuizShell, API, 컴포넌트 — 총 124개) |

---

## 14. 알려진 이슈 및 제약사항

### 크로스플랫폼 package-lock.json

Windows에서 생성된 `package-lock.json`은 `@img/sharp-linux-x64`의 의존성 (`@emnapi/runtime`, `@emnapi/core`)을 포함하지 않는다. Amplify(Linux) 빌드 시 `npm ci`가 실패할 수 있으므로, lockfile은 Linux 환경(WSL, Docker, Amplify 내)에서 재생성해야 한다.

**현재 임시 해결책**: `amplify.yml`에서 `npm install -g npm@latest` 후 `npm ci` 실행 → 최신 npm이 lockfile 불일치를 보다 관대하게 처리.

### Amplify 예약 환경변수

`AWS_*` 접두사 환경변수는 Amplify가 자체적으로 사용하는 예약어이다. IAM 자격증명은 반드시 `APP_*` 또는 다른 접두사를 사용해야 한다.

### S3 Presigned URL 만료

생성된 Presigned URL의 유효시간은 **1시간**이다. 브라우저 탭을 1시간 이상 열어둔 후 퀴즈를 시작하면 이미지가 로드되지 않을 수 있다. 이 경우 페이지 새로고침이 필요하다.

### 준비 중 퀴즈

현재 "가스 누출 대처", "가스 기기 점검", "안전 규정 & 법규" 3개 카테고리는 DynamoDB 데이터 미입력 상태로 UI에서 "준비 중" 배지로 표시된다. `QUIZ_LIST`에 추가하고 DynamoDB에 데이터를 삽입하면 즉시 활성화 가능하다.

### 서버사이드 입력 검증 한계

참여자 API는 필수 항목 존재 여부와 빈 문자열만 검증한다. 전화번호 형식 검증, 이름/주소 최대 길이 제한은 클라이언트(react-hook-form)에서만 이루어진다.
