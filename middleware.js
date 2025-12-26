import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { canAccessPath } from "@/lib/rbac";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/dashboard")) return NextResponse.next();
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const url = new URL("/signin", req.url);
    return NextResponse.redirect(url);
  }
  const role = token.role;
  const ok = canAccessPath(role, pathname);
  if (!ok) {
    const url = new URL("/signin", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

