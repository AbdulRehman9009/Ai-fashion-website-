import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Scissors, Truck, ShoppingBag, CheckCircle, Star, HelpCircle, Instagram, Twitter, Facebook, Mail } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const dashboardLink = session ? `/dashboard/${session.user.role.toLowerCase()}` : "/auth/user/login";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50 shadow-sm transition-all duration-300">
        <Link href={dashboardLink} className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold shadow-lg transform hover:scale-105 transition-transform">S</div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">StyleAI</span>
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
          <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-gray-900 transition-colors">How it Works</Link>
          <Link href="#reviews" className="hover:text-gray-900 transition-colors">Reviews</Link>
          <Link href="#faq" className="hover:text-gray-900 transition-colors">FAQ</Link>
        </nav>
        <div className="flex gap-4">
          {session ? (
            <Link href={dashboardLink}>
              <Button className="bg-gray-900 text-white hover:bg-gray-800 shadow-md">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/user/login">
                <Button variant="ghost" className="hover:bg-gray-100 text-gray-700">Sign In</Button>
              </Link>
              <Link href="/auth/user/register">
                <Button className="bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg transition-all">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center items-center text-center px-6 py-32 lg:py-48 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white opacity-70"></div>
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-purple-100 rounded-full blur-3xl opacity-30 mix-blend-multiply filter animate-blob"></div>
        <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] bg-blue-100 rounded-full blur-3xl opacity-30 mix-blend-multiply filter animate-blob animation-delay-2000"></div>

        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gray-900 text-white hover:bg-gray-800 shadow-sm cursor-default">
            <Sparkles className="mr-2 h-3.5 w-3.5 text-yellow-300" />
            Now with AI Recommendations
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-gray-900 leading-tight text-balance">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Fashion</span> is Here.
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl leading-relaxed text-balance">
            Experience personalized outfit recommendations, custom tailoring, and swift delivery—all in one seamless platform powered by advanced AI.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href={dashboardLink ?? "/auth/user/register"}>
              <Button size="lg" className="h-12 px-8 gap-2 text-base shadow-xl hover:translate-y-[-2px] transition-all bg-gray-900">
                {session ? "Go to Dashboard" : "Start Styling"} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/tailor/register">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-white/50 backdrop-blur-sm hover:bg-white border-gray-200">
                Join as Tailor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section (Trust Indicators) */}
      <section className="py-12 border-y border-gray-100 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-gray-900">10k+</h3>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Happy Users</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-gray-900">5k+</h3>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Designs Created</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-gray-900">99%</h3>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Delivery Success</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-gray-900">24/7</h3>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Support</p>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="features" className="py-24 px-6 lg:px-12 bg-gray-50/50">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">One Platform, Endless Possibilities</h2>
          <p className="text-gray-500 mt-4 text-lg">Designed for every role in the fashion ecosystem, connecting everyone seamlessly.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <FeatureCard
            icon={Sparkles}
            title="For Customers"
            desc="Upload your photo and get AI-curated outfit recommendations tailored to your style and occasion."
            link="/auth/user/register"
            color="bg-blue-50 text-blue-600"
          />
          <FeatureCard
            icon={Scissors}
            title="For Tailors"
            desc="Receive stitching orders, manage measurements, and track progress effortlessly."
            link="/auth/tailor/register"
            color="bg-purple-50 text-purple-600"
          />
          <FeatureCard
            icon={ShoppingBag}
            title="For Shopkeepers"
            desc="Manage inventory, pricing, and orders from a centralized dashboard."
            link="/auth/shopkeeper/register"
            color="bg-orange-50 text-orange-600"
          />
          <FeatureCard
            icon={Truck}
            title="For Delivery"
            desc="Optimize routes and ensure timely deliveries with real-time tracking."
            link="/auth/delivery/register"
            color="bg-green-50 text-green-600"
          />
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How StyleAI Works</h2>
            <p className="text-gray-500 mt-4 text-lg">From inspiration to reality in four simple steps.</p>
          </div>

          <div className="relative grid md:grid-cols-4 gap-8">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gray-200 -z-10"></div>

            <StepCard number="1" title="Upload Photo" desc="Take a picture and upload it to our AI engine." />
            <StepCard number="2" title="Get Styled" desc="Receive personalized outfit recommendations instantly." />
            <StepCard number="3" title="Order & Tailor" desc="Select your size or choose custom tailoring options." />
            <StepCard number="4" title="Fast Delivery" desc="Track your order as it arrives at your doorstep." />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="reviews" className="py-24 px-6 lg:px-12 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What Our Users Say</h2>
            <p className="text-gray-400 mt-4 text-lg">Join the thousands redefining their style.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ReviewCard
              quote="The AI recommendations are spot on! I found my perfect wedding guest outfit in minutes."
              author="Sarah J."
              role="Fashion Enthusiast"
            />
            <ReviewCard
              quote="As a tailor, this platform has doubled my business. Managing orders is so easy now."
              author="Michael R."
              role="Professional Tailor"
            />
            <ReviewCard
              quote="Fast delivery and great quality. The custom fitting option is a game changer."
              author="Emily T."
              role="Verified Buyer"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            <AccordionItem
              question="How accurate is the AI sizing?"
              answer="Our AI analyzes your body shape from your uploaded photo to suggest the best fits, and you can also provide exact measurements for tailoring."
            />
            <AccordionItem
              question="Can I return custom tailored items?"
              answer="Custom tailored items are unique to you, so returns are only accepted for defects. However, we offer free alterations if the fit isn't perfect."
            />
            <AccordionItem
              question="How long does delivery take?"
              answer="Standard delivery is 3-5 days. With urgent delivery, you can receive your order in as little as 24-48 hours."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-12 text-center bg-white">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">

          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to Transform Your Style?</h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">Join StyleAI today and unlock a world of personalized fashion at your fingertips.</p>
            <Link href="/auth/user/register">
              <Button size="lg" className="h-14 px-10 text-lg bg-white text-blue-700 hover:bg-gray-100 font-semibold shadow-lg">
                Get Started for Free
              </Button>
            </Link>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-bold">S</div>
              <span className="font-bold text-xl">StyleAI</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Revolutionizing the fashion industry with AI-driven personalization and seamless logistics.
            </p>
            <div className="flex gap-4">
              <SocialIcon Icon={Instagram} />
              <SocialIcon Icon={Twitter} />
              <SocialIcon Icon={Facebook} />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-blue-600">Features</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Pricing</Link></li>
              <li><Link href="#" className="hover:text-blue-600">About Us</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Cookie Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Stay Updated</h4>
            <p className="text-sm text-gray-500 mb-4">Subscribe to our newsletter for the latest trends.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <Button size="sm" className="bg-gray-900">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          © 2025 StyleAI Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, link, color }) {
  return (
    <div className="group flex flex-col items-start p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`h-14 w-14 rounded-2xl ${color} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-500 mb-8 flex-1 leading-relaxed">{desc}</p>
      <Link href={link} className="w-full">
        <Button variant="ghost" className="w-full group-hover:bg-gray-50 justify-between">
          Get Started <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </div>
  )
}

function StepCard({ number, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center relative z-10">
      <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-lg ring-4 ring-white">
        {number}
      </div>
      <h3 className="font-bold text-lg mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-500 text-sm max-w-[200px]">{desc}</p>
    </div>
  )
}

function ReviewCard({ quote, author, role }) {
  return (
    <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />)}
      </div>
      <p className="text-gray-300 mb-6 italic leading-relaxed">"{quote}"</p>
      <div>
        <div className="font-bold text-white">{author}</div>
        <div className="text-xs text-blue-400 font-medium uppercase tracking-wide">{role}</div>
      </div>
    </div>
  )
}

function AccordionItem({ question, answer }) {
  return (
    <details className="group border border-gray-200 rounded-lg bg-white overflow-hidden open:shadow-md transition-shadow">
      <summary className="flex items-center justify-between p-4 cursor-pointer list-none font-medium text-gray-900 hover:bg-gray-50 transition-colors">
        <span>{question}</span>
        <span className="transition-transform group-open:rotate-180">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </summary>
      <div className="p-4 pt-0 text-gray-500 leading-relaxed border-t border-gray-100 bg-gray-50/50">
        {answer}
      </div>
    </details>
  )
}

function SocialIcon({ Icon }) {
  return (
    <a href="#" className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors">
      <Icon className="h-4 w-4" />
    </a>
  )
}
