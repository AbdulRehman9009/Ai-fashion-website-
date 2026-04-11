import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Scissors, Truck, MonitorSmartphone, Star, ShieldCheck, Sparkles, Users, Award, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden py-16 lg:py-24">
        {/* Decorative Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/30 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm mb-6">
                <Sparkles className="h-4 w-4" />
                AI-Powered Fashion Revolution
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
                Perfect Fit, <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Powered by AI</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-lg">
                Experience the future of tailoring. Get custom-fitted clothes delivered to your doorstep, styled by AI and crafted by expert local tailors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/user/register">
                  <Button size="lg" className="w-full sm:w-auto text-base h-14 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all border-0">
                    Start Your Style Journey <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-14 px-8 border-slate-500 bg-transparent text-slate-200 hover:bg-white/10 hover:text-white backdrop-blur-sm">
                    See How It Works
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 sm:gap-10 mt-10 pt-10 border-t border-slate-700/50">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">10K+</div>
                  <div className="text-xs sm:text-sm text-slate-400">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">500+</div>
                  <div className="text-xs sm:text-sm text-slate-400">Expert Tailors</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-bold text-white">
                    4.9 <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400">Average Rating</div>
                </div>
              </div>
            </div>

            {/* Hero Visual - Abstract Shapes replacing problematic images */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative w-[450px] h-[500px]">
                {/* Main Card */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 shadow-2xl" />

                {/* Decorative Elements */}
                <div className="absolute top-8 left-8 right-8">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Sparkles className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">AI Style Assistant</p>
                      <p className="text-sm text-slate-300">Personalized for You</p>
                    </div>
                  </div>
                </div>

                {/* Floating Stats */}
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                      <div className="text-2xl font-bold text-white">98%</div>
                      <div className="text-xs text-slate-300">Accuracy</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                      <div className="text-2xl font-bold text-white">24hr</div>
                      <div className="text-xs text-slate-300">Fast Delivery</div>
                    </div>
                  </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-indigo-500/30 rounded-full blur-2xl animate-pulse" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500/30 rounded-full blur-2xl animate-pulse" />
                <div className="absolute top-1/2 -right-10 w-20 h-20 bg-pink-500/20 rounded-full blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-gray-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.05),transparent_50%)]" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
              <Clock className="h-4 w-4" />
              Simple 3-Step Process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">From AI recommendations to doorstep delivery, we've made custom fashion effortless.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: MonitorSmartphone,
                title: "AI Styling",
                step: "01",
                desc: "Upload your photo and get personalized outfit recommendations based on your preferences, body type, and the occasion.",
                color: "indigo"
              },
              {
                icon: Scissors,
                title: "Custom Tailoring",
                step: "02",
                desc: "Choose your fabric and design. Expert local tailors craft your garment with precision, care, and years of experience.",
                color: "purple"
              },
              {
                icon: Truck,
                title: "Direct Delivery",
                step: "03",
                desc: "Your custom-made outfit is delivered directly to your doorstep, ready to wear and make a lasting impression.",
                color: "emerald"
              }
            ].map((step, idx) => (
              <div key={idx} className="group relative">
                <div className="relative p-6 lg:p-8 rounded-2xl bg-white dark:bg-gray-800 border border-slate-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                  {/* Step Number */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>

                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:scale-110 ${step.color === "indigo" ? "bg-indigo-100 text-indigo-600" :
                    step.color === "purple" ? "bg-purple-100 text-purple-600" :
                      "bg-emerald-100 text-emerald-600"
                    }`}>
                    <step.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm lg:text-base">{step.desc}</p>
                </div>

                {/* Connector Line */}
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 lg:-right-4 w-6 lg:w-8 border-t-[3px] border-dashed border-slate-300 dark:border-slate-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-28 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
                <Award className="h-4 w-4" />
                Why Choose Style Genie
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                The Future of <span className="text-indigo-600 dark:text-indigo-400">Custom Fashion</span>
              </h2>
              <p className="text-lg text-slate-600 dark:text-gray-400 mb-8">
                We combine cutting-edge AI technology with traditional craftsmanship to deliver a fashion experience like no other.
              </p>

              <div className="grid gap-4">
                {[
                  { icon: ShieldCheck, title: "Perfect Fit Guarantee", desc: "Our AI ensures accurate measurements for a flawless fit every time." },
                  { icon: Users, title: "Support Local Artisans", desc: "Every order supports skilled local tailors and sustainable fashion." },
                  { icon: Clock, title: "Fast Turnaround", desc: "Urgent delivery options available for time-sensitive occasions." },
                  { icon: Star, title: "Premium Quality", desc: "Only the finest fabrics and meticulous attention to detail." },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Card replacing problematic images */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 p-8 lg:p-12">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                <div className="relative z-10">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm text-center">
                      <div className="text-4xl lg:text-5xl font-bold text-white mb-2">10K+</div>
                      <div className="text-indigo-100 text-sm">Orders Completed</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm text-center">
                      <div className="text-4xl lg:text-5xl font-bold text-white mb-2">500+</div>
                      <div className="text-indigo-100 text-sm">Expert Tailors</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm text-center">
                      <div className="text-4xl lg:text-5xl font-bold text-white mb-2">98%</div>
                      <div className="text-indigo-100 text-sm">Satisfaction Rate</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm text-center">
                      <div className="text-4xl lg:text-5xl font-bold text-white mb-2">4.9</div>
                      <div className="text-indigo-100 text-sm flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-amber-300 text-amber-300" /> Rating
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role CTAs */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Join Our Platform</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">Choose how you want to be part of the Style Genie revolution.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                title: "As a Customer",
                desc: "Get AI-powered style recommendations and custom-fitted clothes delivered to you.",
                href: "/auth/user/register",
                color: "indigo",
                icon: "👤"
              },
              {
                title: "As a Tailor",
                desc: "Join our network of expert tailors and grow your business with more orders.",
                href: "/auth/tailor/register",
                color: "purple",
                icon: "✂️"
              },
              {
                title: "As a Shopkeeper",
                desc: "List your products and reach thousands of customers looking for quality fashion.",
                href: "/auth/shopkeeper/register",
                color: "amber",
                icon: "🏪"
              },
            ].map((role, idx) => (
              <Link key={idx} href={role.href} className="group">
                <div className={`p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 h-full hover:-translate-y-1 bg-white dark:bg-gray-800 ${role.color === "indigo" ? "border-indigo-200 dark:border-indigo-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-indigo-900/30" :
                  role.color === "purple" ? "border-purple-200 dark:border-purple-900 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg hover:shadow-purple-100 dark:hover:shadow-purple-900/30" :
                    "border-amber-200 dark:border-amber-900 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg hover:shadow-amber-100 dark:hover:shadow-amber-900/30"
                  }`}>
                  <div className="text-4xl mb-4">{role.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{role.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm lg:text-base">{role.desc}</p>
                  <div className={`inline-flex items-center gap-1 font-medium ${role.color === "indigo" ? "text-indigo-600 dark:text-indigo-400" :
                    role.color === "purple" ? "text-purple-600 dark:text-purple-400" :
                      "text-amber-600 dark:text-amber-400"
                    }`}>
                    Get Started <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Transform Your Wardrobe?</h2>
          <p className="text-lg lg:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have discovered the joy of perfectly fitted custom clothing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/user/register">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 h-14 px-8 lg:px-10 text-base lg:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all border-0">
                Create Free Account
              </Button>
            </Link>
            <Link href="/auth/tailor/register">
              <Button size="lg" variant="outline" className="border-2 border-white/50 text-white hover:bg-white/10 h-14 px-8 lg:px-10 text-base lg:text-lg backdrop-blur-sm">
                Join as a Tailor
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

