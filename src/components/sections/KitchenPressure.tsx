import { useMemo } from "react";
import { useFilters } from "@/lib/FilterContext";
import { menuMap, recipes } from "@/lib/data";
import { fmtDollars, fmt, CATEGORY_COLORS, CHART_COLORS } from "@/lib/utils";
import { SectionHeader } from "../SectionHeader";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from "recharts";

export function KitchenPressure() {
  const { items } = useFilters();

  const data = useMemo(() => {
    const agg: Record<number, { id: number; name: string; cat: string; qty: number; rev: number; modCount: number }> = {};
    for (const i of items) {
      if (["Extras", "Sides"].includes(i.category)) continue;
      if (!agg[i.menu_item_id]) {
        agg[i.menu_item_id] = { id: i.menu_item_id, name: i.item_name, cat: i.category, qty: 0, rev: 0, modCount: 0 };
      }
      agg[i.menu_item_id].qty += i.quantity;
      agg[i.menu_item_id].rev += i.line_total;
      if (i.modifier) agg[i.menu_item_id].modCount += 1;
    }

    return Object.values(agg).map((a) => {
      const rec = recipes.filter((r) => r.menu_item_id === a.id);
      const ingredientCount = rec.length;
      const prepGroups = new Set(rec.map((r) => r.prep_group)).size;
      const avgComplexity = rec.length ? rec.reduce((s, r) => s + r.complexity_weight, 0) / rec.length : 1;
      const mi = menuMap.get(a.id);
      const spicyFlag = mi?.is_spicy ? 0.5 : 0;
      const sauceWeight = rec.filter((r) => r.ingredient_category === "Sauces").length * 0.3;
      const modRate = a.qty > 0 ? a.modCount / a.qty : 0;

      const complexity = ingredientCount * 0.25 + prepGroups * 0.5 + avgComplexity * 1.5 + spicyFlag + sauceWeight + modRate * 2;

      return {
        ...a,
        complexity: Math.round(complexity * 10) / 10,
        ingredientCount,
        prepGroups,
      };
    });
  }, [items]);

  const medianQty = data.length
    ? [...data].sort((a, b) => a.qty - b.qty)[Math.floor(data.length / 2)].qty
    : 0;
  const medianComplexity = data.length
    ? [...data].sort((a, b) => a.complexity - b.complexity)[Math.floor(data.length / 2)].complexity
    : 0;

  const quadrantLabel = (qty: number, cx: number) => {
    if (qty >= medianQty && cx < medianComplexity) return "Hero";
    if (qty >= medianQty && cx >= medianComplexity) return "Prep Pressure";
    if (qty < medianQty && cx >= medianComplexity) return "Watch List";
    return "Easy Add-on";
  };

  return (
    <section>
      <SectionHeader number={3} title="Kitchen Pressure" question="What makes the kitchen work hardest?" />

      <div className="bg-white border border-rule rounded-lg p-4 mb-4">
        <div className="flex flex-wrap gap-4 mb-3 text-[11px] text-charcoal-muted">
          <span>x = order volume &middot; y = complexity score &middot; bubble = revenue &middot; color = category</span>
        </div>
        <ResponsiveContainer width="100%" height={420}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis
              type="number"
              dataKey="qty"
              name="Volume"
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickLine={false}
              label={{ value: "Order Volume", position: "bottom", fontSize: 11, fill: "#78716c" }}
            />
            <YAxis
              type="number"
              dataKey="complexity"
              name="Complexity"
              tick={{ fontSize: 11, fill: "#78716c" }}
              tickLine={false}
              label={{ value: "Complexity", angle: -90, position: "left", fontSize: 11, fill: "#78716c" }}
            />
            <ZAxis type="number" dataKey="rev" range={[40, 400]} name="Revenue" />
            <Tooltip
              contentStyle={{
                background: "#faf6f0",
                border: "1px solid #c8d6c0",
                borderRadius: 6,
                fontSize: 12,
              }}
              formatter={(v: number, name: string) => {
                if (name === "Revenue") return [fmtDollars(v), name];
                if (name === "Volume") return [fmt(v), "Qty"];
                return [v.toFixed(1), name];
              }}
              labelFormatter={() => ""}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                return (
                  <div className="bg-rice border border-rule rounded-md p-2 text-xs shadow-sm">
                    <p className="font-semibold text-charcoal">{d.name}</p>
                    <p className="text-charcoal-muted">{d.cat}</p>
                    <p>Qty: {fmt(d.qty)} · Rev: {fmtDollars(d.rev)}</p>
                    <p>Complexity: {d.complexity} · Ingredients: {d.ingredientCount}</p>
                    <p className="font-medium mt-0.5" style={{ color: CATEGORY_COLORS[d.cat] }}>
                      {quadrantLabel(d.qty, d.complexity)}
                    </p>
                  </div>
                );
              }}
            />
            <ReferenceLine x={medianQty} stroke="#c8d6c0" strokeDasharray="4 4" />
            <ReferenceLine y={medianComplexity} stroke="#c8d6c0" strokeDasharray="4 4" />
            <Scatter data={data} animationDuration={800}>
              {data.map((d) => (
                <Cell key={d.id} fill={CATEGORY_COLORS[d.cat] || "#a8a29e"} fillOpacity={0.75} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        {/* Quadrant labels */}
        <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
          <div className="bg-padma-green-pale/30 rounded p-2">
            <strong className="text-padma-green">Heroes</strong>
            <span className="text-charcoal-muted"> — high volume, low complexity</span>
          </div>
          <div className="bg-chili-pale/30 rounded p-2">
            <strong className="text-chili">Prep Pressure</strong>
            <span className="text-charcoal-muted"> — high volume, high complexity</span>
          </div>
          <div className="bg-rice-darker rounded p-2">
            <strong className="text-charcoal-muted">Easy Add-ons</strong>
            <span className="text-charcoal-muted"> — low volume, low complexity</span>
          </div>
          <div className="bg-gold-pale/30 rounded p-2">
            <strong className="text-gold">Watch List</strong>
            <span className="text-charcoal-muted"> — low volume, high complexity</span>
          </div>
        </div>
      </div>
    </section>
  );
}
