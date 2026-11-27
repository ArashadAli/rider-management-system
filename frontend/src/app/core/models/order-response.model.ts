export interface OrderStatusHistoryItem {
  id?: number | null;
  order_id: string;
  from_status: string | null;
  to_status: string;
  changed_at: string | null;
  changed_by?: string | null;
  reason?: string | null;
}

export interface Order {
  order_id: string;
  order_item: string;
  customer_name: string;
  customer_mobile: string;
  pickup_address: string;
  delivery_address: string;
  amount: number;
  status: string;
  cancellation_reason?: string | null;
  next_statuses?: string[];
  history?: OrderStatusHistoryItem[];
  created_at: string | null;
  rider_id: string | null;
  rider_name: string | null;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    current_page: number;
    page_size: number;
    total_orders: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}


export interface AllOrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
}

export interface RiderResponse {
  success: boolean,
  message: string
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data?: {
    order_id: string;
    [key: string]: any;
  };
}

export interface SingleOrderResponse {
  success: boolean,
  message: string,
  data: Order
}