"use client";
import { useState } from "react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, X, Scissors, User, Store, Truck, LogOut, Home } from "lucide-react";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { data: session } = useSession();
    const pathname = usePathname();

    // Determine current role context from URL (memoized to avoid recalculation on every render)
    const currentRole = React.useMemo(() => {
        if (!pathname) return null;
        if (pathname.startsWith("/tailor") || pathname.startsWith("/auth/tailor") || pathname.startsWith("/dashboard/tailor")) return "tailor";
        if (pathname.startsWith("/shopkeeper") || pathname.startsWith("/auth/shopkeeper") || pathname.startsWith("/dashboard/shopkeeper")) return "shopkeeper";
        if (pathname.startsWith("/delivery") || pathname.startsWith("/auth/delivery") || pathname.startsWith("/dashboard/delivery")) return "delivery";
        if (pathname.startsWith("/customer") || pathname.startsWith("/auth/user") || pathname.startsWith("/dashboard/user")) return "user";
        return null;
    }, [pathname]);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/features", label: "Features" },
        { href: "/about", label: "About" },
    ];

    const roleLinks = [
        { href: "/customer", label: "For Customers", icon: User, role: "user" },
        { href: "/tailor", label: "For Tailors", icon: Scissors, role: "tailor" },
        { href: "/shopkeeper", label: "For Shops", icon: Store, role: "shopkeeper" },
        { href: "/delivery", label: "For Delivery", icon: Truck, role: "delivery" },
    ];

    // Get auth links based on current role context
    const getAuthLinks = () => {
        const role = currentRole || "user";
        const roleMap = {
            user: { loginPath: "/auth/user/login", registerPath: "/auth/user/register", label: "Customer" },
            tailor: { loginPath: "/auth/tailor/login", registerPath: "/auth/tailor/register", label: "Tailor" },
            shopkeeper: { loginPath: "/auth/shopkeeper/login", registerPath: "/auth/shopkeeper/register", label: "Shopkeeper" },
            delivery: { loginPath: "/auth/delivery/login", registerPath: "/auth/delivery/register", label: "Delivery Partner" }
        };
        return roleMap[role];
    };

    const getDashboardLink = () => {
        if (!session) return null;
        const role = session.user.role.toLowerCase();
        return `/dashboard/${role === "user" ? "user" : role}`;
    };

    const authLinks = getAuthLinks();

    // Get role-specific colors
    const getRoleColor = () => {
        switch (currentRole) {
            case "tailor": return { bg: "bg-purple-600", hover: "hover:bg-purple-700", text: "text-purple-600" };
            case "shopkeeper": return { bg: "bg-orange-600", hover: "hover:bg-orange-700", text: "text-orange-600" };
            case "delivery": return { bg: "bg-green-600", hover: "hover:bg-green-700", text: "text-green-600" };
            default: return { bg: "bg-blue-600", hover: "hover:bg-blue-700", text: "text-blue-600" };
        }
    };

    const roleColor = getRoleColor();

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-linear-to-br from-indigo-600 to-pink-500 text-white shadow-md flex items-center justify-center">
                            {/* Simple inline SVG mark for the brand */}
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <defs>
                                    <linearGradient id="g1" x1="0" x2="1">
                                        <stop offset="0" stopColor="#5b21b6" />
                                        <stop offset="1" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                                <path d="M6 8c1.5-2 4-3 7-3 3 0 5 1.5 5 4 0 2.5-2.5 4-5 5-2.5 1-4 2.5-4 4" stroke="url(#g1)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent lowercase">
                            stylegenie
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname === link.href ? "text-blue-600" : "text-gray-700"}`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Role Dropdown */}
                        <div className="relative group">
                            <button className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 flex items-center gap-1">
                                Get Started
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="py-1">
                                    {roleLinks.map((link) => {
                                        const Icon = link.icon;
                                        const isActive = currentRole === link.role;
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 ${isActive ? "bg-gray-50 text-blue-600 font-medium" : "text-gray-700"}`}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Auth Buttons - Desktop */}
                    <div className="hidden md:flex md:items-center md:space-x-3">
                        {session ? (
                            <>
                                <Link href={getDashboardLink()}>
                                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Link href={session.user ? (session.user.role === 'SHOPKEEPER' ? '/dashboard/shopkeeper/settings' : `/dashboard/${session.user.role.toLowerCase()}/profile`) : '/dashboard'}>
                                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                                        {session.user?.name ? session.user.name.split(' ')[0] : 'Profile'}
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href={authLinks.loginPath}>
                                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href={authLinks.registerPath}>
                                    <Button size="sm" className={`${roleColor.bg} ${roleColor.hover} text-white`}>
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t bg-white">
                    <div className="container mx-auto px-4 py-4 space-y-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`block py-2 text-base font-medium hover:text-blue-600 ${pathname === link.href ? "text-blue-600" : "text-gray-700"}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}

                        <div className="pt-2 border-t">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Get Started As</p>
                            {roleLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = currentRole === link.role;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-2 py-2 text-base font-medium hover:text-blue-600 ${isActive ? "text-blue-600" : "text-gray-700"}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {session ? (
                            <div className="pt-2 border-t space-y-2">
                                <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full border-gray-300 text-gray-700">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    className="w-full text-gray-700 hover:bg-gray-100"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        signOut({ callbackUrl: "/" });
                                    }}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <div className="pt-2 border-t space-y-2">
                                <Link href={authLinks.loginPath} onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full border-gray-300 text-gray-700">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href={authLinks.registerPath} onClick={() => setMobileMenuOpen(false)}>
                                    <Button className={`w-full ${roleColor.bg} ${roleColor.hover} text-white`}>
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
