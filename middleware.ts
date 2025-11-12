import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    pathname === "/" ||
    pathname === "/auth/signin" ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Protect API routes - redirect to signin if no session
  if ((pathname.startsWith("/api/generate") || pathname.startsWith("/api/expand")) && !session?.user) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/generate/:path*", "/api/expand/:path*", "/auth/signin"],
};
