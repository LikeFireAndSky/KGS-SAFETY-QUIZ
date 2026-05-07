"use client";

import { useState, useRef } from "react";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateParticipant } from "@/lib/api/participants";

/* ── Daum 우편번호 타입 선언 ──────────────────────────── */
interface DaumPostcodeData {
  address: string;
  zonecode: string;
  bname: string;
  buildingName: string;
}
declare global {
  interface Window {
    daum?: {
      Postcode: new (opts: {
        oncomplete: (data: DaumPostcodeData) => void;
      }) => { open: () => void };
    };
  }
}

/* ── Form 타입 ───────────────────────────────────────── */
interface FormValues {
  name: string;
  phone: string;
  address: string;
  addressDetail: string;
  privacyConsent: boolean;
}

interface Props {
  quizName: string;
  score: number;
  totalQuestions: number;
}

/* ── 공통 인풋 스타일 ─────────────────────────────────── */
const inputCls =
  "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-blue-400/60 outline-none transition-all focus:ring-2";
const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
};
const PRIVACY_TEXT = `■ 개인정보 수집·이용 동의 (필수)

수집 항목  : 이름, 전화번호, 주소
수집 목적  : 퀴즈 이벤트 당첨자 선정 및 경품 발송
보유 기간  : 이벤트 종료 후 3개월 후 파기
위탁 내용  : 경품 배송사에 배송 목적으로 이름·주소 제공

🔒 수집된 개인정보는 오직 경품 수령 목적으로만 사용되며,
   그 외의 어떠한 목적(마케팅, 홍보, 제3자 제공 등)으로도
   일절 활용되지 않습니다.

※ 위 동의를 거부할 권리가 있으나, 거부 시 이벤트 참여가 불가능합니다.`;

export default function ParticipantForm({
  quizName,
  score,
  totalQuestions,
}: Props) {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [registered, setRegistered] = useState<string | null>(null);
  const detailInputRef = useRef<HTMLInputElement | null>(null);

  const { mutate: create, isPending } = useCreateParticipant();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      addressDetail: "",
      privacyConsent: false,
    },
  });

  // address 필드는 Daum으로 채우기 때문에 watch로 표시
  const addressValue = watch("address");

  // phone: formatPhone 먼저 실행 후 RHF onChange 호출 → 포맷된 값이 유효성 검사에 반영됨
  const { onChange: phoneRhfOnChange, ...phoneReg } = register("phone", {
    required: "전화번호를 입력해주세요.",
    pattern: {
      value: /^01[0-9]-\d{3,4}-\d{4}$/,
      message: "형식을 확인해주세요. (예: 010-1234-5678)",
    },
  });

  // react-hook-form의 ref와 커스텀 ref 병합
  const { ref: detailRHFRef, ...detailRest } = register("addressDetail");

  function openPostcode() {
    if (!window.daum) return;
    new window.daum.Postcode({
      oncomplete: (data) => {
        setValue("address", data.address, { shouldValidate: true });
        detailInputRef.current?.focus();
      },
    }).open();
  }

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length > 7)
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    if (digits.length > 3)
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return digits;
  }

  function onSubmit(data: FormValues) {
    create(
      {
        name: data.name,
        phone: data.phone,
        address: [data.address, data.addressDetail].filter(Boolean).join(" "),
        quizName,
        score,
        totalQuestions,
      },
      {
        onSuccess: (participant) => {
          setRegistered(participant["KGS-Participants-Code"]);
        },
      }
    );
  }

  /* ── 등록 완료 화면 ───────────────────────────────── */
  if (registered) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="rounded-3xl p-6 text-center"
        style={{
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.3)",
        }}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl mb-4"
          aria-hidden="true"
        >
          🎉
        </motion.div>
        <h3 className="text-xl font-black text-white mb-2">응모 등록 완료!</h3>
        <p className="text-sm text-blue-200 mb-5">
          당첨 시 입력하신 연락처로 개별 안내 드립니다.
        </p>
        <div
          className="rounded-2xl px-4 py-4"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <p className="text-xs text-blue-400 mb-1">참가 코드</p>
          <p className="font-mono text-xl font-black text-orange-400 tracking-widest">
            {registered}
          </p>
          <p className="text-xs text-blue-400 mt-2">이 코드를 메모해 두세요.</p>
        </div>
      </motion.div>
    );
  }

  /* ── 등록 폼 ──────────────────────────────────────── */
  return (
    <>
      {/* Daum 우편번호 스크립트 */}
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        strategy="lazyOnload"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl p-6"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl" aria-hidden="true">🎁</span>
          <div>
            <h3 className="text-lg font-black text-white">경품 응모 등록</h3>
            <p className="text-xs text-blue-300">
              당첨 시 입력하신 주소로 경품을 발송해 드립니다.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5"
        >
          {/* ── 이름 ────────────────────────────────── */}
          <div>
            <label
              htmlFor="participant-name"
              className="block text-sm font-semibold text-blue-200 mb-1.5"
            >
              이름 <span className="text-orange-400">*</span>
            </label>
            <input
              id="participant-name"
              {...register("name", {
                required: "이름을 입력해주세요.",
                minLength: { value: 2, message: "2글자 이상 입력해주세요." },
              })}
              placeholder="홍길동"
              className={inputCls}
              style={inputStyle}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" role="alert" className="mt-1 text-xs text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* ── 전화번호 ──────────────────────────────── */}
          <div>
            <label
              htmlFor="participant-phone"
              className="block text-sm font-semibold text-blue-200 mb-1.5"
            >
              전화번호 <span className="text-orange-400">*</span>
            </label>
            <input
              id="participant-phone"
              {...phoneReg}
              onChange={(e) => {
                e.target.value = formatPhone(e.target.value);
                phoneRhfOnChange(e);
              }}
              placeholder="010-1234-5678"
              type="tel"
              inputMode="numeric"
              className={inputCls}
              style={inputStyle}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
            {errors.phone && (
              <p id="phone-error" role="alert" className="mt-1 text-xs text-red-400">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* ── 주소 ─────────────────────────────────── */}
          <div>
            <label className="block text-sm font-semibold text-blue-200 mb-1.5">
              주소 <span className="text-orange-400">*</span>
            </label>

            {/* hidden field for validation */}
            <input
              type="hidden"
              {...register("address", { required: "주소를 검색해주세요." })}
            />

            {/* 도로명 주소 + 검색 버튼 */}
            <div className="flex gap-2 mb-2">
              <input
                value={addressValue}
                readOnly
                placeholder="주소 검색 버튼을 클릭하세요"
                className={`${inputCls} flex-1 cursor-default`}
                style={inputStyle}
                aria-label="도로명 주소"
                aria-describedby={errors.address ? "address-error" : undefined}
              />
              <motion.button
                type="button"
                onClick={openPostcode}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="shrink-0 px-4 py-3 rounded-xl text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  boxShadow: "0 0 12px rgba(59,130,246,0.3)",
                }}
              >
                주소 검색
              </motion.button>
            </div>

            {/* 상세 주소 */}
            <input
              {...detailRest}
              ref={(el) => {
                detailRHFRef(el);
                detailInputRef.current = el;
              }}
              placeholder="상세 주소 (동, 호수 등)"
              className={inputCls}
              style={inputStyle}
              aria-label="상세 주소"
            />
            {errors.address && (
              <p id="address-error" role="alert" className="mt-1 text-xs text-red-400">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* ── 개인정보 동의 ───────────────────────── */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* 토글 버튼 */}
            <button
              type="button"
              onClick={() => setPrivacyOpen((v) => !v)}
              className="flex items-center justify-between w-full text-sm font-semibold text-blue-200 hover:text-white transition-colors"
              aria-expanded={privacyOpen ? "true" : "false"}
            >
              <span>개인정보 수집·이용 동의 내용 보기</span>
              <motion.span
                animate={{ rotate: privacyOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                aria-hidden="true"
              >
                ▼
              </motion.span>
            </button>

            {/* 동의 내용 */}
            <AnimatePresence>
              {privacyOpen && (
                <motion.pre
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden whitespace-pre-wrap text-xs text-blue-300 leading-relaxed mt-3 pt-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {PRIVACY_TEXT}
                </motion.pre>
              )}
            </AnimatePresence>

            {/* 체크박스 */}
            <label className="flex items-start gap-3 mt-4 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  {...register("privacyConsent", {
                    required: "개인정보 수집·이용에 동의해주세요.",
                  })}
                  className="sr-only peer"
                />
                <div
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all peer-checked:border-orange-500"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    borderColor: errors.privacyConsent
                      ? "rgb(239,68,68)"
                      : "rgba(255,255,255,0.2)",
                  }}
                  aria-hidden="true"
                >
                  <motion.svg
                    className="w-3 h-3 text-orange-400"
                    fill="none"
                    viewBox="0 0 12 12"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={
                      watch("privacyConsent")
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0, scale: 0 }
                    }
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2 6l3 3 5-5"
                    />
                  </motion.svg>
                </div>
              </div>
              <span className="text-sm text-blue-200 group-hover:text-white transition-colors leading-snug">
                개인정보 수집·이용에 동의합니다.{" "}
                <span className="text-orange-400 font-semibold">(필수)</span>
              </span>
            </label>

            {errors.privacyConsent && (
              <p className="mt-2 text-xs text-red-400">
                {errors.privacyConsent.message}
              </p>
            )}
          </div>

          {/* ── 제출 버튼 ───────────────────────────── */}
          <motion.button
            type="submit"
            disabled={isPending}
            whileHover={!isPending ? { scale: 1.03, boxShadow: "0 0 30px rgba(16,185,129,0.45)" } : {}}
            whileTap={!isPending ? { scale: 0.97 } : {}}
            className="w-full py-4 rounded-2xl font-bold text-white text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 0 20px rgba(16,185,129,0.3)",
            }}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  aria-hidden="true"
                />
                등록 중…
              </span>
            ) : (
              "응모 등록하기 🎁"
            )}
          </motion.button>
        </form>
      </motion.div>
    </>
  );
}
