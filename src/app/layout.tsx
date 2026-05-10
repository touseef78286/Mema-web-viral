import type { Metadata } from "next";
import { Anton, Geist, Geist_Mono, Permanent_Marker } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  weight: "400",
  variable: "--font-impact-ish",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  weight: "400",
  variable: "--font-permanent-marker",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  verification: {
    other: {
      monetag: "014671716b9432308077a457cd7bab43",
    },
  },
  title: "Secret Voice Message (meme mode)",
  description: "Chaotic, funny, colorful secret voice messages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${permanentMarker.variable} h-full antialiased`}
    >
      <head>
        <meta name="monetag" content="014671716b9432308077a457cd7bab43" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
