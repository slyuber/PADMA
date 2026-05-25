import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFilters } from "@/lib/FilterContext";
import { menuMap, recipes } from "@/lib/data";
import { fmtDollars, fmt, CATEGORY_COLORS, cn } from "@/lib/utils";
import { SectionHeader } from "../SectionHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts";
import { Flame, Leaf, Coffee, IceCreamCone } from "lucide-react";

export function MenuMovers() {
  const { items, metric } = useFilters();
  const [showAll, setShowAll] = useState(false);

  const ranked = useMemo(() => {
    const map: Record<
      number,
      { id: number; name: string; cat: string; qty: number; rev: number; spicy: boolean }
    > = {};
    for (const i of items) {
      if (i.category === "Extras" || i.category === "Sides") continue;
      if (!map[i.menu_item_id]) {
        const mi = menuMap.get(i.menu_item_id);
        map[i.menu_item_id] = {
          id: i.menu_item_id,
          name: i.item_name,
          cat: i.category,
          qty: 0,
          rev: 0,
          spicy: mi?.is_spicy ?? false,
        };
      }
      map[i.menu_item_id].qty += i.quantity;
      map[i.menu_item_id].rev += i.line_total;
    }
    const arr = Object.values(map);
    arr.sort((a, b) => (metric === "revenue" ? b.rev - a.rev : b.qty - a.qty));
    return arr;
  }, [items, metric]);

  const top = showAll ? ranked : ranked.slice(0, 15);
  const totalRev = ranked.reduce((s, r) => s + r.rev, 0);
  const totalQty = ranked.reduce((s, r) => s + r.qty, 0);
  const top10Rev = ranked.slice(0, 10).reduce((s, r) => s + r.rev, 0);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    for (const r of ranked) {
      cats[r.cat] = (cats[r.cat] || 0) + (metric === "revenue" ? r.rev : r.qty);
    }
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [ranked, metric]);

  const beverageItems = items.filter((i) =>
    ["Coffee", "Tea", "Drinks"].includes(i.category)
  );
  const dessertItems = items.filter((i) => i.category === "Desserts");
  const foodOrders = new Set(
    items.filter((i) => !["Coffee", "Tea", "Drinks", "Desserts", "Extras", "Sides"].includes(i.category))
      .map((i) => i.order_id)
  );
  const bevAttached = new Set(beverageItems.map((i) => i.order_id));
  const dessAttached = new Set(dessertItems.map((i) => i.order_id));
  const bevRate = foodOrders.size ? [...bevAttached].filter((id) => foodOrders.has(id)).length / foodOrders.size : 0;
  const dessRate = foodOrders.size ? [...dessAttached].filter((id) => foodOrders.has(id)).length / foodOrders.size : 0;

  const badges = (r: typeof ranked[0]) => {
    const b: { label: string; color: string; icon?: React.ReactNode }[] = [];
    if (r.spicy) b.push({ label: "Spicy", color: "bg-chili-pale text-chili", icon: <Flame size={10} /> });
    if (r.cat === "Lunch Special") b.push({ label: "Lunch", color: "bg-gold-pale text-gold" });
    if (["Coffee", "Tea", "Drinks"].includes(r.cat)) b.push({ label: "Drink", color: "bg-jade-pale text-jade", icon: <Coffee size={10} /> });
    if (r.cat === "Desserts") b.push({ label: "Dessert", color: "bg-chili-pale text-chili", icon: <IceCreamCone size={10} /> });
    const rec = recipes.filter((x) => x.menu_item_id === r.id);
    const hasSauce = rec.some((x) => x.ingredient_category === "Sauces" && x.complexity_weight >= 3);
    if (hasSauce) b.push({ label: "Sauce-heavy", color: "bg-gold-pale text-gold" });
    const hasTofu = rec.some((x) => x.ingredient.includes("tofu"));
    if (hasTofu) b.push({ label: "Tofu", color: "bg-padma-green-pale text-padma-green", icon: <Leaf size={10} /> });
    if (rec.length >= 7) b.push({ label: "Prep-heavy", color: "bg-chili-pale text-chili" });
    return b;
  };

  return (
    <section>
      <SectionHeader number={2} title="Menu Movers" question="What is actually moving?" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ranked bar chart */}
        <div className="lg:col-span-2 bg-white border border-rule rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wide">
              {metric === "revenue" ? "Revenue" : "Quantity"} — Top Items
            </p>
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-[11px] text-padma-green hover:underline"
            >
              {showAll ? "Top 15" : `All ${ranked.length}`}
            </button>
          </div>
          <div style={{ height: Math.max(300, top.length * 28) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top} layout="vertical" margin={{ left: 140, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={135}
                  tick={{ fontSize: 11, fill: "#44403c" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#faf6f0",
                    border: "1px solid #c8d6c0",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  formatter={(v: number) =>
                    metric === "revenue" ? [fmtDollars(v), "Revenue"] : [fmt(v), "Qty"]
                  }
                />
                <Bar
                  dataKey={metric === "revenue" ? "rev" : "qty"}
                  radius={[0, 4, 4, 0]}
                  animationDuration={800}
                >
                  {top.map((r) => (
                    <Cell key={r.id} fill={CATEGORY_COLORS[r.cat] || "#a8a29e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right column: category pie + attachment rates */}
        <div className="space-y-4">
          <div className="bg-white border border-rule rounded-lg p-4">
            <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wide mb-2">
              Category Share
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  animationDuration={800}
                >
                  {categoryData.map((c) => (
                    <Cell key={c.name} fill={CATEGORY_COLORS[c.name] || "#a8a29e"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#faf6f0",
                    border: "1px solid #c8d6c0",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  formatter={(v: number) =>
                    metric === "revenue" ? [fmtDollars(v), ""] : [fmt(v), ""]
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {categoryData.slice(0, 8).map((c) => (
                <div key={c.name} className="flex items-center gap-1 text-[10px] text-charcoal-muted">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[c.name] || "#a8a29e" }}
                  />
                  {c.name}
                </div>
              ))}
            </div>
          </div>

          {/* Insights card */}
          <div className="bg-white border border-rule rounded-lg p-4 text-sm space-y-2">
            <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wide mb-1">
              Insights
            </p>
            <p className="text-charcoal-light">
              Top 10 items account for{" "}
              <strong className="text-gold">{((top10Rev / totalRev) * 100).toFixed(0)}%</strong> of
              revenue.
            </p>
            <p className="text-charcoal-light">
              Beverage attachment rate:{" "}
              <strong className="text-jade">{(bevRate * 100).toFixed(0)}%</strong> of food orders
              include a drink.
            </p>
            <p className="text-charcoal-light">
              Dessert attachment rate:{" "}
              <strong className="text-chili">{(dessRate * 100).toFixed(0)}%</strong> — potential
              upsell opportunity.
            </p>
          </div>
        </div>
      </div>

      {/* Badge table for top items */}
      <div className="mt-4 bg-white border border-rule rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rule text-left text-[11px] text-charcoal-muted uppercase tracking-wide">
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Revenue</th>
              <th className="px-3 py-2">Tags</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {ranked.slice(0, 10).map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-rule/50 hover:bg-rice-dark/30"
                >
                  <td className="px-3 py-2 font-medium text-charcoal">{r.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmt(r.qty)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gold">{fmtDollars(r.rev)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {badges(r).map((b) => (
                        <span
                          key={b.label}
                          className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium", b.color)}
                        >
                          {b.icon}
                          {b.label}
                        </span>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </section>
  );
}
