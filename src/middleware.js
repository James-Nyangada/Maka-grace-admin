import { NextResponse } from "next/server";

export function middleware(request) {
  // We use client-side AuthGuard with localStorage instead of cookies for auth.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/super-admin/:path*"],
};
