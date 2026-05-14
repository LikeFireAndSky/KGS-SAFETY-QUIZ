import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "가스안전 퀴즈왕 | 강원영동 가스안전 퀴즈",
  description:
    "가스 생활 안전에 대한 재미있는 퀴즈로 안전 지식을 확인하고 퀴즈왕에 도전하세요! 강원영동 가스안전 퀴즈",
  icons: {
    icon: [
      { url: "/images/favicons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicons/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/images/favicons/favicon-256.png", sizes: "256x256", type: "image/png" },
    ],
    shortcut: "/images/favicons/favicon-32.png",
    apple: { url: "/images/favicons/favicon-preview-512.png", sizes: "512x512", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
