"use client";

import { useState, useRef } from "react";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateParticipant } from "@/lib/api/participants";
import { useLanguage } from "@/app/i18n/LanguageProvider";

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


export default function ParticipantForm({
  quizName,
  score,
  totalQuestions,
}: Props) {
  const { t } = useLanguage();
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
    required: t("form.phoneRequired"),
    pattern: {
      value: /^01[0-9]-\d{3,4}-\d{4}$/,
      message: t("form.phonePattern"),
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
        <h3 className="text-xl font-black text-white mb-2">{t("form.doneTitle")}</h3>
        <p className="text-sm text-blue-200 mb-5">
          {t("form.doneDesc")}
        </p>
        <div
          className="rounded-2xl px-4 py-4"
          style={{ background: "rgba(0,0,0,0.3)" }}
        >
          <p className="text-xs text-blue-400 mb-1">{t("form.code")}</p>
          <p className="font-mono text-xl font-black text-orange-400 tracking-widest">
            {registered}
          </p>
          <p className="text-xs text-blue-400 mt-2">{t("form.codeHint")}</p>
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
            <h3 className="text-lg font-black text-white">{t("form.title")}</h3>
            <p className="text-xs text-blue-300">
              {t("form.subtitle")}
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
              {t("form.name")} <span className="text-orange-400">*</span>
            </label>
            <input
              id="participant-name"
              {...register("name", {
                required: t("form.nameRequired"),
                minLength: { value: 2, message: t("form.nameMin") },
              })}
              placeholder={t("form.namePlaceholder")}
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
              {t("form.phone")} <span className="text-orange-400">*</span>
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
              {t("form.address")} <span className="text-orange-400">*</span>
            </label>

            {/* hidden field for validation */}
            <input
              type="hidden"
              {...register("address", { required: t("form.addressRequired") })}
            />

            {/* 도로명 주소 + 검색 버튼 */}
            <div className="flex gap-2 mb-2">
              <input
                value={addressValue}
                readOnly
                placeholder={t("form.addressPlaceholder")}
                className={`${inputCls} flex-1 cursor-default`}
                style={inputStyle}
                aria-label={t("form.addressAria")}
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
                {t("form.addressSearch")}
              </motion.button>
            </div>

            {/* 상세 주소 */}
            <input
              {...detailRest}
              ref={(el) => {
                detailRHFRef(el);
                detailInputRef.current = el;
              }}
              placeholder={t("form.addressDetailPlaceholder")}
              className={inputCls}
              style={inputStyle}
              aria-label={t("form.addressDetailAria")}
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
              <span>{t("form.privacyToggle")}</span>
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
                  {t("form.privacyText")}
                </motion.pre>
              )}
            </AnimatePresence>

            {/* 체크박스 */}
            <label className="flex items-start gap-3 mt-4 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  {...register("privacyConsent", {
                    required: t("form.privacyRequired"),
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
                {t("form.privacyAgree")}{" "}
                <span className="text-orange-400 font-semibold">{t("form.required")}</span>
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
                {t("form.submitting")}
              </span>
            ) : (
              t("form.submit")
            )}
          </motion.button>
        </form>
      </motion.div>
    </>
  );
}
