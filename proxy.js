import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (pathname.startsWith("/auth") && token) {
    const role = token.role?.toLowerCase();
    if (role) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
  }

  if (pathname.startsWith("/shops")) {
    if (!token) {
      const loginUrl = new URL("/auth/user/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const pathParts = pathname.split("/");
      const intendedRole = pathParts[2];

      const loginUrl = new URL(`/auth/${intendedRole || "user"}/login`, req.url);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = token.role;
    const pathSegment = pathname.split("/")[2];
    const pathRole = pathSegment?.toUpperCase();

    const sharedRoutes = ["COMPLETE-PROFILE", "SETTINGS", "PROFILE"];

    if (pathRole && !sharedRoutes.includes(pathRole) && userRole !== "ADMIN" && userRole !== pathRole) {
      return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, req.url));
    }

    const isProfilePage = pathname.includes("/profile") || pathname.includes("/settings") || pathname.includes("/complete-profile");
    if (!isProfilePage && token.isProfileComplete === false) {
      const profileUrl = new URL("/dashboard/complete-profile?required=true", req.url);
      return NextResponse.redirect(profileUrl);
    }
  }

  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/shops/:path*"],
};
