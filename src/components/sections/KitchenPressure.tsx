import { useMemo } from "react";
import { useFilters } from "@/lib/FilterContext";
import { menuMap, recipes } from "@/lib/data";
import { fmtDollars, fmt, CATEGORY_COLORS, CHART_COLORS } from "@/lib/utils";
import { SectionHeader } from "../SectionHeader";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export function KitchenPressure() {
  const { items } = useFilters();

  // Prep station load
  const stationData = useMemo(() => {
    const stations: Record<string, { orders: number; complexity: number; items: string[] }> = {};
    for (const i of items) {
      if (["Extras", "Sides"].includes(i.category)) continue;
      const rec = recipes.filter((r) => r.menu_item_id === i.menu_item_id);
      for (const r of rec) {
        if (!stations[r.prep_group]) stations[r.prep_group] = { orders: 0, complexity: 0, items: [] };
        stations[r.prep_group].orders += i.quantity;
        stations[r.prep_group].complexity += i.quantity * r.complexity_weight;
        if (!stations[r.prep_group].items.includes(i.item_name)) {
          stations[r.prep_group].items.push(i.item_name);
        }
      }
    }
    return Object.entries(stations)
      .map(([name, v]) => ({ name, orders: v.orders, complexity: Math.round(v.complexity), topItems: v.items.slice(0, 3) }))
      .sort((a, b) => b.complexity - a.complexity);
  }, [items]);

  // Top pressure items (high volume + high complexity)
  const pressureItems = useMemo(() => {
    const agg: Record<number, { name: string; cat: string; qty: number; rev: number; complexity: number; station: string }> = {};
    for (const i of items) {
      if (["Extras", "Sides"].includes(i.category)) continue;
      if (!agg[i.menu_item_id]) {
        const rec = recipes.filter((r) => r.menu_item_id === i.menu_item_id);
        const cx = rec.reduce((s, r) => s + r.complexity_weight, 0);
        const station = rec[0]?.prep_group ?? "Other";
        agg[i.menu_item_id] = { name: i.item_name, cat: i.category, qty: 0, rev: 0, complexity: cx, station };
      }
      agg[i.menu_item_id].qty += i.quantity;
      agg[i.menu_item_id].rev += i.line_total;
    }
    return Object.values(agg)
      .map((a) => ({ ...a, pressure: a.qty * a.complexity }))
      .sort((a, b) => b.pressure - a.pressure)
      .slice(0, 10);
  }, [items]);

  const stationColors: Record<string, string> = {
    "Wok Station": CHART_COLORS.chili,
    "Grill Station": CHART_COLORS.gold,
    "Fry Station": CHART_COLORS.goldLight,
    "Soup Station": CHART_COLORS.jade,
    "Prep/Cold": CHART_COLORS.green,
    "Sauce Prep": CHART_COLORS.greenLight,
    "Beverage Station": CHART_COLORS.jadeLight,
    "Dessert Station": "#9f1239",
  };

  return (
    <section>
      <SectionHeader number={3} title="Kitchen Pressure" question="Where is the kitchen working hardest?" />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Station load bars */}
        <div className="bg-white border border-rule rounded-xl p-5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted mb-3">
            Load by Prep Station
          </p>
          <ResponsiveContainer width="100%" height={Math.max(200, stationData.length * 36)}>
            <BarChart data={stationData} layout="vertical" margin={{ left: 110, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={105} tick={{ fontSize: 11, fill: "#44403c" }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "#faf6f0", border: "1px solid #c8d6c0", borderRadius: 6, fontSize: 11 }}
                formatter={(v: number) => [fmt(v), "Weighted load"]}
              />
              <Bar dataKey="complexity" radius={[0, 4, 4, 0]} animationDuration={800}>
                {stationData.map((s) => (
                  <Cell key={s.name} fill={stationColors[s.name] || CHART_COLORS.muted} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-charcoal-muted italic mt-2">
            Weighted by volume x recipe complexity score
          </p>
        </div>

        {/* Top pressure items */}
        <div className="bg-white border border-rule rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-rule/50">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted">
              Highest-Pressure Items
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] text-charcoal-muted uppercase tracking-wide border-b border-rule/30">
                <th className="px-5 py-2">Item</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Revenue</th>
                <th className="px-3 py-2">Station</th>
              </tr>
            </thead>
            <tbody>
              {pressureItems.map((p, i) => (
                <tr key={p.name} className="border-b border-rule/20 hover:bg-rice-dark/30">
                  <td className="px-5 py-2 font-medium text-charcoal">
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: CATEGORY_COLORS[p.cat] || "#a8a29e" }} />
                    {p.name}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-charcoal-muted">{fmt(p.qty)}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gold">{fmtDollars(p.rev)}</td>
                  <td className="px-3 py-2 text-[11px] text-charcoal-muted">{p.station}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
