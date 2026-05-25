import { useMemo, useState } from "react";
import { useFilters } from "@/lib/FilterContext";
import { recipes, inventoryTargets, completedOrders } from "@/lib/data";
import { fmt, CHART_COLORS } from "@/lib/utils";
import { SectionHeader } from "../SectionHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { AlertTriangle } from "lucide-react";

const CAT_COLORS: Record<string, string> = {
  Proteins: CHART_COLORS.chili,
  Sauces: CHART_COLORS.gold,
  Starches: CHART_COLORS.goldLight,
  Produce: CHART_COLORS.green,
  Aromatics: CHART_COLORS.greenPale,
  "Dairy Alternatives": CHART_COLORS.jade,
  "Nuts & Seeds": "#78350f",
  Beverages: CHART_COLORS.jadeLight,
  Desserts: "#9f1239",
  Oils: CHART_COLORS.muted,
  Supplies: "#a8a29e",
};

export function IngredientBurn() {
  const { items } = useFilters();
  const [showAll, setShowAll] = useState(false);

  const burnData = useMemo(() => {
    const burn: Record<string, { ingredient: string; cat: string; used: number; unit: string }> = {};

    for (const oi of items) {
      const rec = recipes.filter((r) => r.menu_item_id === oi.menu_item_id);
      for (const r of rec) {
        if (!burn[r.ingredient]) {
          burn[r.ingredient] = { ingredient: r.ingredient, cat: r.ingredient_category, used: 0, unit: r.unit };
        }
        burn[r.ingredient].used += r.quantity_per_item * oi.quantity;
      }
    }

    const daysInMonth = 31;
    const totalOrders = completedOrders.length;
    const dailyAvg = totalOrders / daysInMonth;

    return Object.values(burn)
      .map((b) => {
        const target = inventoryTargets.find((t) => t.ingredient === b.ingredient);
        const dailyUse = b.used / daysInMonth;
        return {
          ...b,
          used: Math.round(b.used),
          dailyAvg: Math.round(dailyUse),
          parLevel: target?.par_level ?? 0,
          reorderThreshold: target?.reorder_threshold ?? 0,
          leadTime: target?.typical_lead_time_days ?? 0,
          reorderFlag: target ? dailyUse * (target.typical_lead_time_days + 1) > target.reorder_threshold : false,
          shelfLife: recipes.find((r) => r.ingredient === b.ingredient)?.shelf_life_days ?? 999,
        };
      })
      .sort((a, b) => b.used - a.used);
  }, [items]);

  const categoryTotals = useMemo(() => {
    const cats: Record<string, number> = {};
    for (const b of burnData) {
      if (b.unit === "pc" || b.unit === "can" || b.unit === "shots" || b.unit === "stalks" || b.unit === "slice") continue;
      cats[b.cat] = (cats[b.cat] || 0) + b.used;
    }
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [burnData]);

  const criticalItems = burnData.filter((b) => b.reorderFlag || b.shelfLife <= 5);
  const display = showAll ? burnData : burnData.slice(0, 20);

  return (
    <section>
      <SectionHeader number={4} title="Ingredient Burn" question="What do we need to prep or buy?" />

      <p className="text-[11px] text-charcoal-muted italic mb-4">
        Based on demo recipe assumptions — see Data Notes for caveats.
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Burn board */}
        <div className="lg:col-span-2 bg-white border border-rule rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-rule">
            <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wide">
              Estimated Ingredient Burn — May 2026
            </p>
            <button onClick={() => setShowAll(!showAll)} className="text-[11px] text-padma-green hover:underline">
              {showAll ? "Top 20" : `All ${burnData.length}`}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] text-charcoal-muted uppercase tracking-wide border-b border-rule/50">
                  <th className="px-3 py-1.5">Ingredient</th>
                  <th className="px-3 py-1.5">Category</th>
                  <th className="px-3 py-1.5 text-right">Est. Used</th>
                  <th className="px-3 py-1.5 text-right">Daily Avg</th>
                  <th className="px-3 py-1.5 text-right">Par Level</th>
                  <th className="px-3 py-1.5 text-center">Flag</th>
                </tr>
              </thead>
              <tbody>
                {display.map((b) => (
                  <tr key={b.ingredient} className="border-b border-rule/30 hover:bg-rice-dark/30">
                    <td className="px-3 py-1.5 font-medium text-charcoal">{b.ingredient}</td>
                    <td className="px-3 py-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: CAT_COLORS[b.cat] || "#a8a29e" }}
                      />
                      <span className="text-charcoal-muted text-[11px]">{b.cat}</span>
                    </td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{fmt(b.used)} {b.unit}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-charcoal-muted">{fmt(b.dailyAvg)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums text-charcoal-muted">{fmt(b.parLevel)}</td>
                    <td className="px-3 py-1.5 text-center">
                      {b.reorderFlag && (
                        <span title="Reorder needed based on lead time" className="text-chili">
                          <AlertTriangle size={14} />
                        </span>
                      )}
                      {!b.reorderFlag && b.shelfLife <= 5 && (
                        <span title={`Short shelf life: ${b.shelfLife}d`} className="text-gold text-[10px] font-medium">
                          {b.shelfLife}d
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: category bars + warnings */}
        <div className="space-y-4">
          <div className="bg-white border border-rule rounded-lg p-4">
            <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wide mb-3">
              Burn by Category (g/ml)
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryTotals} layout="vertical" margin={{ left: 90, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#44403c" }}
                  tickLine={false}
                  axisLine={false}
                  width={85}
                />
                <Tooltip
                  contentStyle={{ background: "#faf6f0", border: "1px solid #c8d6c0", borderRadius: 6, fontSize: 12 }}
                  formatter={(v: number) => [fmt(v), "Est. used"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={800}>
                  {categoryTotals.map((c) => (
                    <Cell key={c.name} fill={CAT_COLORS[c.name] || "#a8a29e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {criticalItems.length > 0 && (
            <div className="bg-chili-pale/30 border border-chili/20 rounded-lg p-4">
              <p className="text-xs font-semibold text-chili uppercase tracking-wide mb-2">
                Watch List
              </p>
              <ul className="space-y-1">
                {criticalItems.slice(0, 6).map((c) => (
                  <li key={c.ingredient} className="text-[12px] text-charcoal-light flex items-start gap-1.5">
                    <AlertTriangle size={12} className="text-chili mt-0.5 shrink-0" />
                    <span>
                      <strong>{c.ingredient}</strong>
                      {c.reorderFlag && <span> — reorder soon ({c.leadTime}d lead time)</span>}
                      {!c.reorderFlag && c.shelfLife <= 5 && (
                        <span> — {c.shelfLife}d shelf life, watch waste</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
