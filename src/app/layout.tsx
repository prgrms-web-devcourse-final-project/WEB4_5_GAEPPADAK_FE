"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/src/contexts/UserContext";
import LoginPromptProvider from "@/src/components/providers/LoginPromptProvider";
import Header from "@/src/components/navigation/Header";
import { ThemeProvider } from "@/src/contexts/ThemeContext";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <UserProvider>
            <LoginPromptProvider>
              <Header />
              {children}
            </LoginPromptProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
