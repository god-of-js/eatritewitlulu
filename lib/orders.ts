import type { OrderStatus } from "@/lib/types";

export function isOrderStatus(value: string): value is OrderStatus {
  return value === "pending" || value === "fulfilled";
}

export function orderStatusLabel(status: OrderStatus) {
  return status === "fulfilled" ? "Fulfilled" : "Pending";
}
