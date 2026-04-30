import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Merge Service",
  description: "Merge PDF files from the web UI or local CLI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
