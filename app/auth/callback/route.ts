import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  if (mode === "resetPassword" && oobCode) {
    const next = new URL("/reset-password", origin);
    next.searchParams.set("oobCode", oobCode);
    return NextResponse.redirect(next);
  }

  return NextResponse.redirect(new URL("/login", origin));
}
