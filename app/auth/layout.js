"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shirt } from "lucide-react";

export default function AuthLayout({ children }) {
  // Use static content to avoid SSR issues with usePathname
  const heroImage = "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop";
  const title = "Welcome to Style Genie";
  const subtitle = "Your AI-powered fashion companion for discovering your perfect style.";
  const Icon = Shirt;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Column - Hero/Brand (Hidden on Mobile) */}
      <div className="hidden lg:relative lg:flex lg:flex-col lg:justify-between lg:p-12 text-white overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-zinc-900/40 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${heroImage})` }}
        />

        {/* Animated Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

        {/* Brand Logo */}
        <div className="relative z-20 flex items-center gap-2 font-bold text-2xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <span className="text-white">AI</span>
          </div>
          <span>Style Genie</span>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 border border-white/30 text-white">
              <Icon className="w-6 h-6" />
            </div>

            <h1 className="text-4xl font-bold mb-4 tracking-tight leading-tight">
              {title}
            </h1>
            <p className="text-lg text-white/80 leading-relaxed font-light">
              {subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-black/50 bg-gray-200 bg-cover" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${10 + i})` }} />
              ))}
            </div>
            <div className="text-sm">
              <div className="font-semibold text-white">4.9/5 Rating</div>
              <div className="text-white/60">from 20k+ users</div>
            </div>
          </motion.div>
        </div>

        {/* Footer Links */}
        <div className="relative z-20 flex gap-6 text-sm text-white/60">
          <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="relative flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}
