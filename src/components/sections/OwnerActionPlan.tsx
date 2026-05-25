import { useMemo } from "react";
import { completedOrders, allOrderItems, recipes, getHour } from "@/lib/data";
import { fmtDollars, fmt, fmtPct } from "@/lib/utils";
import { SectionHeader } from "../SectionHeader";
import { TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight } from "lucide-react";

export function OwnerActionPlan() {
  const data = useMemo(() => {
    const orders = completedOrders;
    const items = allOrderItems.filter((i) => {
      const oid = orders.find((o) => o.order_id === i.order_id);
      return !!oid;
    });

    // Item volume
    const itemQty: Record<string, { qty: number; rev: number; cat: string }> = {};
    for (const i of items) {
      if (!itemQty[i.item_name]) itemQty[i.item_name] = { qty: 0, rev: 0, cat: i.category };
      itemQty[i.item_name].qty += i.quantity;
      itemQty[i.item_name].rev += i.line_total;
    }
    const topByQty = Object.entries(itemQty)
      .filter(([, v]) => !["Sides", "Extras"].includes(v.cat))
      .sort((a, b) => b[1].qty - a[1].qty);
    const bottomByQty = [...topByQty].reverse();

    // Sauce burn
    const sauceBurn: Record<string, number> = {};
    for (const i of items) {
      const rec = recipes.filter((r) => r.menu_item_id === i.menu_item_id);
      for (const r of rec) {
        if (r.ingredient_category === "Sauces") {
          sauceBurn[r.ingredient] = (sauceBurn[r.ingredient] || 0) + r.quantity_per_item * i.quantity;
        }
      }
    }
    const topSauce = Object.entries(sauceBurn).sort((a, b) => b[1] - a[1])[0];

    // Busiest/slowest hours
    const hourCounts: Record<number, number> = {};
    for (const o of orders) {
      const h = getHour(o);
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
    const hoursSorted = Object.entries(hourCounts).sort((a, b) => Number(b[1]) - Number(a[1]));
    const busiestHour = Number(hoursSorted[0]?.[0] ?? 18);
    const slowestHour = Number(hoursSorted[hoursSorted.length - 1]?.[0] ?? 15);

    // Beverage / dessert attachment
    const foodOrders = new Set(
      items.filter((i) => !["Coffee", "Tea", "Drinks", "Desserts", "Extras", "Sides"].includes(i.category)).map((i) => i.order_id)
    );
    const bevOrders = new Set(items.filter((i) => ["Coffee", "Tea", "Drinks"].includes(i.category)).map((i) => i.order_id));
    const dessOrders = new Set(items.filter((i) => i.category === "Desserts").map((i) => i.order_id));
    const bevRate = foodOrders.size ? [...bevOrders].filter((id) => foodOrders.has(id)).length / foodOrders.size : 0;
    const dessRate = foodOrders.size ? [...dessOrders].filter((id) => foodOrders.has(id)).length / foodOrders.size : 0;

    // Short shelf life
    const shortShelf = [...new Set(
      recipes.filter((r) => r.shelf_life_days <= 5 && r.ingredient_category !== "Beverages").map((r) => r.ingredient)
    )];

    // Weekend vs weekday
    const byDate: Record<string, number> = {};
    for (const o of orders) byDate[o.order_date] = (byDate[o.order_date] || 0) + o.total;
    const dailyData = Object.entries(byDate).map(([d, rev]) => ({
      dow: new Date(d + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short" }),
      rev,
    }));
    const wkdayRevs = dailyData.filter((d) => !["Sat", "Sun"].includes(d.dow));
    const wkendRevs = dailyData.filter((d) => ["Sat", "Sun"].includes(d.dow));
    const weekdayAvg = wkdayRevs.length ? wkdayRevs.reduce((s, d) => s + d.rev, 0) / wkdayRevs.length : 0;
    const weekendAvg = wkendRevs.length ? wkendRevs.reduce((s, d) => s + d.rev, 0) / wkendRevs.length : 0;
    const weekendLift = weekdayAvg > 0 ? (weekendAvg / weekdayAvg - 1) : 0;

    // Top 5 items by revenue
    const topRevItems = Object.entries(itemQty)
      .filter(([, v]) => !["Sides", "Extras", "Lunch Special"].includes(v.cat))
      .sort((a, b) => b[1].rev - a[1].rev)
      .slice(0, 5);

    // Lowest-selling items with decent margin (>$15)
    const lowVolHighPrice = Object.entries(itemQty)
      .filter(([, v]) => !["Sides", "Extras", "Coffee", "Tea", "Drinks"].includes(v.cat))
      .sort((a, b) => a[1].qty - b[1].qty)
      .filter(([, v]) => v.rev / v.qty > 15)
      .slice(0, 3);

    return {
      topByQty, bottomByQty, topSauce,
      busiestHour, slowestHour,
      bevRate, dessRate,
      shortShelf, weekendLift, weekdayAvg, weekendAvg,
      topRevItems, lowVolHighPrice,
    };
  }, []);

  const insights = [
    {
      icon: <TrendingUp size={16} />,
      color: "text-padma-green",
      bg: "bg-padma-green-pale/30",
      title: `${data.topByQty[0]?.[0]} — ${fmt(data.topByQty[0]?.[1].qty ?? 0)} sold`,
      body: `Top seller by volume. ${fmtDollars(data.topByQty[0]?.[1].rev ?? 0)} revenue. Keep prep stocked.`,
    },
    {
      icon: <ArrowUpRight size={16} />,
      color: "text-gold",
      bg: "bg-gold-pale/30",
      title: `Dessert attach at ${fmtPct(data.dessRate)}`,
      body: `Beverage attach is ${fmtPct(data.bevRate)}. A server prompt could lift desserts 5-10 points.`,
    },
    {
      icon: <TrendingUp size={16} />,
      color: "text-jade",
      bg: "bg-jade-pale/30",
      title: `Weekend lift: +${(data.weekendLift * 100).toFixed(0)}%`,
      body: `${fmtDollars(data.weekendAvg)}/day weekends vs ${fmtDollars(data.weekdayAvg)} weekdays. Schedule extra cover Fri-Sun.`,
    },
    {
      icon: <AlertTriangle size={16} />,
      color: "text-chili",
      bg: "bg-chili-pale/30",
      title: `${data.topSauce?.[0] ?? "Top sauce"} — ${fmt(Math.round(data.topSauce?.[1] ?? 0))}g burned`,
      body: `Highest-volume sauce. Batch-critical — double batch for weekends.`,
    },
    {
      icon: <TrendingDown size={16} />,
      color: "text-charcoal-muted",
      bg: "bg-rice-dark",
      title: `${data.slowestHour}:00 is dead — ${data.busiestHour}:00 peaks`,
      body: `Stagger breaks at ${data.slowestHour}:00, pre-prep for the ${data.busiestHour}:00 rush.`,
    },
  ];

  return (
    <section>
      <SectionHeader number={6} title="Key Takeaways" question="What should we act on?" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {insights.map((a) => (
          <div key={a.title} className={`${a.bg} border border-rule/50 rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={a.color}>{a.icon}</span>
              <h3 className="font-semibold text-[13px] text-charcoal">{a.title}</h3>
            </div>
            <p className="text-[12px] text-charcoal-light leading-relaxed">{a.body}</p>
          </div>
        ))}
      </div>

      {/* Data tables: revenue leaders + promote opportunities */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white border border-rule rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-rule/50">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted">Top Revenue Drivers</p>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {data.topRevItems.map(([name, v]) => (
                <tr key={name} className="border-b border-rule/20 hover:bg-rice-dark/30">
                  <td className="px-4 py-2 font-medium text-charcoal">{name}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-charcoal-muted">{fmt(v.qty)} sold</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-gold">{fmtDollars(v.rev)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-rule rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-rule/50">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted">Low Volume, Worth Promoting</p>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {data.lowVolHighPrice.map(([name, v]) => (
                <tr key={name} className="border-b border-rule/20 hover:bg-rice-dark/30">
                  <td className="px-4 py-2 font-medium text-charcoal">{name}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-charcoal-muted">{fmt(v.qty)} sold</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-chili">{fmtDollars(v.rev / v.qty)}/ea</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-2 text-[10px] text-charcoal-muted italic">
            Higher-priced items with low volume — "Chef's Pick" candidates
          </p>
        </div>
      </div>

      <p className="text-[10px] text-charcoal-muted italic mt-4 text-center">
        Based on synthetic POS data — validate against actual records before acting
      </p>
    </section>
  );
}
