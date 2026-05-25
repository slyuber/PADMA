import { useMemo } from "react";
import { motion } from "framer-motion";
import { useFilters } from "@/lib/FilterContext";
import { completedOrders, allOrderItems, getHour, CALGARY_HOLIDAYS_MAY_2026, menuMap } from "@/lib/data";
import { recipes } from "@/lib/data";
import { fmtDollars, fmt, CHART_COLORS } from "@/lib/utils";
import { SectionHeader } from "../SectionHeader";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  DollarSign, ShoppingBag, Receipt, TrendingUp, Clock, Utensils, Flame,
} from "lucide-react";

interface KPI {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}

export function ExecutiveSummary() {
  const { orders, items } = useFilters();

  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const avgTicket = orders.length ? revenue / orders.length : 0;

    const byDate: Record<string, { rev: number; count: number }> = {};
    for (const o of orders) {
      const d = o.order_date;
      if (!byDate[d]) byDate[d] = { rev: 0, count: 0 };
      byDate[d].rev += o.total;
      byDate[d].count += 1;
    }

    const dates = Object.keys(byDate).sort();
    const dailyData = dates.map((d) => ({
      date: d,
      day: new Date(d + "T12:00:00").getDate(),
      revenue: Math.round(byDate[d].rev),
      orders: byDate[d].count,
      isHoliday: d in CALGARY_HOLIDAYS_MAY_2026,
      holidayName: CALGARY_HOLIDAYS_MAY_2026[d] || "",
      dow: new Date(d + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short" }),
    }));

    const bestDay = dailyData.reduce((a, b) => (a.revenue > b.revenue ? a : b), dailyData[0]);

    const hourCounts: Record<number, number> = {};
    for (const o of orders) {
      const h = getHour(o);
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
    const hourEntries = Object.entries(hourCounts);
    const busiestHour = hourEntries.length
      ? hourEntries.reduce((a, b) => (Number(b[1]) > Number(a[1]) ? b : a))
      : ["0", "0"];

    const itemCounts: Record<string, number> = {};
    for (const i of items) {
      itemCounts[i.item_name] = (itemCounts[i.item_name] || 0) + i.quantity;
    }
    const topItem = Object.entries(itemCounts).reduce<[string, number]>(
      (a, b) => (b[1] > a[1] ? b : a),
      ["", 0]
    );

    const prepGroupLoad: Record<string, number> = {};
    for (const i of items) {
      const recipeRows = recipes.filter((r) => r.menu_item_id === i.menu_item_id);
      for (const r of recipeRows) {
        prepGroupLoad[r.prep_group] =
          (prepGroupLoad[r.prep_group] || 0) + i.quantity * r.complexity_weight;
      }
    }
    const topPrepGroup = Object.entries(prepGroupLoad).reduce<[string, number]>(
      (a, b) => (b[1] > a[1] ? b : a),
      ["", 0]
    );

    const dineIn = orders.filter((o) => o.order_type === "dine_in").length;
    const takeout = orders.filter((o) => o.order_type === "takeout").length;
    const delivery = orders.filter((o) => o.order_type === "delivery").length;
    const avgTipDineIn =
      dineIn > 0
        ? orders
            .filter((o) => o.order_type === "dine_in" && o.tip > 0)
            .reduce((s, o) => s + o.tip, 0) /
          orders.filter((o) => o.order_type === "dine_in").length
        : 0;

    const weekdayRev = dailyData
      .filter((d) => !["Sat", "Sun"].includes(d.dow))
      .reduce((s, d) => s + d.revenue, 0);
    const weekendRev = dailyData
      .filter((d) => ["Sat", "Sun"].includes(d.dow))
      .reduce((s, d) => s + d.revenue, 0);
    const weekdayDays = dailyData.filter((d) => !["Sat", "Sun"].includes(d.dow)).length;
    const weekendDays = dailyData.filter((d) => ["Sat", "Sun"].includes(d.dow)).length;

    return {
      revenue,
      orderCount: orders.length,
      avgTicket,
      bestDay,
      busiestHour: Number(busiestHour[0]),
      topItem,
      topPrepGroup,
      dailyData,
      dineIn,
      takeout,
      delivery,
      avgTipDineIn,
      weekdayAvg: weekdayDays ? weekdayRev / weekdayDays : 0,
      weekendAvg: weekendDays ? weekendRev / weekendDays : 0,
    };
  }, [orders, items]);

  const kpis: KPI[] = [
    {
      label: "Revenue",
      value: fmtDollars(stats.revenue),
      sub: `${fmt(stats.orderCount)} completed orders`,
      icon: <DollarSign size={18} />,
      color: "text-gold",
    },
    {
      label: "Avg Ticket",
      value: fmtDollars(stats.avgTicket),
      sub: `incl. 5% GST + tips`,
      icon: <Receipt size={18} />,
      color: "text-padma-green",
    },
    {
      label: "Best Day",
      value: stats.bestDay
        ? `${stats.bestDay.dow} May ${stats.bestDay.day}`
        : "—",
      sub: stats.bestDay ? fmtDollars(stats.bestDay.revenue) : "",
      icon: <TrendingUp size={18} />,
      color: "text-gold",
    },
    {
      label: "Busiest Hour",
      value: `${stats.busiestHour}:00`,
      sub: `${fmt(stats.dineIn)} dine-in · ${fmt(stats.takeout)} takeout · ${fmt(stats.delivery)} delivery`,
      icon: <Clock size={18} />,
      color: "text-jade",
    },
    {
      label: "Top Item",
      value: stats.topItem[0],
      sub: `${fmt(stats.topItem[1] as number)} sold`,
      icon: <Utensils size={18} />,
      color: "text-chili",
    },
    {
      label: "Highest Pressure",
      value: stats.topPrepGroup[0],
      sub: "by weighted complexity load",
      icon: <Flame size={18} />,
      color: "text-chili",
    },
  ];

  const insights = useMemo(() => {
    const lines: string[] = [];
    lines.push(
      `The restaurant did ${fmtDollars(stats.revenue)} across ${fmt(stats.orderCount)} orders in May — averaging ${fmtDollars(stats.avgTicket)} per ticket.`
    );
    lines.push(
      `Weekends averaged ${fmtDollars(stats.weekendAvg)}/day vs ${fmtDollars(stats.weekdayAvg)}/day on weekdays — a ${((stats.weekendAvg / stats.weekdayAvg - 1) * 100).toFixed(0)}% weekend lift.`
    );
    lines.push(
      `${stats.topItem[0]} was the top seller with ${fmt(stats.topItem[1] as number)} units. ${stats.topPrepGroup[0]} carried the heaviest kitchen load.`
    );
    lines.push(
      `Dine-in averaged ${fmtDollars(stats.avgTipDineIn)} tip per order. Delivery (${fmt(stats.delivery)} orders) generated no POS-tracked tips.`
    );
    if (stats.dailyData.some((d) => d.isHoliday)) {
      const hol = stats.dailyData.find((d) => d.isHoliday)!;
      lines.push(
        `Victoria Day (May ${hol.day}) brought ${fmtDollars(hol.revenue)} — check if that beat or trailed a typical ${hol.dow}.`
      );
    }
    return lines;
  }, [stats]);

  return (
    <section className="pt-8">
      <SectionHeader number={1} title="Executive Summary" question="How did the month perform?" />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="bg-white rounded-lg border border-rule p-3"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className={k.color}>{k.icon}</span>
              <span className="text-[11px] font-medium text-charcoal-muted uppercase tracking-wide">
                {k.label}
              </span>
            </div>
            <p className="text-base font-semibold text-charcoal leading-tight truncate">
              {k.value}
            </p>
            {k.sub && (
              <p className="text-[11px] text-charcoal-muted mt-0.5 truncate">{k.sub}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Owner insights */}
      <div className="bg-padma-green-pale/40 border border-padma-green/20 rounded-lg p-4 mb-8">
        <p className="text-xs font-semibold text-padma-green uppercase tracking-wide mb-2">
          Month at a Glance
        </p>
        <ul className="space-y-1.5">
          {insights.map((line, i) => (
            <li key={i} className="text-sm text-charcoal-light leading-snug flex gap-2">
              <span className="text-padma-green mt-0.5 shrink-0">&#8226;</span>
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* Calendar heatmap */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wide mb-3">
          Daily Revenue — May 2026
        </p>
        <CalendarHeatmap data={stats.dailyData} />
      </div>

      {/* Month story line */}
      <div className="bg-white border border-rule rounded-lg p-4">
        <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wide mb-3">
          Revenue Trend
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={stats.dailyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#78716c" }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: "#faf6f0",
                border: "1px solid #c8d6c0",
                borderRadius: 6,
                fontSize: 12,
              }}
              formatter={(v: number) => [fmtDollars(v), "Revenue"]}
              labelFormatter={(d) => `May ${d}`}
            />
            {stats.dailyData
              .filter((d) => d.isHoliday)
              .map((d) => (
                <ReferenceLine
                  key={d.date}
                  x={d.day}
                  stroke={CHART_COLORS.chili}
                  strokeDasharray="4 4"
                  label={{
                    value: d.holidayName,
                    position: "top",
                    fontSize: 10,
                    fill: CHART_COLORS.chili,
                  }}
                />
              ))}
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLORS.green}
              strokeWidth={2}
              fill="url(#revGrad)"
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

/* ── Calendar Heatmap ────────────────────────────────── */
function CalendarHeatmap({
  data,
}: {
  data: { date: string; day: number; revenue: number; dow: string; isHoliday: boolean }[];
}) {
  const { setSelectedDate } = useFilters();
  const maxRev = Math.max(...data.map((d) => d.revenue));

  const firstDow = new Date(data[0]?.date + "T12:00:00").getDay();
  const weeks: (typeof data[number] | null)[][] = [];
  let week: (typeof data[number] | null)[] = new Array(firstDow).fill(null);

  for (const d of data) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${weeks.length}, 1fr)` }}>
        {dayLabels.map((l) => (
          <div key={l} className="text-[10px] text-charcoal-muted pr-1.5 flex items-center justify-end h-8">
            {l}
          </div>
        ))}
        {weeks.map((wk, wi) =>
          wk.map((d, di) => {
            if (!d) {
              return <div key={`${wi}-${di}`} className="w-8 h-8" />;
            }
            const intensity = d.revenue / maxRev;
            const bg =
              intensity > 0.8
                ? "bg-padma-green"
                : intensity > 0.6
                ? "bg-padma-green-light"
                : intensity > 0.4
                ? "bg-padma-green-pale"
                : intensity > 0.2
                ? "bg-rice-darker"
                : "bg-rice-dark";
            const textColor = intensity > 0.6 ? "text-white" : "text-charcoal-light";
            return (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                title={`May ${d.day}: ${fmtDollars(d.revenue)}`}
                className={`w-8 h-8 rounded text-[10px] font-medium ${bg} ${textColor} hover:ring-2 hover:ring-padma-green transition-all ${
                  d.isHoliday ? "ring-1 ring-chili" : ""
                }`}
              >
                {d.day}
              </button>
            );
          })
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 text-[10px] text-charcoal-muted">
        <span>Low</span>
        {["bg-rice-dark", "bg-rice-darker", "bg-padma-green-pale", "bg-padma-green-light", "bg-padma-green"].map(
          (c) => (
            <div key={c} className={`w-4 h-4 rounded ${c}`} />
          )
        )}
        <span>High</span>
        <span className="ml-3">
          <span className="inline-block w-3 h-3 rounded ring-1 ring-chili mr-1" />
          Holiday
        </span>
      </div>
    </div>
  );
}
