export interface Order {
  order_id: number;
  order_number: string;
  order_date: string;
  created_at: string;
  closed_at: string;
  order_type: "dine_in" | "takeout" | "delivery";
  table_number: number | null;
  party_size: number;
  server_id: number;
  subtotal: number;
  discount_amount: number;
  discount_reason: string;
  gst: number;
  tip: number;
  total: number;
  payment_method: string;
  card_brand: string;
  card_last_four: string;
  delivery_platform: string;
  status: string;
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  menu_item_id: number;
  item_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  modifier: string;
  line_total: number;
}

export interface MenuItem {
  item_id: number;
  category: string;
  name: string;
  price: number;
  is_spicy: boolean;
}

export interface Staff {
  staff_id: number;
  first_name: string;
  last_name: string;
  role: string;
}

export interface TableInfo {
  table_number: number;
  seats: number;
  section: string;
}

export interface RecipeIngredient {
  menu_item_id: number;
  menu_item_name: string;
  ingredient: string;
  ingredient_category: string;
  quantity_per_item: number;
  unit: string;
  prep_group: string;
  shelf_life_days: number;
  complexity_weight: number;
}

export interface InventoryTarget {
  ingredient: string;
  par_level: number;
  unit: string;
  reorder_threshold: number;
  typical_lead_time_days: number;
}

export type Channel = "all" | "dine_in" | "takeout" | "delivery";
export type Metric = "revenue" | "quantity";
