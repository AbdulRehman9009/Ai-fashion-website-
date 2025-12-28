import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 1. Auth Pages Protection (Redirect to dashboard if already logged in)
  if (pathname.startsWith("/auth") && token) {
    const role = token.role?.toLowerCase();
    if (role) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
  }

  // 2. Dashboard Protection
  if (pathname.startsWith("/dashboard")) {
    // If not logged in, redirect to the specific role's login page
    if (!token) {
      // Extract role from path if possible, e.g., /dashboard/tailor -> tailor
      const pathParts = pathname.split("/");
      const intendedRole = pathParts[2]; // /dashboard/[role]

      const loginUrl = new URL(`/auth/${intendedRole || "user"}/login`, req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Role Enforcement
    const userRole = token.role;
    const pathRole = pathname.split("/")[2]?.toUpperCase(); // USER, TAILOR, etc.

    // Allow Admin to access everything (optional, but let's be strict for now: Admin only admin)
    // Actually, stick to strict separation as requested.
    if (pathRole && userRole !== "ADMIN" && userRole !== pathRole) {
      // Wrong role. Redirect to their own dashboard.
      return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, req.url));
    }

    // 3. Profile Completion Check (Skip for profile and settings pages)
    const isProfilePage = pathname.includes("/profile") || pathname.includes("/settings");
    if (!isProfilePage) {
      // Check if profile is complete (using value cached in token)
      if (token.isProfileComplete === false) {
        const profileUrl = new URL(`/dashboard/${userRole.toLowerCase()}/profile?required=true`, req.url);
        return NextResponse.redirect(profileUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};

