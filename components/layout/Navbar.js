"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import CartSidebar from "@/components/cart/CartSidebar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
    Menu, X, Scissors, User, Store, Truck, LogOut,
    ShoppingCart, Heart, LayoutDashboard, Settings,
    Package, ChevronDown, BarChart3, CreditCard
} from "lucide-react";
import Image from "next/image";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const { data: session } = useSession();
    const { cartCount } = useCart();
    const pathname = usePathname();

    const isDashboard = pathname?.startsWith("/dashboard");
    const isAuth = pathname?.startsWith("/auth");
    if (isDashboard || isAuth) return null;
    const currentRole = useMemo(() => {
        if (!pathname) return null;
        if (pathname.startsWith("/tailor") || pathname.startsWith("/auth/tailor") || pathname.startsWith("/dashboard/tailor")) return "tailor";
        if (pathname.startsWith("/shopkeeper") || pathname.startsWith("/auth/shopkeeper") || pathname.startsWith("/dashboard/shopkeeper")) return "shopkeeper";
        if (pathname.startsWith("/delivery") || pathname.startsWith("/auth/delivery") || pathname.startsWith("/dashboard/delivery")) return "delivery";
        if (pathname.startsWith("/customer") || pathname.startsWith("/auth/user") || pathname.startsWith("/dashboard/user")) return "user";
        return null;
    }, [pathname]);

    const roleLinks = [
        { href: "/customer", label: "Customer", icon: User, role: "user" },
        { href: "/tailor", label: "Tailor", icon: Scissors, role: "tailor" },
        { href: "/shopkeeper", label: "Shop Owner", icon: Store, role: "shopkeeper" },
        { href: "/delivery", label: "Delivery", icon: Truck, role: "delivery" },
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

    // Role-specific navigation items for logged-in users
    const getRoleNavItems = () => {
        if (!session) return [];
        const role = session.user.role;

        switch (role) {
            case "USER":
                return [
                    { href: "/dashboard/user/products", label: "Shop" },
                    { href: "/dashboard/user/orders", label: "My Orders" },
                ];
            case "TAILOR":
                return [
                    { href: "/dashboard/tailor", label: "Orders" },
                    { href: "/dashboard/tailor/earnings", label: "Earnings" },
                ];
            case "SHOPKEEPER":
                return [
                    { href: "/dashboard/shopkeeper/products", label: "Products" },
                    { href: "/dashboard/shopkeeper", label: "Orders" },
                ];
            case "DELIVERY":
                return [
                    { href: "/dashboard/delivery", label: "Deliveries" },
                    { href: "/dashboard/delivery/earnings", label: "Earnings" },
                ];
            case "ADMIN":
                return [
                    { href: "/dashboard/admin/users", label: "Users" },
                    { href: "/dashboard/admin/shops", label: "Shops" },
                ];
            default:
                return [];
        }
    };

    const sessionNavItems = getRoleNavItems();

    // Default public links
    const publicLinks = [
        { href: "/", label: "Home" },
        { href: "/features", label: "Features" },
        { href: "/about", label: "About" },
    ];

    const navLinks = session ? sessionNavItems : publicLinks;
    const authLinks = getAuthLinks();

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href={session ? getDashboardLink() : "/"} className="flex items-center space-x-2 transition-opacity hover:opacity-80">
                            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white">
                                <span className="text-xl font-bold font-serif">S</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                StyleGenie
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors ${pathname === link.href ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Role Selector for Public Visitors */}
                            {!session && (
                                <div className="relative group">
                                    <button className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                                        Partner with us
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <div className="absolute top-full right-0 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-1 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10">
                                            {roleLinks.slice(1).map((link) => { // Skip Customer
                                                const Icon = link.icon;
                                                return (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-md"
                                                    >
                                                        <Icon className="h-4 w-4 text-slate-500 dark:text-gray-400" />
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
                        <div className="hidden md:flex md:items-center md:space-x-4">
                            {/* Theme Toggle */}
                            <ThemeToggle />
                            {session ? (
                                <>
                                    {/* Role Badge */}
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-700 capitalize">
                                        {session.user.role.toLowerCase()}
                                    </span>

                                    {/* Cart Icon (Only for Users) */}
                                    {session.user.role === 'USER' && (
                                        <>
                                            <Link href={getDashboardLink() + "?tab=wishlist"} className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white p-2">
                                                <Heart className="h-5 w-5" />
                                            </Link>
                                            <button
                                                onClick={() => setCartOpen(true)}
                                                className="relative p-2 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                            >
                                                <ShoppingCart className="h-5 w-5" />
                                                {cartCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-slate-900 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                                                        {cartCount > 9 ? '9+' : cartCount}
                                                    </span>
                                                )}
                                            </button>
                                        </>
                                    )}

                                    {/* User Menu */}
                                    <div className="relative ml-2">
                                        <button
                                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                                            className="flex items-center gap-2 transition-opacity hover:opacity-80"
                                        >
                                            {session.user?.image ? (
                                                <Image src={session.user.image} alt="User" width={32} height={32} className="rounded-full border border-slate-200" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-600 dark:text-gray-300 font-medium text-sm border border-slate-200 dark:border-gray-700">
                                                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            )}
                                        </button>

                                        {/* User Dropdown */}
                                        {userMenuOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-30"
                                                    onClick={() => setUserMenuOpen(false)}
                                                />
                                                <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 border dark:border-gray-700 ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 z-40 py-1">
                                                    <div className="px-4 py-3 border-b dark:border-gray-700 bg-slate-50 dark:bg-gray-700/50">
                                                        <p className="font-semibold text-sm text-slate-900 dark:text-gray-100 truncate">{session.user?.name}</p>
                                                        <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                                                    </div>

                                                    <div className="p-1">
                                                        <Link href={getDashboardLink()} onClick={() => setUserMenuOpen(false)}>
                                                            <button className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-md">
                                                                <LayoutDashboard className="h-4 w-4 text-slate-500 dark:text-gray-400" />
                                                                Dashboard
                                                            </button>
                                                        </Link>

                                                        <Link href={session.user.role === 'SHOPKEEPER' ? '/dashboard/shopkeeper/settings' : `/dashboard/${session.user.role.toLowerCase()}/settings`} onClick={() => setUserMenuOpen(false)}>
                                                            <button className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-md">
                                                                <Settings className="h-4 w-4 text-slate-500 dark:text-gray-400" />
                                                                Settings
                                                            </button>
                                                        </Link>
                                                    </div>

                                                    <div className="border-t mt-1 p-1">
                                                        <button
                                                            onClick={() => {
                                                                setUserMenuOpen(false);
                                                                signOut({ callbackUrl: "/" });
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                                                        >
                                                            <LogOut className="h-4 w-4" />
                                                            Logout
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link href={authLinks.loginPath}>
                                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                                            Log in
                                        </Button>
                                    </Link>
                                    <Link href={authLinks.registerPath}>
                                        <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm">
                                            Get Started
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button & Cart */}
                        <div className="flex items-center gap-2 md:hidden">
                            {session?.user?.role === 'USER' && (
                                <button
                                    onClick={() => setCartOpen(true)}
                                    className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-md"
                                >
                                    <ShoppingCart className="h-6 w-6" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {cartCount > 9 ? '9+' : cartCount}
                                        </span>
                                    )}
                                </button>
                            )}
                            <button
                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-md"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t bg-white dark:bg-gray-900 dark:border-gray-800">
                        <div className="container mx-auto px-4 py-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === link.href ? "bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-gray-100" : "text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-gray-100"
                                        }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {!session && (
                                <div className="pt-4 border-t mt-4">
                                    <p className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">Partner with us</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {roleLinks.map((link) => {
                                            const Icon = link.icon;
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-gray-100 rounded-md border border-transparent hover:border-slate-200 dark:hover:border-gray-700"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {link.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t mt-4 flex flex-col gap-2">
                                {session ? (
                                    <>
                                        <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full justify-start gap-2">
                                                <LayoutDashboard className="h-4 w-4" />
                                                Dashboard
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => {
                                                setMobileMenuOpen(false);
                                                signOut({ callbackUrl: "/" });
                                            }}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link href={authLinks.loginPath} onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full border-slate-200 text-slate-700">Log in</Button>
                                        </Link>
                                        <Link href={authLinks.registerPath} onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full bg-slate-900 text-white">Get Started</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Cart Sidebar */}
            <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
}

