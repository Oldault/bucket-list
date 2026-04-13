import type { Metadata } from "next";
import { Instrument_Serif, EB_Garamond, Geist_Mono } from "next/font/google";
import "./globals.css";

const display = Instrument_Serif({
  variable: "--nf-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = EB_Garamond({
  variable: "--nf-body",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--nf-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The book of us",
  description: "A shared bucket list for couples — pinned to a map, sorted by season.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
