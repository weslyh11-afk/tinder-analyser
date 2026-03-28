import type { Metadata } from "next";
import "./globals.css";

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
      <body className="bg-gray-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
