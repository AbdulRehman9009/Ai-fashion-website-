import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { connectDB } from "@/lib/db";
import Shop from "@/models/Shop";
import User from "@/models/User";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  // Fetch role-specific profile/logo
  let profileData = null;
  await connectDB();

  if (session.user.role === "SHOPKEEPER") {
    const shop = await Shop.findOne({ owner: session.user.id }).lean();
    profileData = { logo: shop?.logo, name: shop?.name };
  } else if (session.user.role === "USER") {
    const user = await User.findById(session.user.id).select('image name').lean();
    profileData = { logo: user?.image, name: user?.name };
  } else if (session.user.role === "TAILOR") {
    const user = await User.findById(session.user.id).select('image name').lean();
    profileData = { logo: user?.image, name: user?.name };
  } else if (session.user.role === "DELIVERY") {
    const user = await User.findById(session.user.id).select('image name').lean();
    profileData = { logo: user?.image, name: user?.name };
  } else if (session.user.role === "ADMIN") {
    const user = await User.findById(session.user.id).select('image name').lean();
    profileData = { logo: user?.image, name: user?.name };
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar role={session.user.role} />
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur-sm px-8 shadow-sm transition-all duration-300">
          <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            {profileData?.logo && (
              <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm transition-transform hover:scale-110 duration-200">
                <img src={profileData.logo} alt="Profile" className="h-full w-full object-cover" />
              </div>
            )}
            {!profileData?.logo && (
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-sm font-bold text-white shadow-md transition-transform hover:scale-110 duration-200">
                {session.user.email[0].toUpperCase()}
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-900">{profileData?.name || session.user.email}</span>
              <p className="text-xs text-gray-500">{session.user.role}</p>
            </div>
          </div>
        </header>
        <div className="p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
