"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export default function Footer() {
    const pathname = usePathname();

    if (pathname?.startsWith("/dashboard")) {
        return null;
    }

    return (
        <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                                <span className="text-lg font-bold text-slate-900 font-serif">S</span>
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">Style Genie</span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Revolutionizing fashion with AI-driven tailoring and measurements. Connect with expert tailors and shop premium fabrics.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="https://twitter.com/stylegenie" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-slate-400 hover:text-white transition-colors p-1"><Twitter className="h-5 w-5" /></a>
                            <a href="https://instagram.com/stylegenie" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-white transition-colors p-1"><Instagram className="h-5 w-5" /></a>
                            <a href="https://linkedin.com/company/stylegenie" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-slate-400 hover:text-white transition-colors p-1"><Linkedin className="h-5 w-5" /></a>
                        </div>
                    </div>

                    
                    <div>
                        <h3 className="font-semibold text-white mb-4 uppercase text-xs tracking-wider">Company</h3>
                        <ul className="space-y-3 text-sm text-slate-300">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    
                    <div>
                        <h3 className="font-semibold text-white mb-4 uppercase text-xs tracking-wider">Resources</h3>
                        <ul className="space-y-3 text-sm text-slate-300">
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="/guides" className="hover:text-white transition-colors">Measurement Guides</Link></li>
                            <li><Link href="/partners" className="hover:text-white transition-colors">Partners</Link></li>
                        </ul>
                    </div>

                    
                    <div>
                        <h3 className="font-semibold text-white mb-4 uppercase text-xs tracking-wider">Legal</h3>
                        <ul className="space-y-3 text-sm text-slate-300">
                            <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/legal/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                        </ul>

                        <div className="mt-6 pt-6 border-t border-slate-800">
                            <p className="text-xs text-slate-500 mb-2">Role Specific Terms:</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
                                <Link href="/legal/terms/customer" className="hover:text-white transition-colors py-1 px-1">Customer</Link>
                                <Link href="/legal/terms/tailor" className="hover:text-white transition-colors py-1 px-1">Tailor</Link>
                                <Link href="/legal/terms/shopkeeper" className="hover:text-white transition-colors py-1 px-1">Shop</Link>
                                <Link href="/legal/terms/delivery" className="hover:text-white transition-colors py-1 px-1">Delivery</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} Style Genie Inc. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0 items-center">
                        <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@stylegenie.com</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

