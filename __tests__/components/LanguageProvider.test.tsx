import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageProvider, useLanguage } from "@/app/i18n/LanguageProvider";
import LanguageSelector from "@/app/components/LanguageSelector";

function NextLabel() {
  const { t } = useLanguage();
  return <p>{t("quiz.next")}</p>;
}

function renderWithProvider() {
  return render(
    <LanguageProvider>
      <LanguageSelector />
      <NextLabel />
    </LanguageProvider>
  );
}

describe("LanguageProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(navigator, "language", "get").mockReturnValue("ko-KR");
  });

  it("Provider 없이도 한국어로 동작한다", () => {
    render(<NextLabel />);
    expect(screen.getByText("다음 문제 →")).toBeInTheDocument();
  });

  it("기본 언어는 한국어다", () => {
    renderWithProvider();
    expect(screen.getByText("다음 문제 →")).toBeInTheDocument();
  });

  it("언어를 바꾸면 문구와 html lang이 바뀌고 localStorage에 저장된다", async () => {
    renderWithProvider();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "언어 선택" }), "en");
    expect(screen.getByText("Next question →")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem("kgs_lang")).toBe("en");
  });

  it("저장된 언어를 불러온다", async () => {
    localStorage.setItem("kgs_lang", "ja");
    renderWithProvider();
    expect(await screen.findByText("次の問題 →")).toBeInTheDocument();
  });

  it.each(["vi-VN", "en-US", "fr-FR"])(
    "저장된 언어가 없으면 브라우저 언어(%s)와 관계없이 한국어를 사용한다",
    (browserLang) => {
      vi.spyOn(navigator, "language", "get").mockReturnValue(browserLang);
      renderWithProvider();
      expect(screen.getByText("다음 문제 →")).toBeInTheDocument();
      expect(document.documentElement.lang).toBe("ko");
    }
  );
});
