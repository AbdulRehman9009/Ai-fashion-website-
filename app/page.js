import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Scissors, Truck, MonitorSmartphone, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2670&auto=format&fit=crop"
            alt="Fashion Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Perfect Fit, <span className="text-blue-400">Powered by AI</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Experience the future of tailoring. Get custom-fitted clothes delivered to your doorstep, styled by AI and crafted by expert local tailors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/user/register">
                <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 bg-blue-600 hover:bg-blue-700">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 border-gray-500 text-gray-300 hover:bg-white/10 hover:text-white">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Three simple steps to your perfect outfit.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MonitorSmartphone,
                title: "1. AI Styling",
                desc: "Get personalized outfit recommendations based on your preferences and body type using our advanced AI."
              },
              {
                icon: Scissors,
                title: "2. Custom Tailoring",
                desc: "Choose your fabric and design. Expert tailors craft your garment with precision and care."
              },
              {
                icon: Truck,
                title: "3. Direct Delivery",
                desc: "Your custom-made outfit is delivered directly to your doorstep, ready to wear and impress."
              }
            ].map((step, idx) => (
              <div key={idx} className="relative p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-100 transition-colors">
                <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 mx-auto">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{step.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">Why Choose Us?</h2>
              <div className="space-y-6">
                {[
                  "Guaranteed perfect fit with our measurement technology",
                  "Support local artisans and sustainable fashion",
                  "Fast turnaround times with urgent delivery options",
                  "Competitive pricing transparently calculated"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="mt-1 bg-blue-500/20 p-1.5 rounded-full">
                      <ShieldCheck className="h-5 w-5 text-blue-400" />
                    </div>
                    <p className="text-lg text-gray-300">{benefit}</p>
                  </div>
                ))}
              </div>
              <Link href="/about">
                <Button variant="outline" className="mt-4 border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white">
                  Read Our Story
                </Button>
              </Link>
            </div>
            <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1598554747436-c9293d6a588f?q=80&w=2574&auto=format&fit=crop"
                alt="Tailor at work"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Wardrobe?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have discovered the joy of perfectly fitted custom clothing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/user/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 text-lg font-semibold shadow-lg">
                Create Free Account
              </Button>
            </Link>
            <Link href="/auth/tailor/register">
              <Button size="lg" variant="outline" className="border-blue-400 text-white hover:bg-blue-700 h-14 px-8 text-lg">
                Join as a Tailor
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
