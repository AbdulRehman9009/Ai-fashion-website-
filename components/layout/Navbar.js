"use client";
import { useState } from "react";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import CartSidebar from "@/components/cart/CartSidebar";
import {
    Menu, X, Scissors, User, Store, Truck, LogOut,
    ShoppingCart, Heart, LayoutDashboard, Settings,
    Package, ChevronDown
} from "lucide-react";
import Image from "next/image";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const { data: session } = useSession();
    const { cartCount } = useCart();
    const pathname = usePathname();

    // Determine current role context from URL
    const currentRole = React.useMemo(() => {
        if (!pathname) return null;
        if (pathname.startsWith("/tailor") || pathname.startsWith("/auth/tailor") || pathname.startsWith("/dashboard/tailor")) return "tailor";
        if (pathname.startsWith("/shopkeeper") || pathname.startsWith("/auth/shopkeeper") || pathname.startsWith("/dashboard/shopkeeper")) return "shopkeeper";
        if (pathname.startsWith("/delivery") || pathname.startsWith("/auth/delivery") || pathname.startsWith("/dashboard/delivery")) return "delivery";
        if (pathname.startsWith("/customer") || pathname.startsWith("/auth/user") || pathname.startsWith("/dashboard/user")) return "user";
        return null;
    }, [pathname]);

    const roleLinks = [
        { href: "/customer", label: "For Customers", icon: User, role: "user" },
        { href: "/tailor", label: "For Tailors", icon: Scissors, role: "tailor" },
        { href: "/shopkeeper", label: "For Shops", icon: Store, role: "shopkeeper" },
        { href: "/delivery", label: "For Delivery", icon: Truck, role: "delivery" },
    ];

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

    // Dynamic home link - redirects to dashboard if logged in
    const getHomeLink = () => session ? getDashboardLink() : "/";

    const navLinks = [
        { href: getHomeLink(), label: "Home", isDynamic: true },
        { href: "/features", label: "Features" },
        { href: "/about", label: "About" },
    ];

    const authLinks = getAuthLinks();

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
        <>
            <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-backdrop-filter:bg-white/80 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-pink-500 text-white shadow-lg flex items-center justify-center">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <path d="M6 8c1.5-2 4-3 7-3 3 0 5 1.5 5 4 0 2.5-2.5 4-5 5-2.5 1-4 2.5-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent lowercase">
                                StyleGenie
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-medium transition-all hover:text-indigo-600 relative group ${pathname === link.href ? "text-indigo-600" : "text-gray-700"}`}
                                >
                                    {link.label}
                                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-indigo-600 transition-all ${pathname === link.href ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                                </Link>
                            ))}

                            {/* Role Dropdown */}
                            {!session && (
                                <div className="relative group">
                                    <button className="text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600 flex items-center gap-1">
                                        Get Started
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <div className="absolute left-0 mt-2 w-56 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <div className="py-2">
                                            {roleLinks.map((link) => {
                                                const Icon = link.icon;
                                                const isActive = currentRole === link.role;
                                                return (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 ${isActive ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700"}`}
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                        {link.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Section */}
                        <div className="hidden md:flex md:items-center md:space-x-3">
                            {session ? (
                                <>
                                    {/* Wishlist Icon */}
                                    <Link href={getDashboardLink() + "?tab=wishlist"}>
                                        <button className="relative p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                            <Heart className="h-5 w-5" />
                                        </button>
                                    </Link>

                                    {/* Cart Icon with Badge */}
                                    <button
                                        onClick={() => setCartOpen(true)}
                                        className="relative p-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                                                {cartCount > 9 ? '9+' : cartCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* User Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all group"
                                        >
                                            <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md overflow-hidden">
                                                {session.user?.image ? (
                                                    <Image src={session.user.image} alt={session.user.name || "User"} fill className="object-cover" />
                                                ) : (
                                                    <span className="text-sm uppercase">{session.user?.name?.[0] || 'U'}</span>
                                                )}
                                            </div>
                                            <div className="text-left hidden lg:block">
                                                <p className="text-sm font-semibold text-gray-800">{session.user?.name?.split(' ')[0] || 'User'}</p>
                                                <p className="text-xs text-gray-500 capitalize">{session.user?.role?.toLowerCase()}</p>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* User Dropdown */}
                                        {userMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                                                    <p className="font-semibold">{session.user?.name}</p>
                                                    <p className="text-sm opacity-90">{session.user?.email}</p>
                                                </div>
                                                <div className="py-2">
                                                    <Link href={getDashboardLink()} onClick={() => setUserMenuOpen(false)}>
                                                        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm text-gray-700 hover:bg-indigo-50 transition-colors">
                                                            <LayoutDashboard className="h-4 w-4" />
                                                            Dashboard
                                                        </button>
                                                    </Link>
                                                    <Link href={getDashboardLink() + "?tab=orders"} onClick={() => setUserMenuOpen(false)}>
                                                        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm text-gray-700 hover:bg-indigo-50 transition-colors">
                                                            <Package className="h-4 w-4" />
                                                            Orders
                                                        </button>
                                                    </Link>
                                                    <Link href={session.user.role === 'SHOPKEEPER' ? '/dashboard/shopkeeper/settings' : `/dashboard/${session.user.role.toLowerCase()}/settings`} onClick={() => setUserMenuOpen(false)}>
                                                        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm text-gray-700 hover:bg-indigo-50 transition-colors">
                                                            <Settings className="h-4 w-4" />
                                                            Settings
                                                        </button>
                                                    </Link>
                                                    <div className="border-t my-2"></div>
                                                    <button
                                                        onClick={() => {
                                                            setUserMenuOpen(false);
                                                            signOut({ callbackUrl: "/" });
                                                        }}
                                                        className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        Logout
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link href={authLinks.loginPath}>
                                        <Button variant="ghost" size="sm" className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href={authLinks.registerPath}>
                                        <Button size="sm" className={`${roleColor.bg} ${roleColor.hover} text-white shadow-md hover:shadow-lg transition-all`}>
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
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                                    className={`block py-2 text-base font-medium hover:text-indigo-600 ${pathname === link.href ? "text-indigo-600" : "text-gray-700"}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {!session && (
                                <div className="pt-2 border-t">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Get Started As</p>
                                    {roleLinks.map((link) => {
                                        const Icon = link.icon;
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className="flex items-center gap-2 py-2 text-base font-medium text-gray-700 hover:text-indigo-600"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}

                            {session ? (
                                <div className="pt-2 border-t space-y-2">
                                    <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full justify-start gap-2">
                                            <LayoutDashboard className="h-4 w-4" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <div
                                        onClick={() => { setMobileMenuOpen(false); setCartOpen(true); }}
                                        className="w-full cursor-pointer"
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && (setMobileMenuOpen(false), setCartOpen(true))}
                                    >
                                        <Button variant="outline" className="w-full justify-start gap-2" asChild>
                                            <span>
                                                <ShoppingCart className="h-4 w-4" />
                                                Cart {cartCount > 0 && `(${cartCount})`}
                                            </span>
                                        </Button>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 text-red-600 hover:bg-red-50"
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            signOut({ callbackUrl: "/" });
                                        }}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <div className="pt-2 border-t space-y-2">
                                    <Link href={authLinks.loginPath} onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full">Sign In</Button>
                                    </Link>
                                    <Link href={authLinks.registerPath} onClick={() => setMobileMenuOpen(false)}>
                                        <Button className={`w-full ${roleColor.bg} ${roleColor.hover} text-white`}>Get Started</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Cart Sidebar */}
            <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
}
