import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Shop from "@/models/Shop";
import User from "@/models/User";
import DashboardLayoutContent from "@/components/dashboard/DashboardLayoutContent";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/user/login");
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
    <DashboardLayoutContent session={session} profileData={profileData}>
      {children}
    </DashboardLayoutContent>
  );
}
