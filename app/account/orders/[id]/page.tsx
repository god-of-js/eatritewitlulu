import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { getOrder } from "@/lib/firebase/orders";
import { requireUser } from "@/lib/firebase/require-user";
import { formatPlanPrice } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export default async function AccountOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;
  const user = await requireUser("/account/orders");
  const order = await getOrder(user.token, id);
  if (!order || order.user_id !== user.id) notFound();

  return (
    <main>
      <Link href="/account/orders" className="text-sm underline">
        Back to orders
      </Link>
      <h1 className="mt-4 font-display text-3xl font-medium tracking-tight">
        Order details
      </h1>
      {placed ? (
        <p className="mt-4 rounded-2xl bg-sage/20 px-4 py-3 text-sm text-sage-deep">
          Payment confirmed. We’ll prepare your order and mark it fulfilled when it’s done.
        </p>
      ) : null}
      <p className="mt-4">
        <StatusBadge status={order.status} />
      </p>
      <dl className="mt-8 divide-y divide-ink/10 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white">
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
          <dt className="text-sm text-ink/55">Date</dt>
          <dd className="text-sm font-medium">{formatDate(order.created_at)}</dd>
        </div>
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
          <dt className="text-sm text-ink/55">Name</dt>
          <dd className="text-sm font-medium">{order.customer_name}</dd>
        </div>
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
          <dt className="text-sm text-ink/55">Phone</dt>
          <dd className="text-sm font-medium">{order.customer_phone || "—"}</dd>
        </div>
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
          <dt className="text-sm text-ink/55">Address</dt>
          <dd className="text-sm font-medium">{order.delivery_address}</dd>
        </div>
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
          <dt className="text-sm text-ink/55">Location</dt>
          <dd className="text-sm font-medium capitalize">{order.delivery_location || "—"}</dd>
        </div>
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
          <dt className="text-sm text-ink/55">Delivery fee</dt>
          <dd className="text-sm font-medium">{formatPlanPrice(order.delivery_fee)}</dd>
        </div>
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
          <dt className="text-sm text-ink/55">Payment</dt>
          <dd className="text-sm font-medium capitalize">{order.payment_status}</dd>
        </div>
        {order.paystack_reference ? (
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
            <dt className="text-sm text-ink/55">Paystack reference</dt>
            <dd className="text-sm font-medium break-all">{order.paystack_reference}</dd>
          </div>
        ) : null}
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
          <dt className="text-sm text-ink/55">Total</dt>
          <dd className="text-sm font-medium">{formatPlanPrice(order.total_amount)}</dd>
        </div>
        {order.fulfilled_at ? (
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
            <dt className="text-sm text-ink/55">Fulfilled</dt>
            <dd className="text-sm font-medium">{formatDate(order.fulfilled_at)}</dd>
          </div>
        ) : null}
      </dl>
      <ul className="mt-6 divide-y divide-ink/10 overflow-hidden rounded-[1.75rem] border border-ink/8 bg-white">
        {order.items.map((item) => (
          <li key={`${item.meal_id}-${item.name}`} className="flex justify-between gap-3 px-5 py-4 text-sm">
            <span>
              {item.quantity} × {item.name}
            </span>
            <span className="font-medium">{formatPlanPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
