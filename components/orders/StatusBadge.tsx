import { orderStatusLabel } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const fulfilled = status === "fulfilled";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        fulfilled ? "bg-sage/20 text-sage-deep" : "bg-ink/8 text-ink/70"
      }`}
    >
      {orderStatusLabel(status)}
    </span>
  );
}
