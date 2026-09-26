import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { userIsAdmin } from "@/lib/firebase/admin-access";
import { getOrder, updateOrderStatus } from "@/lib/firebase/orders";
import { ADMIN_FLAG_COOKIE, getSessionUser } from "@/lib/firebase/session";
import { isOrderStatus } from "@/lib/orders";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  const granted = (await cookies()).get(ADMIN_FLAG_COOKIE)?.value ?? null;
  if (!user || !(await userIsAdmin(user, granted))) {
    return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { status?: string };
  if (!isOrderStatus(body.status ?? "")) {
    return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  }

  const existing = await getOrder(user.token, id);
  if (!existing) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const order = await updateOrderStatus(user.token, id, body.status as "pending" | "fulfilled");
  return NextResponse.json({ order });
}
