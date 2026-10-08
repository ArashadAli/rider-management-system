export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  order_overview: OrderOverview;
  rider_overview: RiderOverview;
  recent_orders: DashboardOrder[];
  recent_riders: DashboardRider[];
}

export interface DashboardMetrics {
  total_orders: number;
  active_riders: number;
  pending_orders: number;
  delivered_orders: number;
  total_order_value: number;
  success_rate: number;
}

export interface OrderOverview {
  pending: StatusOverview;
  delivered: StatusOverview;
  assigned: StatusOverview;
  cancelled: StatusOverview;
}

export interface StatusOverview {
  count: number;
  percentage: number;
}

export interface RiderOverview {
  total: number;
  active: number;
  inactive: number;
  available: number;
  unavailable: number;
}

export interface DashboardOrder {
  id: number;
  order_id: string;
  order_item: string;
  customer_name: string;
  customer_mobile: string;
  pickup_address: string;
  delivery_address: string;
  amount: number;
  status: string;
  rider_id: string | null;
  created_at: string;
}

export interface DashboardRider {
  id: string;
  name: string;
  email: string;
  mobile: string;
  vehicle_type: string | null;
  vehicle_number: string | null;
  profile_image_url: string | null;
  status: string;
  availability: string;
  created_at: string;
  updated_at: string;
}