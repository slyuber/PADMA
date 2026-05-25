import { useMemo } from "react";
import { completedOrders, allOrderItems, recipes, getHour } from "@/lib/data";
import { fmtDollars, fmt } from "@/lib/utils";
import { SectionHeader } from "../SectionHeader";
import {
  ChefHat, ShoppingCart, TrendingUp, Clock, Megaphone, AlertCircle,
} from "lucide-react";

interface ActionItem {
  icon: React.ReactNode;
  title: string;
  body: string;
  color: string;
}

export function OwnerActionPlan() {
  const actions = useMemo(() => {
    const orders = completedOrders;
    const items = allOrderItems.filter((i) => {
      const oid = orders.find((o) => o.order_id === i.order_id);
      return !!oid;
    });

    // Top-selling items
    const itemQty: Record<string, number> = {};
    const itemRev: Record<string, number> = {};
    for (const i of items) {
      itemQty[i.item_name] = (itemQty[i.item_name] || 0) + i.quantity;
      itemRev[i.item_name] = (itemRev[i.item_name] || 0) + i.line_total;
    }
    const topByQty = Object.entries(itemQty).sort((a, b) => b[1] - a[1]);
    const topItem = topByQty[0]?.[0] ?? "";

    // Ingredient burn for sauces
    const sauceBurn: Record<string, number> = {};
    for (const i of items) {
      const rec = recipes.filter((r) => r.menu_item_id === i.menu_item_id);
      for (const r of rec) {
        if (r.ingredient_category === "Sauces") {
          sauceBurn[r.ingredient] = (sauceBurn[r.ingredient] || 0) + r.quantity_per_item * i.quantity;
        }
      }
    }
    const topSauces = Object.entries(sauceBurn).sort((a, b) => b[1] - a[1]).slice(0, 3);

    // Busiest and slowest hours
    const hourCounts: Record<number, number> = {};
    for (const o of orders) {
      const h = getHour(o);
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
    const hoursSorted = Object.entries(hourCounts).sort((a, b) => Number(b[1]) - Number(a[1]));
    const busiestHour = Number(hoursSorted[0]?.[0] ?? 18);
    const slowestHour = Number(hoursSorted[hoursSorted.length - 1]?.[0] ?? 15);

    // Beverage attachment
    const foodOrders = new Set(
      items.filter((i) => !["Coffee", "Tea", "Drinks", "Desserts", "Extras", "Sides"].includes(i.category))
        .map((i) => i.order_id)
    );
    const bevOrders = new Set(
      items.filter((i) => ["Coffee", "Tea", "Drinks"].includes(i.category))
        .map((i) => i.order_id)
    );
    const bevRate = foodOrders.size
      ? [...bevOrders].filter((id) => foodOrders.has(id)).length / foodOrders.size
      : 0;
    const dessertOrders = new Set(
      items.filter((i) => i.category === "Desserts").map((i) => i.order_id)
    );
    const dessRate = foodOrders.size
      ? [...dessertOrders].filter((id) => foodOrders.has(id)).length / foodOrders.size
      : 0;

    // High-complexity items with volume
    const pressureItems: { name: string; qty: number; complexity: number }[] = [];
    const seen = new Set<number>();
    for (const i of items) {
      if (seen.has(i.menu_item_id) || ["Extras", "Sides"].includes(i.category)) continue;
      seen.add(i.menu_item_id);
      const rec = recipes.filter((r) => r.menu_item_id === i.menu_item_id);
      const cx = rec.reduce((s, r) => s + r.complexity_weight, 0);
      const q = itemQty[i.item_name] || 0;
      if (cx >= 10 && q >= 50) {
        pressureItems.push({ name: i.item_name, qty: q, complexity: cx });
      }
    }
    pressureItems.sort((a, b) => b.qty * b.complexity - a.qty * a.complexity);

    // Short shelf-life ingredients with high burn
    const shortShelf = recipes
      .filter((r) => r.shelf_life_days <= 5 && r.ingredient_category !== "Beverages")
      .map((r) => r.ingredient);
    const uniqueShortShelf = [...new Set(shortShelf)];

    const result: ActionItem[] = [];

    result.push({
      icon: <ChefHat size={18} />,
      title: "Prep More",
      body: topSauces.length
        ? `${topSauces.map((s) => s[0]).join(", ")} are the highest-burn sauces. ${topSauces[0][0]} appears across high-volume starters and mains — treat it as a batch-critical item and forecast separately from general sauces. Consider doubling batch size for weekend prep.`
        : `Focus prep on sauces tied to the top 5 menu items.`,
      color: "text-padma-green",
    });

    result.push({
      icon: <ShoppingCart size={18} />,
      title: "Watch Inventory",
      body: uniqueShortShelf.length
        ? `Short shelf-life items to watch: ${uniqueShortShelf.slice(0, 5).join(", ")}. These have 3-5 day shelf lives — order in smaller, more frequent batches to reduce waste. Cross-check par levels against actual week-over-week usage.`
        : `All ingredients have adequate shelf life. Focus on reorder thresholds for high-volume proteins and sauces.`,
      color: "text-jade",
    });

    result.push({
      icon: <TrendingUp size={18} />,
      title: "Menu Opportunity",
      body: `Dessert attachment is ${(dessRate * 100).toFixed(0)}% and beverages ${(bevRate * 100).toFixed(0)}%. A server prompt ("save room for our Fried Banana with Coconut Ice Cream?") could lift dessert attach by 5-10 points. Consider a combo: any main + drink for a small discount to push beverage attach past 70%.`,
      color: "text-gold",
    });

    result.push({
      icon: <Clock size={18} />,
      title: "Staffing & Service Timing",
      body: `Peak dinner pressure hits ${busiestHour}:00. The ${slowestHour}:00 window is consistently the slowest — consider staggering breaks here and pre-prepping for the dinner rush. Weekend volume runs ~20-30% above weekday; schedule an extra server Friday-Sunday.`,
      color: "text-charcoal",
    });

    result.push({
      icon: <Megaphone size={18} />,
      title: "Promotion Idea",
      body: `${topItem} is already the top seller — don't discount it. Instead, promote underperforming high-margin items. Consider a "Chef's Pick" weekly feature spotlighting a Watch List item (low volume, decent margin) to move inventory and diversify orders across prep stations.`,
      color: "text-chili",
    });

    result.push({
      icon: <AlertCircle size={18} />,
      title: "Data Caveat",
      body: `This report is built on synthetic POS data. Recipe quantities and ingredient inventory targets are estimated assumptions for demonstration. Before acting on prep, purchasing, or staffing recommendations, validate against actual supplier lead times, real recipe cards, and historical POS data.`,
      color: "text-charcoal-muted",
    });

    return result;
  }, []);

  return (
    <section>
      <SectionHeader number={6} title="Owner Action Plan" question="What should we do next week?" />

      <div className="grid sm:grid-cols-2 gap-4">
        {actions.map((a) => (
          <div key={a.title} className="bg-white border border-rule rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={a.color}>{a.icon}</span>
              <h3 className="font-semibold text-sm text-charcoal">{a.title}</h3>
            </div>
            <p className="text-[13px] text-charcoal-light leading-relaxed">{a.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
