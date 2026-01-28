"use client";
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu, Bell } from "lucide-react";
import { usePathname } from "next/navigation";

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
        <div className="flex bg-gray-50 overflow-hidden h-screen w-full font-sans">
            <Sidebar
                role={session.user.role}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex flex-col flex-1 h-full overflow-hidden w-full relative">
                {/* Clean white header */}
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8 w-full shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800 tracking-tight">{getPageTitle()}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-8 w-px bg-gray-200 mx-1"></div>

                        <div className="flex items-center gap-3 pl-1">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900 leading-none">{profileData?.name || session?.user?.email}</p>
                                <p className="text-xs text-gray-500 mt-1">{session?.user?.role}</p>
                            </div>

                            {profileData?.logo ? (
                                <div className="h-9 w-9 rounded-full overflow-hidden border border-gray-200 ring-2 ring-gray-100">
                                    <img src={profileData.logo} alt="Profile" className="h-full w-full object-cover" />
                                </div>
                            ) : (
                                <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-gray-100">
                                    {session?.user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 w-full relative">
                    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

