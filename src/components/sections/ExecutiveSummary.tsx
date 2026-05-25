import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useFilters } from "@/lib/FilterContext";
import { completedOrders, allOrderItems, getHour, CALGARY_HOLIDAYS_MAY_2026, recipes } from "@/lib/data";
import { fmtDollars, fmt, fmtK, CHART_COLORS } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import {
  TrendingUp, Flame, Coffee, UtensilsCrossed, Clock, AlertTriangle,
} from "lucide-react";

export function ExecutiveSummary() {
  const { orders, items } = useFilters();

  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const netSales = orders.reduce((s, o) => s + o.subtotal, 0);
    const avgTicket = orders.length ? revenue / orders.length : 0;
    const tips = orders.reduce((s, o) => s + o.tip, 0);

    const byDate: Record<string, { rev: number; count: number; tips: number }> = {};
    for (const o of orders) {
      const d = o.order_date;
      if (!byDate[d]) byDate[d] = { rev: 0, count: 0, tips: 0 };
      byDate[d].rev += o.total;
      byDate[d].count += 1;
      byDate[d].tips += o.tip;
    }

    const dates = Object.keys(byDate).sort();
    const dailyData = dates.map((d) => ({
      date: d,
      day: new Date(d + "T12:00:00").getDate(),
      revenue: Math.round(byDate[d].rev),
      orders: byDate[d].count,
      tips: Math.round(byDate[d].tips),
      isHoliday: d in CALGARY_HOLIDAYS_MAY_2026,
      holidayName: CALGARY_HOLIDAYS_MAY_2026[d] || "",
      dow: new Date(d + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short" }),
    }));

    const bestDay = dailyData.reduce((a, b) => (a.revenue > b.revenue ? a : b), dailyData[0]);
    const worstDay = dailyData.reduce((a, b) => (a.revenue < b.revenue ? a : b), dailyData[0]);

    // Hourly distribution
    const hourCounts: Record<number, number> = {};
    for (const o of orders) {
      const h = getHour(o);
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    }
    const hourData = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      orders: hourCounts[h] || 0,
      label: h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`,
    })).filter((h) => h.orders > 0);

    const busiestHour = hourData.reduce((a, b) => (b.orders > a.orders ? b : a), hourData[0]);

    // Top item excluding Sides and Extras
    const itemCounts: Record<string, number> = {};
    for (const i of items) {
      if (i.category === "Sides" || i.category === "Extras") continue;
      itemCounts[i.item_name] = (itemCounts[i.item_name] || 0) + i.quantity;
    }
    const topItem = Object.entries(itemCounts).reduce<[string, number]>(
      (a, b) => (b[1] > a[1] ? b : a),
      ["", 0]
    );

    // Prep group load
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

    // Channel split
    const dineIn = orders.filter((o) => o.order_type === "dine_in");
    const takeout = orders.filter((o) => o.order_type === "takeout");
    const delivery = orders.filter((o) => o.order_type === "delivery");
    const dineInRev = dineIn.reduce((s, o) => s + o.total, 0);
    const takeoutRev = takeout.reduce((s, o) => s + o.total, 0);
    const deliveryRev = delivery.reduce((s, o) => s + o.total, 0);

    // Weekend vs weekday
    const weekdayRevs = dailyData.filter((d) => !["Sat", "Sun"].includes(d.dow));
    const weekendRevs = dailyData.filter((d) => ["Sat", "Sun"].includes(d.dow));
    const weekdayAvg = weekdayRevs.length ? weekdayRevs.reduce((s, d) => s + d.revenue, 0) / weekdayRevs.length : 0;
    const weekendAvg = weekendRevs.length ? weekendRevs.reduce((s, d) => s + d.revenue, 0) / weekendRevs.length : 0;

    // Beverage attachment
    const foodOrders = new Set(
      items.filter((i) => !["Coffee", "Tea", "Drinks", "Desserts", "Extras", "Sides"].includes(i.category)).map((i) => i.order_id)
    );
    const bevOrders = new Set(
      items.filter((i) => ["Coffee", "Tea", "Drinks"].includes(i.category)).map((i) => i.order_id)
    );
    const bevRate = foodOrders.size ? [...bevOrders].filter((id) => foodOrders.has(id)).length / foodOrders.size : 0;

    // Mini waterfall
    const grossSales = orders.reduce((s, o) => s + o.subtotal, 0);
    const discounts = orders.reduce((s, o) => s + o.discount_amount, 0);
    const gst = orders.reduce((s, o) => s + o.gst, 0);

    return {
      revenue, netSales, avgTicket, tips, grossSales, discounts, gst,
      orderCount: orders.length,
      bestDay, worstDay, dailyData, hourData, busiestHour,
      topItem, topPrepGroup,
      dineInCount: dineIn.length, takeoutCount: takeout.length, deliveryCount: delivery.length,
      dineInRev, takeoutRev, deliveryRev,
      weekdayAvg, weekendAvg, bevRate,
    };
  }, [orders, items]);

  return (
    <section className="pt-10">
      {/* Hero: Month Pulse + Calendar + Highlights */}
      <div className="grid lg:grid-cols-12 gap-6 mb-8">
        {/* LEFT: Month Pulse */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-3 space-y-4"
        >
          <div className="bg-white border border-rule rounded-xl p-5 shadow-sm">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-charcoal-muted mb-1">
              May 2026 Revenue
            </p>
            <p className="font-serif text-4xl text-charcoal tracking-tight leading-none mb-2">
              {fmtK(stats.revenue)}
            </p>
            <div className="flex items-baseline gap-3 text-[12px] mb-4">
              <span className="text-charcoal-muted">{fmt(stats.orderCount)} orders</span>
              <span className="text-charcoal-muted">&middot;</span>
              <span className="text-charcoal-muted">{fmtDollars(stats.avgTicket)} avg</span>
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={stats.dailyData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.green} strokeWidth={1.5} fill="url(#pulseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-rule/50">
              <div>
                <p className="text-[10px] text-charcoal-muted uppercase tracking-wide">Best Day</p>
                <p className="text-sm font-semibold text-charcoal">{stats.bestDay?.dow} {stats.bestDay?.day}</p>
                <p className="text-[11px] text-padma-green font-medium">{fmtDollars(stats.bestDay?.revenue ?? 0)}</p>
              </div>
              <div>
                <p className="text-[10px] text-charcoal-muted uppercase tracking-wide">Slowest</p>
                <p className="text-sm font-semibold text-charcoal">{stats.worstDay?.dow} {stats.worstDay?.day}</p>
                <p className="text-[11px] text-chili font-medium">{fmtDollars(stats.worstDay?.revenue ?? 0)}</p>
              </div>
            </div>
          </div>

          {/* Channel split mini */}
          <div className="bg-white border border-rule rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted mb-3">
              Revenue by Channel
            </p>
            <ChannelBar
              data={[
                { label: "Dine-In", value: stats.dineInRev, color: CHART_COLORS.green },
                { label: "Takeout", value: stats.takeoutRev, color: CHART_COLORS.gold },
                { label: "Delivery", value: stats.deliveryRev, color: CHART_COLORS.jade },
              ]}
              total={stats.revenue}
            />
          </div>
        </motion.div>

        {/* CENTER: Calendar Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-5"
        >
          <div className="bg-white border border-rule rounded-xl p-5 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-charcoal-muted">
                Daily Revenue — May 2026
              </p>
              <p className="text-[10px] text-charcoal-muted">Click a day to filter</p>
            </div>
            <CalendarHeatmap data={stats.dailyData} />
          </div>
        </motion.div>

        {/* RIGHT: Owner Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-4 space-y-2.5"
        >
          <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted mb-1 px-1">
            Owner Highlights
          </p>
          <InsightCard
            icon={<TrendingUp size={15} />}
            color="text-padma-green"
            title="Dinner carries the month"
            body={`Peak hour ${stats.busiestHour?.label} drives ${fmt(stats.busiestHour?.orders ?? 0)} orders. Weekends avg ${fmtDollars(stats.weekendAvg)}/day vs ${fmtDollars(stats.weekdayAvg)} weekdays.`}
          />
          <InsightCard
            icon={<UtensilsCrossed size={15} />}
            color="text-gold"
            title={`${stats.topItem[0]} leads`}
            body={`${fmt(stats.topItem[1])} sold this month — your highest-volume main. Watch prep capacity.`}
          />
          <InsightCard
            icon={<Flame size={15} />}
            color="text-chili"
            title={`${stats.topPrepGroup[0]} under pressure`}
            body={`Highest weighted complexity load in the kitchen. Staff here during dinner rush.`}
          />
          <InsightCard
            icon={<Coffee size={15} />}
            color="text-jade"
            title={`Beverage attach: ${(stats.bevRate * 100).toFixed(0)}%`}
            body={`Room to grow. A server prompt or combo deal could lift this 5-10 points.`}
          />
          <InsightCard
            icon={<AlertTriangle size={15} />}
            color="text-charcoal-muted"
            title="Synthetic data caveat"
            body="Demo assumptions — validate against actual POS before acting."
          />
        </motion.div>
      </div>

      {/* Bottom tiles: Daypart Pulse + Money Flow + Weekend Effect */}
      <div className="grid sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white border border-rule rounded-xl p-4 shadow-sm"
        >
          <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted mb-3">
            Daypart Pulse
          </p>
          <ResponsiveContainer width="100%" height={100}>
            <BarChart data={stats.hourData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9, fill: "#78716c" }}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#faf6f0", border: "1px solid #c8d6c0", borderRadius: 6, fontSize: 11 }}
                formatter={(v: number) => [`${v} orders`, ""]}
                labelFormatter={(l) => `${l}`}
              />
              <Bar dataKey="orders" radius={[2, 2, 0, 0]} animationDuration={800}>
                {stats.hourData.map((h) => (
                  <Cell
                    key={h.hour}
                    fill={h.hour === stats.busiestHour?.hour ? CHART_COLORS.green : CHART_COLORS.greenPale}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-charcoal-muted mt-2">
            <span className="font-medium text-padma-green">{stats.busiestHour?.label}</span> is peak — staff accordingly
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white border border-rule rounded-xl p-4 shadow-sm"
        >
          <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted mb-3">
            Money Flow
          </p>
          <MiniWaterfall
            gross={stats.grossSales}
            discounts={stats.discounts}
            gst={stats.gst}
            tips={stats.tips}
          />
          <p className="text-[11px] text-charcoal-muted mt-2">
            Not every dollar through the till is revenue
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-white border border-rule rounded-xl p-4 shadow-sm"
        >
          <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted mb-3">
            Weekend Effect
          </p>
          <div className="flex items-end gap-4 mb-3">
            <div>
              <p className="text-[10px] text-charcoal-muted">Weekday avg</p>
              <p className="text-lg font-semibold text-charcoal tabular-nums">{fmtDollars(stats.weekdayAvg)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-charcoal-muted">Weekend avg</p>
              <p className="text-lg font-semibold text-padma-green tabular-nums">{fmtDollars(stats.weekendAvg)}</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-rice-dark overflow-hidden">
            <div
              className="h-full rounded-full bg-padma-green transition-all"
              style={{ width: `${Math.min((stats.weekendAvg / (stats.weekdayAvg + stats.weekendAvg)) * 100, 100)}%`, marginLeft: `${(stats.weekdayAvg / (stats.weekdayAvg + stats.weekendAvg)) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-charcoal-muted mt-2">
            <span className="font-medium text-padma-green">
              +{((stats.weekendAvg / stats.weekdayAvg - 1) * 100).toFixed(0)}%
            </span> weekend lift — schedule extra cover Fri-Sun
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Insight Card ────────────────────────────────── */
function InsightCard({ icon, color, title, body }: { icon: React.ReactNode; color: string; title: string; body: string }) {
  return (
    <div className="bg-white border border-rule/70 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-0.5">
        <span className={color}>{icon}</span>
        <p className="text-[13px] font-semibold text-charcoal leading-tight">{title}</p>
      </div>
      <p className="text-[11px] text-charcoal-muted leading-relaxed pl-[23px]">{body}</p>
    </div>
  );
}

/* ── Channel Bar ────────────────────────────────── */
function ChannelBar({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) {
  return (
    <div className="space-y-2">
      {data.map((d) => {
        const pct = total > 0 ? (d.value / total) * 100 : 0;
        return (
          <div key={d.label} className="flex items-center gap-2">
            <span className="text-[11px] text-charcoal-muted w-14 shrink-0">{d.label}</span>
            <div className="flex-1 h-3 bg-rice-dark rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: d.color }} />
            </div>
            <span className="text-[11px] font-medium tabular-nums text-charcoal w-11 text-right">{pct.toFixed(0)}%</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Mini Waterfall ────────────────────────────────── */
function MiniWaterfall({ gross, discounts, gst, tips }: { gross: number; discounts: number; gst: number; tips: number }) {
  const net = gross - discounts;
  const rows = [
    { label: "Gross Sales", value: gross, color: CHART_COLORS.green },
    { label: "Discounts", value: -discounts, color: CHART_COLORS.chili },
    { label: "Net Sales", value: net, color: CHART_COLORS.greenLight },
    { label: "GST", value: gst, color: CHART_COLORS.jade },
    { label: "Tips", value: tips, color: CHART_COLORS.gold },
  ];
  const maxVal = Math.max(...rows.map((r) => Math.abs(r.value)));

  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="text-[10px] text-charcoal-muted w-16 shrink-0">{r.label}</span>
          <div className="flex-1 h-2.5 bg-rice-dark rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(Math.abs(r.value) / maxVal) * 100}%`, backgroundColor: r.color }}
            />
          </div>
          <span className="text-[10px] font-medium tabular-nums text-charcoal w-14 text-right">
            {r.value < 0 ? `(${fmtK(Math.abs(r.value))})` : fmtK(r.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Calendar Heatmap v2 ────────────────────────────────── */
function CalendarHeatmap({
  data,
}: {
  data: { date: string; day: number; revenue: number; orders: number; tips: number; dow: string; isHoliday: boolean; holidayName: string }[];
}) {
  const { setSelectedDate } = useFilters();
  const [hovered, setHovered] = useState<typeof data[number] | null>(null);
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

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  const getIntensityClass = (rev: number) => {
    const intensity = rev / maxRev;
    if (intensity > 0.85) return "bg-padma-green text-white";
    if (intensity > 0.7) return "bg-padma-green-light text-white";
    if (intensity > 0.5) return "bg-padma-green-pale/80 text-charcoal";
    if (intensity > 0.3) return "bg-rice-darker text-charcoal-light";
    return "bg-rice-dark text-charcoal-muted";
  };

  return (
    <div className="relative">
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pt-0">
          {dayLabels.map((l, i) => (
            <div key={i} className="w-5 h-9 flex items-center justify-center text-[10px] text-charcoal-muted">
              {l}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div className="flex gap-1 flex-1">
          {weeks.map((wk, wi) => (
            <div key={wi} className="flex flex-col gap-1 flex-1">
              {wk.map((d, di) => {
                if (!d) return <div key={`${wi}-${di}`} className="h-9 rounded-md" />;
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    onMouseEnter={() => setHovered(d)}
                    onMouseLeave={() => setHovered(null)}
                    className={`h-9 rounded-md text-[11px] font-medium transition-all hover:scale-105 hover:shadow-md ${getIntensityClass(d.revenue)} ${d.isHoliday ? "ring-2 ring-chili/60" : ""}`}
                  >
                    {d.day}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-[10px] text-charcoal-muted">
        <span>Low</span>
        {["bg-rice-dark", "bg-rice-darker", "bg-padma-green-pale/80", "bg-padma-green-light", "bg-padma-green"].map((c) => (
          <div key={c} className={`w-5 h-3.5 rounded-sm ${c}`} />
        ))}
        <span>High</span>
        <span className="ml-3 flex items-center gap-1">
          <span className="inline-block w-3.5 h-3.5 rounded-sm ring-2 ring-chili/60" />
          Holiday
        </span>
      </div>

      {/* Rich hover tooltip */}
      {hovered && (
        <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-charcoal text-white rounded-lg px-4 py-3 shadow-lg text-[11px] whitespace-nowrap pointer-events-none">
          <p className="font-semibold text-[13px] mb-1">
            {hovered.dow}, May {hovered.day}
            {hovered.isHoliday && <span className="ml-2 text-chili-light">({hovered.holidayName})</span>}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-white/60">Revenue</p>
              <p className="font-medium text-padma-green-pale">{fmtDollars(hovered.revenue)}</p>
            </div>
            <div>
              <p className="text-white/60">Orders</p>
              <p className="font-medium">{hovered.orders}</p>
            </div>
            <div>
              <p className="text-white/60">Tips</p>
              <p className="font-medium text-gold-light">{fmtDollars(hovered.tips)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
