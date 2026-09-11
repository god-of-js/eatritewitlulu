import { NextResponse, type NextRequest } from "next/server";
import { userIsAdmin } from "@/lib/firebase/admin-access";
import { ADMIN_FLAG_COOKIE, peekSessionFromRequest } from "@/lib/firebase/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = peekSessionFromRequest(request);
  const granted = request.cookies.get(ADMIN_FLAG_COOKIE)?.value ?? null;

  const isAccount = pathname.startsWith("/account");
  const isAdminLogin = pathname === "/admin/login";
  const isAdmin = pathname.startsWith("/admin");
  const isSubscribe = pathname.startsWith("/subscribe");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isAdminLogin) {
    if (user && (await userIsAdmin(user, granted))) {
      const next = request.nextUrl.searchParams.get("next") || "/admin";
      const dest = next.startsWith("/admin") ? next : "/admin";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next({ request });
  }

  if (isAdmin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

    if (!user || !(await userIsAdmin(user, granted))) {
      return NextResponse.redirect(loginUrl);
    }
  }

  if ((isAccount || isSubscribe) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && user && pathname !== "/reset-password") {
    const next = request.nextUrl.searchParams.get("next") || "/account";
    return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
