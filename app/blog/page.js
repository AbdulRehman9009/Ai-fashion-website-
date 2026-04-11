import { BookOpen, ArrowRight, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Blog - Style Genie",
    description: "Fashion tips, styling guides, and platform updates from the Style Genie team.",
};

export default function BlogPage() {
    const posts = [
        {
            title: "The Future of AI in Fashion",
            excerpt: "How artificial intelligence is transforming the way we design, create, and wear custom clothing.",
            category: "Technology",
            date: "Coming Soon",
            color: "indigo"
        },
        {
            title: "5 Tips for Perfect Measurements",
            excerpt: "Getting accurate measurements is the key to a perfect fit. Here's how to do it right every time.",
            category: "Guides",
            date: "Coming Soon",
            color: "purple"
        },
        {
            title: "Supporting Local Tailors",
            excerpt: "How Style Genie is helping traditional craftspeople thrive in the digital age.",
            category: "Community",
            date: "Coming Soon",
            color: "emerald"
        },
    ];

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
                        <BookOpen className="h-4 w-4" />
                        Style Genie Blog
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Insights & Inspiration
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Fashion tips, platform updates, and stories from our community of tailors and designers.
                    </p>
                </div>
            </section>

            {/* Coming Soon Banner */}
            <section className="pb-8">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center text-white">
                        <Bell className="h-10 w-10 mx-auto mb-4 opacity-80" />
                        <h2 className="text-2xl font-bold mb-2">Blog Launching Soon!</h2>
                        <p className="text-indigo-100 max-w-lg mx-auto mb-6">
                            We're working on curating the best fashion and tech content for you. Stay tuned for our launch.
                        </p>
                        <Link href="/auth/user/register">
                            <Button className="bg-white text-indigo-600 hover:bg-indigo-50 h-12 px-6 font-semibold shadow-lg">
                                Get Notified <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Preview Posts */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Upcoming Articles</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        {posts.map((post, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className={`h-2 ${post.color === "indigo" ? "bg-indigo-500" : post.color === "purple" ? "bg-purple-500" : "bg-emerald-500"}`} />
                                <div className="p-6">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.color === "indigo" ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300" : post.color === "purple" ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"}`}>
                                        {post.category}
                                    </span>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{post.title}</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{post.excerpt}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-4 font-medium">{post.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
