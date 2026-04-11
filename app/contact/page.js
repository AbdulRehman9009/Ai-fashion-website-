import { Mail, MapPin, Phone, Clock, MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Contact Us - Style Genie",
    description: "Get in touch with the Style Genie team. We're here to help with questions about our AI-powered fashion platform.",
};

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Hero */}
            <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-600/20 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
                <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">Get in Touch</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Have questions or feedback? We'd love to hear from you. Our team is here to help.
                    </p>
                </div>
            </section>

            {/* Contact Grid */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h2>
                                <p className="text-slate-600 dark:text-slate-400 mb-8">
                                    Reach out through any of the channels below. We typically respond within 24 hours.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { icon: Mail, label: "Email", value: "support@stylegenie.com", href: "mailto:support@stylegenie.com" },
                                    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567", href: "tel:+15551234567" },
                                    { icon: MapPin, label: "Office", value: "123 Fashion Avenue, New York, NY 10001" },
                                    { icon: Clock, label: "Hours", value: "Mon–Fri: 9:00 AM – 6:00 PM EST" },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                        <div className="p-2.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                                            {item.href ? (
                                                <a href={item.href} className="text-slate-900 dark:text-white font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <p className="text-slate-900 dark:text-white font-medium">{item.value}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                Send a Message
                            </h3>
                            <form className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                                        <input type="text" className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                                        <input type="text" className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                                    <input type="email" className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
                                    <select className="w-full h-11 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                                        <option value="">Select a topic</option>
                                        <option>General Inquiry</option>
                                        <option>Technical Support</option>
                                        <option>Partnership</option>
                                        <option>Feedback</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Message</label>
                                    <textarea rows={4} className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none" placeholder="Tell us how we can help..." />
                                </div>
                                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 text-base font-semibold">
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Message
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
