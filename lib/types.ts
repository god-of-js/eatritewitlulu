export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  deleted_at: string | null;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  plan_type: string;
  plan_price: number;
  billing_period?: "week" | "month";
  calories: number | null;
  delivery_frequency: "daily" | "3x-week" | "1x-week";
  delivery_count: number;
  delivery_location: "island" | "mainland";
  delivery_address: string;
  delivery_fee: number;
  total_amount: number;
  status: "active" | "completed" | "cancelled";
  payment_status: "pending" | "success" | "failed";
  start_date: string;
  end_date: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  payment_status: "pending" | "success" | "failed";
  paystack_reference: string | null;
  paystack_status: string | null;
  plan_name: string | null;
  paid_at: string | null;
  created_at: string;
};
