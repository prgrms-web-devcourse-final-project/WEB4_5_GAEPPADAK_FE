"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/src/contexts/UserContext";
import LoginPromptProvider from "@/src/components/providers/LoginPromptProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <LoginPromptProvider>{children}</LoginPromptProvider>
        </UserProvider>
      </body>
    </html>
  );
}
