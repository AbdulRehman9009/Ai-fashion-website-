import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Providers } from "@/components/Providers";
import ProfileWarningBanner from "@/components/ui/ProfileWarningBanner";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Style Genie - AI-Powered Custom Fashion",
  description: "Get personalized outfit recommendations powered by AI. Custom tailoring delivered to your doorstep by expert local tailors.",
  keywords: ["AI fashion", "custom tailoring", "outfit recommendations", "online tailor", "bespoke clothing"],
  openGraph: {
    title: "Style Genie - AI-Powered Custom Fashion",
    description: "Get personalized outfit recommendations powered by AI. Custom tailoring delivered to your doorstep.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          <ProfileWarningBanner />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
