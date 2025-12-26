import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Scissors, Truck, ShoppingBag } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 lg:px-12 h-16 flex items-center justify-between border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">S</div>
          <span className="text-xl font-bold tracking-tight">StyleAI</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
          <Link href="#features" className="hover:text-gray-900">Features</Link>
          <Link href="#how-it-works" className="hover:text-gray-900">How it Works</Link>
          <Link href="#" className="hover:text-gray-900">Pricing</Link>
        </nav>
        <div className="flex gap-4">
          <Link href="/auth/user/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/auth/user/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-24 lg:py-32 bg-gray-50">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gray-900 text-white hover:bg-gray-900/80">
            Now with AI Recommendations
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            The Future of <span className="text-blue-600">Fashion</span> is Here.
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
            Experience personalized outfit recommendations, custom tailoring, and swift delivery—all in one seamless platform powered by AI.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/user/register">
              <Button size="lg" className="gap-2">
                Start Styling <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/tailor/register">
              <Button size="lg" variant="outline">Join as Tailor</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="features" className="py-24 px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">One Platform, Endless Possibilities</h2>
          <p className="text-gray-500 mt-4">Designed for every role in the fashion ecosystem.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <FeatureCard 
            icon={Sparkles} 
            title="For Customers" 
            desc="Upload your photo and get AI-curated outfit recommendations tailored to your style and occasion."
            link="/auth/user/register"
          />
          <FeatureCard 
            icon={Scissors} 
            title="For Tailors" 
            desc="Receive stitching orders, manage measurements, and track progress effortlessly."
            link="/auth/tailor/register"
          />
          <FeatureCard 
            icon={ShoppingBag} 
            title="For Shopkeepers" 
            desc="Manage inventory, pricing, and orders from a centralized dashboard."
            link="/auth/shopkeeper/register"
          />
          <FeatureCard 
            icon={Truck} 
            title="For Delivery" 
            desc="Optimize routes and ensure timely deliveries with real-time tracking."
            link="/auth/delivery/register"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t bg-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="h-6 w-6 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs">S</div>
             <span className="font-bold">StyleAI</span>
          </div>
          <p className="text-sm text-gray-500">© 2025 StyleAI Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-gray-900">Privacy</Link>
            <Link href="#" className="hover:text-gray-900">Terms</Link>
            <Link href="#" className="hover:text-gray-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, link }) {
  return (
    <div className="flex flex-col items-start p-6 rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 flex-1">{desc}</p>
      <Link href={link}>
        <Button variant="link" className="p-0 h-auto font-semibold">Get Started &rarr;</Button>
      </Link>
    </div>
  )
}
