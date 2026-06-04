import { NextResponse, type NextRequest } from "next/server";

const ADMIN_GATE_COOKIE = "darion_admin_gate";

export function middleware(request: NextRequest) {
  const adminAccessKey = process.env.ADMIN_ACCESS_KEY;

  if (!adminAccessKey) {
    return NextResponse.next();
  }

  const url = request.nextUrl;
  const providedKey = url.searchParams.get("access_key");
  const existingGate = request.cookies.get(ADMIN_GATE_COOKIE)?.value;

  if (existingGate === adminAccessKey) {
    return NextResponse.next();
  }

  if (providedKey === adminAccessKey) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("access_key");

    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(ADMIN_GATE_COOKIE, adminAccessKey, {
      httpOnly: true,
      maxAge: 60 * 60 * 8,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });
    return response;
  }

  return new NextResponse("Not Found", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-robots-tag": "noindex, nofollow"
    }
  });
}

export const config = {
  matcher: ["/admin/:path*"]
};
