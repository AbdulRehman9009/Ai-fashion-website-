"use client";
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu, Bell, Search, ChevronDown, LogOut, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function DashboardLayoutContent({ children, session, profileData }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Get page title from pathname
    const getPageTitle = () => {
        const segments = pathname.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];
        if (segments.length <= 2) return "Overview"; // e.g. /dashboard/user
        return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950 font-sans">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <div className={`fixed md:sticky top-0 h-screen z-50 md:z-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
                <Sidebar
                    role={session.user.role}
                    isOpen={true} // Always open in this layout wrapper, controlled by CSS transform
                    onClose={() => setIsSidebarOpen(false)}
                />
            </div>

            <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-gray-200/50 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
                                {getPageTitle()}
                            </h1>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Search Bar (Desktop) */}
                        <div className="hidden md:flex relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 h-9 bg-gray-100/50 dark:bg-gray-800/50 border-transparent focus:bg-white dark:focus:bg-gray-900 transition-all font-normal"
                            />
                        </div>

                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
                        </button>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                                        <AvatarImage src={profileData?.logo} />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs">
                                            {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block text-left mr-2">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-none">
                                            {profileData?.name || session?.user?.name || "User"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                                            {session?.user?.role?.toLowerCase()}
                                        </p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" /> Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Bell className="mr-2 h-4 w-4" /> Notifications
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600" onClick={() => signOut()}>
                                    <LogOut className="mr-2 h-4 w-4" /> Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
