import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/session";

function redirectToLogin(req: NextRequest, path: string) {
  const url = new URL("/ingresar", req.url);
  url.searchParams.set("redirect", path);
  return NextResponse.redirect(url);
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifySession(token) : null;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!user) return redirectToLogin(req, pathname);
    if (user.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/cuenta")) {
    if (!user) return redirectToLogin(req, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*"],
};
