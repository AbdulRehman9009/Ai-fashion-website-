import "./globals.css";

import { Providers } from "@/components/Providers";
import ProfileWarningBanner from "@/components/ui/ProfileWarningBanner";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import CartGlobalButton from "@/components/cart/CartGlobalButton";

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
      <body className="antialiased">
        <Providers>
          <Navbar />
          <ProfileWarningBanner />
          {children}
          <CartGlobalButton />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
