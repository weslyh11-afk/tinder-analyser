import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tinder Profile Analyser",
  description:
    "Get an honest, research-backed score for your Tinder profile with AI-powered photo analysis and bio feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
