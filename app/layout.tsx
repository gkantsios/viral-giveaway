import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HapGiveaway — Viral Giveaways That Grow Your Email List",
  description:
    "Run viral giveaways to grow your email list. Easy setup, referral tracking, and ESP integrations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
