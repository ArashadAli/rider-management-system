export interface Order {
  order_id: string;
  order_item: string;
  customer_name: string;
  customer_mobile: string;
  pickup_address: string;
  delivery_address: string;
  amount: number;
  status: string;
  created_at: string | null;
  rider_id: number | null;
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