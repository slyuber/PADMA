import Papa from "papaparse";
import type {
  Order, OrderItem, MenuItem, Staff, TableInfo,
  RecipeIngredient, InventoryTarget,
} from "./types";

import ordersRaw from "../../data/orders.csv?raw";
import orderItemsRaw from "../../data/order_items.csv?raw";
import menuItemsRaw from "../../data/menu_items.csv?raw";
import staffRaw from "../../data/staff.csv?raw";
import tablesRaw from "../../data/restaurant_tables.csv?raw";
import recipesRaw from "../../data/recipe_ingredients.csv?raw";
import inventoryRaw from "../../data/ingredient_inventory_targets.csv?raw";

function parse<T>(raw: string, numerics: string[] = []): T[] {
  const { data } = Papa.parse(raw.trim(), { header: true, skipEmptyLines: true });
  return (data as Record<string, string>[]).map((row) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      if (numerics.includes(k)) out[k] = v === "" ? 0 : Number(v);
      else if (k === "is_spicy") out[k] = v === "True";
      else if (k === "table_number") out[k] = v === "" ? null : Number(v);
      else out[k] = v;
    }
    return out as T;
  });
}

export const menuItems: MenuItem[] = parse<MenuItem>(menuItemsRaw, ["item_id", "price"]);
export const allOrders: Order[] = parse<Order>(ordersRaw, [
  "order_id", "party_size", "server_id", "subtotal",
  "discount_amount", "gst", "tip", "total",
]);
export const allOrderItems: OrderItem[] = parse<OrderItem>(orderItemsRaw, [
  "order_item_id", "order_id", "menu_item_id", "quantity", "unit_price", "line_total",
]);
export const staff: Staff[] = parse<Staff>(staffRaw, ["staff_id"]);
export const tables: TableInfo[] = parse<TableInfo>(tablesRaw, ["table_number", "seats"]);
export const recipes: RecipeIngredient[] = parse<RecipeIngredient>(recipesRaw, [
  "menu_item_id", "quantity_per_item", "shelf_life_days", "complexity_weight",
]);
export const inventoryTargets: InventoryTarget[] = parse<InventoryTarget>(inventoryRaw, [
  "par_level", "reorder_threshold", "typical_lead_time_days",
]);

export const completedOrders = allOrders.filter((o) => o.status === "completed");
export const menuMap = new Map(menuItems.map((m) => [m.item_id, m]));
export const staffMap = new Map(staff.map((s) => [s.staff_id, s]));

export function filterByChannel(orders: Order[], channel: string): Order[] {
  if (channel === "all") return orders;
  return orders.filter((o) => o.order_type === channel);
}

export function filterByDate(orders: Order[], date: string | null): Order[] {
  if (!date) return orders;
  return orders.filter((o) => o.order_date === date);
}

export function getOrderItems(orders: Order[]): OrderItem[] {
  const ids = new Set(orders.map((o) => o.order_id));
  return allOrderItems.filter((i) => ids.has(i.order_id));
}

export function getHour(o: Order): number {
  return new Date(o.created_at).getHours();
}

export const CHANNELS = [
  { value: "all", label: "All Channels" },
  { value: "dine_in", label: "Dine-In" },
  { value: "takeout", label: "Takeout" },
  { value: "delivery", label: "Delivery" },
] as const;

export const CATEGORIES = [...new Set(menuItems.map((m) => m.category))];

export const ALBERTA_GST_RATE = 0.05;

export const CALGARY_HOLIDAYS_MAY_2026: Record<string, string> = {
  "2026-05-18": "Victoria Day",
};
