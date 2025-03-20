import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "College Application Activity Refiner | AI-Enhanced",
  description: "Format and refine your college application activity lists with AI assistance for Common App, UC, Coalition, and more",
  keywords: "college application, activities, extracurricular, common app, uc application, ai writing assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <ClientBody>
        <div className="h-screen flex flex-col">
          {children}
        </div>
      </ClientBody>
    </html>
  );
}
