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
  TrendingUp, Flame, Coffee, UtensilsCrossed, Users, Clock,
} from "lucide-react";

export function ExecutiveSummary() {
  const { orders, items } = useFilters();

  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const netSales = orders.reduce((s, o) => s + o.subtotal, 0);
    const avgTicket = orders.length ? revenue / orders.length : 0;
    const tips = orders.reduce((s, o) => s + o.tip, 0);
    const totalGuests = orders.reduce((s, o) => s + o.party_size, 0);

    const byDate: Record<string, { rev: number; count: number; tips: number; guests: number }> = {};
    for (const o of orders) {
      const d = o.order_date;
      if (!byDate[d]) byDate[d] = { rev: 0, count: 0, tips: 0, guests: 0 };
      byDate[d].rev += o.total;
      byDate[d].count += 1;
      byDate[d].tips += o.tip;
      byDate[d].guests += o.party_size;
    }

    const dates = Object.keys(byDate).sort();
    const dailyData = dates.map((d) => ({
      date: d,
      day: new Date(d + "T12:00:00").getDate(),
      revenue: Math.round(byDate[d].rev),
      orders: byDate[d].count,
      tips: Math.round(byDate[d].tips),
      guests: byDate[d].guests,
      isHoliday: d in CALGARY_HOLIDAYS_MAY_2026,
      holidayName: CALGARY_HOLIDAYS_MAY_2026[d] || "",
      dow: new Date(d + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short" }),
    }));

    const bestDay = dailyData.reduce((a, b) => (a.revenue > b.revenue ? a : b), dailyData[0]);
    const worstDay = dailyData.reduce((a, b) => (a.revenue < b.revenue ? a : b), dailyData[0]);

    // Hourly distribution
    const hourCounts: Record<number, { orders: number; rev: number }> = {};
    for (const o of orders) {
      const h = getHour(o);
      if (!hourCounts[h]) hourCounts[h] = { orders: 0, rev: 0 };
      hourCounts[h].orders += 1;
      hourCounts[h].rev += o.total;
    }
    const hourData = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      orders: hourCounts[h]?.orders || 0,
      rev: hourCounts[h]?.rev || 0,
      label: h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`,
    })).filter((h) => h.orders > 0);

    const busiestHour = hourData.reduce((a, b) => (b.orders > a.orders ? b : a), hourData[0]);

    // Top item excluding Sides, Extras, and Lunch Special category
    const itemCounts: Record<string, number> = {};
    for (const i of items) {
      if (["Sides", "Extras", "Lunch Special"].includes(i.category)) continue;
      itemCounts[i.item_name] = (itemCounts[i.item_name] || 0) + i.quantity;
    }
    const topItem = Object.entries(itemCounts).reduce<[string, number]>(
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

    // Money flow
    const grossSales = orders.reduce((s, o) => s + o.subtotal, 0);
    const discounts = orders.reduce((s, o) => s + o.discount_amount, 0);
    const gst = orders.reduce((s, o) => s + o.gst, 0);

    return {
      revenue, netSales, avgTicket, tips, grossSales, discounts, gst,
      orderCount: orders.length, totalGuests,
      bestDay, worstDay, dailyData, hourData, busiestHour,
      topItem,
      dineInCount: dineIn.length, takeoutCount: takeout.length, deliveryCount: delivery.length,
      dineInRev, takeoutRev, deliveryRev,
      weekdayAvg, weekendAvg,
    };
  }, [orders, items]);

  return (
    <section>
      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard icon={<TrendingUp size={16} />} color="text-padma-green" label="Revenue" value={fmtK(stats.revenue)} sub={`${fmt(stats.orderCount)} orders`} />
        <KpiCard icon={<Users size={16} />} color="text-jade" label="Guests" value={fmt(stats.totalGuests)} sub={`~${(stats.totalGuests / 31).toFixed(0)}/day`} />
        <KpiCard icon={<Clock size={16} />} color="text-gold" label="Busiest Hour" value={stats.busiestHour?.label ?? "—"} sub={`${fmt(stats.busiestHour?.orders ?? 0)} orders`} />
        <KpiCard icon={<UtensilsCrossed size={16} />} color="text-chili" label="Top Dish" value={stats.topItem[0]} sub={`${fmt(stats.topItem[1])} sold`} />
        <KpiCard icon={<TrendingUp size={16} />} color="text-padma-green" label="Avg Ticket" value={fmtDollars(stats.avgTicket)} sub="incl. GST + tips" />
        <KpiCard icon={<Coffee size={16} />} color="text-gold" label="Weekend Lift" value={`+${((stats.weekendAvg / stats.weekdayAvg - 1) * 100).toFixed(0)}%`} sub={`${fmtDollars(stats.weekendAvg)}/day`} />
      </div>

      <div className="grid lg:grid-cols-12 gap-6 mb-6">
        {/* Revenue sparkline + best/worst */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-4 bg-white border border-rule rounded-xl p-5"
        >
          <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted mb-2">
            Daily Revenue Trend
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={stats.dailyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#78716c" }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#faf6f0", border: "1px solid #c8d6c0", borderRadius: 6, fontSize: 11 }}
                formatter={(v: number) => [fmtDollars(v), "Revenue"]}
                labelFormatter={(d) => `May ${d}`}
              />
              <Area type="monotone" dataKey="revenue" stroke={CHART_COLORS.green} strokeWidth={1.5} fill="url(#pulseGrad)" animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-rule/50">
            <div>
              <p className="text-[10px] text-charcoal-muted uppercase">Best Day</p>
              <p className="text-sm font-semibold text-padma-green">{stats.bestDay?.dow} {stats.bestDay?.day} — {fmtDollars(stats.bestDay?.revenue ?? 0)}</p>
            </div>
            <div>
              <p className="text-[10px] text-charcoal-muted uppercase">Slowest</p>
              <p className="text-sm font-semibold text-chili">{stats.worstDay?.dow} {stats.worstDay?.day} — {fmtDollars(stats.worstDay?.revenue ?? 0)}</p>
            </div>
          </div>
        </motion.div>

        {/* Calendar Heatmap — traditional grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-5 bg-white border border-rule rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted">
              May 2026
            </p>
            <p className="text-[10px] text-charcoal-muted">click day to filter</p>
          </div>
          <CalendarHeatmap data={stats.dailyData} />
        </motion.div>

        {/* Busiest Hours */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-3 bg-white border border-rule rounded-xl p-5"
        >
          <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted mb-2">
            Orders by Hour
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stats.hourData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: "#78716c" }} interval="preserveStartEnd" />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#faf6f0", border: "1px solid #c8d6c0", borderRadius: 6, fontSize: 11 }}
                formatter={(v: number) => [`${v} orders`, ""]}
              />
              <Bar dataKey="orders" radius={[2, 2, 0, 0]} animationDuration={800}>
                {stats.hourData.map((h) => (
                  <Cell key={h.hour} fill={h.hour === stats.busiestHour?.hour ? CHART_COLORS.green : CHART_COLORS.greenPale} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-charcoal-muted mt-2">
            <span className="font-medium text-padma-green">{stats.busiestHour?.label}</span> peak — {fmtDollars(stats.busiestHour?.rev ?? 0)} in that hour
          </p>
        </motion.div>
      </div>

      {/* Channel + Money mini-strip */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Channel cards */}
        <ChannelCard label="Dine-In" count={stats.dineInCount} rev={stats.dineInRev} total={stats.revenue} color={CHART_COLORS.green} />
        <ChannelCard label="Takeout" count={stats.takeoutCount} rev={stats.takeoutRev} total={stats.revenue} color={CHART_COLORS.gold} />
        <ChannelCard label="Delivery" count={stats.deliveryCount} rev={stats.deliveryRev} total={stats.revenue} color={CHART_COLORS.jade} />
        {/* Money snapshot */}
        <div className="bg-white border border-rule rounded-xl p-4">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted mb-2">Money Flow</p>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between"><span className="text-charcoal-muted">Gross</span><span className="font-medium tabular-nums">{fmtK(stats.grossSales)}</span></div>
            <div className="flex justify-between"><span className="text-charcoal-muted">Discounts</span><span className="font-medium tabular-nums text-chili">({fmtK(stats.discounts)})</span></div>
            <div className="flex justify-between"><span className="text-charcoal-muted">GST collected</span><span className="font-medium tabular-nums text-jade">{fmtK(stats.gst)}</span></div>
            <div className="flex justify-between"><span className="text-charcoal-muted">Tips</span><span className="font-medium tabular-nums text-gold">{fmtK(stats.tips)}</span></div>
            <div className="flex justify-between border-t border-rule/50 pt-1 mt-1"><span className="text-charcoal font-medium">Total In</span><span className="font-semibold tabular-nums">{fmtK(stats.revenue)}</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── KPI Card ────────────────────────────────── */
function KpiCard({ icon, color, label, value, sub }: { icon: React.ReactNode; color: string; label: string; value: string; sub: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-rule rounded-xl p-3"
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-[10px] font-medium text-charcoal-muted uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-semibold text-charcoal leading-tight truncate">{value}</p>
      <p className="text-[10px] text-charcoal-muted mt-0.5 truncate">{sub}</p>
    </motion.div>
  );
}

/* ── Channel Card ────────────────────────────────── */
function ChannelCard({ label, count, rev, total, color }: { label: string; count: number; rev: number; total: number; color: string }) {
  const pct = total > 0 ? (rev / total) * 100 : 0;
  return (
    <div className="bg-white border border-rule rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-charcoal-muted">{label}</p>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color }}>{pct.toFixed(0)}%</span>
      </div>
      <p className="text-lg font-semibold text-charcoal tabular-nums">{fmtK(rev)}</p>
      <div className="h-1.5 rounded-full bg-rice-dark overflow-hidden mt-2">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <p className="text-[10px] text-charcoal-muted mt-1">{fmt(count)} orders</p>
    </div>
  );
}

/* ── Calendar Heatmap (traditional grid) ────────────────────────────────── */
function CalendarHeatmap({
  data,
}: {
  data: { date: string; day: number; revenue: number; orders: number; tips: number; guests: number; dow: string; isHoliday: boolean; holidayName: string }[];
}) {
  const { setSelectedDate } = useFilters();
  const [hovered, setHovered] = useState<typeof data[number] | null>(null);
  const maxRev = Math.max(...data.map((d) => d.revenue));
  const minRev = Math.min(...data.map((d) => d.revenue));

  // Build traditional calendar grid: rows = weeks, cols = Sun-Sat
  const firstDow = new Date(data[0]?.date + "T12:00:00").getDay();
  const rows: (typeof data[number] | null)[][] = [];
  let row: (typeof data[number] | null)[] = new Array(firstDow).fill(null);

  for (const d of data) {
    row.push(d);
    if (row.length === 7) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length) {
    while (row.length < 7) row.push(null);
    rows.push(row);
  }

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getColor = (rev: number) => {
    const t = (rev - minRev) / (maxRev - minRev || 1);
    if (t > 0.8) return { bg: "bg-padma-green", text: "text-white" };
    if (t > 0.6) return { bg: "bg-padma-green-light", text: "text-white" };
    if (t > 0.4) return { bg: "bg-padma-green-pale", text: "text-charcoal" };
    if (t > 0.2) return { bg: "bg-rice-darker", text: "text-charcoal-light" };
    return { bg: "bg-rice-dark", text: "text-charcoal-muted" };
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map((l) => (
          <div key={l} className="text-center text-[10px] font-medium text-charcoal-muted py-1">{l}</div>
        ))}
      </div>
      {/* Weeks */}
      {rows.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
          {week.map((d, di) => {
            if (!d) return <div key={`e-${wi}-${di}`} className="aspect-square rounded-lg" />;
            const c = getColor(d.revenue);
            return (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                onMouseEnter={() => setHovered(d)}
                onMouseLeave={() => setHovered(null)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all hover:scale-105 hover:shadow-md ${c.bg} ${c.text} ${d.isHoliday ? "ring-2 ring-chili/50" : ""}`}
              >
                <span className="text-sm font-semibold leading-none">{d.day}</span>
                <span className="text-[8px] opacity-75 leading-none mt-0.5">{fmtK(d.revenue).replace("$", "")}</span>
              </button>
            );
          })}
        </div>
      ))}
      {/* Legend */}
      <div className="flex items-center gap-2 mt-2 text-[10px] text-charcoal-muted">
        <span>Low</span>
        {["bg-rice-dark", "bg-rice-darker", "bg-padma-green-pale", "bg-padma-green-light", "bg-padma-green"].map((c) => (
          <div key={c} className={`w-4 h-3 rounded-sm ${c}`} />
        ))}
        <span>High</span>
        {data.some((d) => d.isHoliday) && (
          <span className="ml-2 flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm ring-2 ring-chili/50" /> Holiday
          </span>
        )}
      </div>
      {/* Hover tooltip */}
      {hovered && (
        <div className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-charcoal text-white rounded-lg px-4 py-3 shadow-lg text-[11px] whitespace-nowrap pointer-events-none">
          <p className="font-semibold text-[13px] mb-1">
            {hovered.dow}, May {hovered.day}
            {hovered.isHoliday && <span className="ml-2 text-chili-light">({hovered.holidayName})</span>}
          </p>
          <div className="grid grid-cols-4 gap-3">
            <div><p className="text-white/60">Revenue</p><p className="font-medium text-padma-green-pale">{fmtDollars(hovered.revenue)}</p></div>
            <div><p className="text-white/60">Orders</p><p className="font-medium">{hovered.orders}</p></div>
            <div><p className="text-white/60">Guests</p><p className="font-medium">{hovered.guests}</p></div>
            <div><p className="text-white/60">Tips</p><p className="font-medium text-gold-light">{fmtDollars(hovered.tips)}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
