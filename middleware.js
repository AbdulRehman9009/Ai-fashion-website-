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

  // 2. Shops Route Protection (Require authentication)
  if (pathname.startsWith("/shops")) {
    if (!token) {
      const loginUrl = new URL("/auth/user/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Dashboard Protection
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
    // Extract the segment after /dashboard/
    const pathSegment = pathname.split("/")[2];
    const pathRole = pathSegment?.toUpperCase();

    // List of shared dashboard routes that shouldn't trigger role enforcement
    // These pages are accessible by any authenticated user regardless of role
    const sharedRoutes = ["COMPLETE-PROFILE", "SETTINGS", "PROFILE"];

    // Only enforce role mismatch if it's NOT a shared route
    if (pathRole && !sharedRoutes.includes(pathRole) && userRole !== "ADMIN" && userRole !== pathRole) {
      // Wrong role. Redirect to their own dashboard.
      return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, req.url));
    }

    // 3. Profile Completion Check (Skip for profile, settings and complete-profile pages)
    const isProfilePage = pathname.includes("/profile") || pathname.includes("/settings") || pathname.includes("/complete-profile");
    if (!isProfilePage) {
      // Check if profile is complete (using value cached in token)
      if (token.isProfileComplete === false) {
        // Redirect to the central complete-profile flow which exists at /dashboard/complete-profile
        const profileUrl = new URL(`/dashboard/complete-profile?required=true`, req.url);
        return NextResponse.redirect(profileUrl);
      }
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/shops/:path*"],
};

