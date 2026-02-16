import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { UserProvider } from "@/context/user-context";
import { AppProvider } from "@/context/app-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OnlySnow — Know Where to Ski",
  description: "Personalized ski day recommendations based on real conditions.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#16161E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-snow-surface text-snow-text`}>
        <UserProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </UserProvider>
      </body>
    </html>
  );
}
