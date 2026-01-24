"use client";
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayoutContent({ children, session, profileData }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-gray-50 overflow-hidden h-screen w-full">
            <Sidebar
                role={session.user.role}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex flex-col flex-1 h-full overflow-hidden w-full relative">
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur-sm px-4 md:px-8 shadow-sm transition-all duration-300 w-full shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {profileData?.logo && (
                            <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm transition-transform hover:scale-110 duration-200">
                                <img src={profileData.logo} alt="Profile" className="h-full w-full object-cover" />
                            </div>
                        )}
                        {!profileData?.logo && (
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-sm font-bold text-white shadow-md transition-transform hover:scale-110 duration-200">
                                {session?.user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <div className="hidden sm:block">
                            <span className="text-sm font-medium text-gray-900 block leading-tight">{profileData?.name || session?.user?.email}</span>
                            <p className="text-xs text-gray-500">{session?.user?.role}</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth w-full relative">
                    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
