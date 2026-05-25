import { useMemo } from "react";
import { useFilters } from "@/lib/FilterContext";
import { fmtDollars, fmt, fmtPct, CHART_COLORS } from "@/lib/utils";
import { SectionHeader } from "../SectionHeader";
import {
  Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, XAxis, YAxis,
} from "recharts";

export function MoneyIn() {
  const { orders } = useFilters();

  const stats = useMemo(() => {
    const grossSales = orders.reduce((s, o) => s + o.subtotal, 0);
    const discounts = orders.reduce((s, o) => s + o.discount_amount, 0);
    const netSales = grossSales - discounts;
    const gstCollected = orders.reduce((s, o) => s + o.gst, 0);
    const tips = orders.reduce((s, o) => s + o.tip, 0);
    const totalCollected = orders.reduce((s, o) => s + o.total, 0);

    const effectiveGstRate = netSales > 0 ? gstCollected / netSales : 0;

    const byMethod: Record<string, { count: number; total: number }> = {};
    for (const o of orders) {
      const m = o.payment_method;
      if (!byMethod[m]) byMethod[m] = { count: 0, total: 0 };
      byMethod[m].count += 1;
      byMethod[m].total += o.total;
    }
    const paymentBreakdown = Object.entries(byMethod)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total);

    const byChannel: Record<string, { count: number; rev: number; tips: number; gst: number }> = {};
    for (const o of orders) {
      const ch = o.order_type === "dine_in" ? "Dine-In" : o.order_type === "takeout" ? "Takeout" : "Delivery";
      if (!byChannel[ch]) byChannel[ch] = { count: 0, rev: 0, tips: 0, gst: 0 };
      byChannel[ch].count += 1;
      byChannel[ch].rev += o.subtotal;
      byChannel[ch].tips += o.tip;
      byChannel[ch].gst += o.gst;
    }
    const channelData = Object.entries(byChannel)
      .map(([name, v]) => ({
        name,
        revenue: Math.round(v.rev),
        tips: Math.round(v.tips),
        gst: Math.round(v.gst),
        avgTicket: v.count > 0 ? v.rev / v.count : 0,
        tipRate: v.rev > 0 ? v.tips / v.rev : 0,
        count: v.count,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const dineInTipOrders = orders.filter((o) => o.order_type === "dine_in" && o.tip > 0);
    const avgDineInTipPct = dineInTipOrders.length
      ? dineInTipOrders.reduce((s, o) => s + (o.subtotal > 0 ? o.tip / o.subtotal : 0), 0) / dineInTipOrders.length
      : 0;

    const byDate: Record<string, number> = {};
    for (const o of orders) {
      byDate[o.order_date] = (byDate[o.order_date] || 0) + o.gst;
    }
    const dailyGst = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, gst]) => ({ day: new Date(date + "T12:00:00").getDate(), gst: Math.round(gst * 100) / 100 }));

    return {
      grossSales, discounts, netSales, gstCollected, tips, totalCollected,
      effectiveGstRate, paymentBreakdown, channelData, avgDineInTipPct, dailyGst,
    };
  }, [orders]);

  const methodColors: Record<string, string> = {
    Credit: CHART_COLORS.gold,
    Debit: CHART_COLORS.jade,
    Cash: CHART_COLORS.green,
    Mobile: CHART_COLORS.greenLight,
  };

  const waterfall = [
    { name: "Gross Sales", value: Math.round(stats.grossSales), fill: CHART_COLORS.green },
    { name: "Discounts", value: -Math.round(stats.discounts), fill: CHART_COLORS.chili },
    { name: "Net Sales", value: Math.round(stats.netSales), fill: CHART_COLORS.greenLight },
    { name: "GST Collected", value: Math.round(stats.gstCollected), fill: CHART_COLORS.jade },
    { name: "Tips", value: Math.round(stats.tips), fill: CHART_COLORS.gold },
    { name: "Total In", value: Math.round(stats.totalCollected), fill: CHART_COLORS.charcoal },
  ];

  return (
    <section>
      <SectionHeader number={5} title="Money In / Money Kept" question="Where does the money go?" />

      {/* Money waterfall */}
      <div className="grid lg:grid-cols-6 gap-3 mb-6">
        {waterfall.map((w) => (
          <div key={w.name} className="bg-white border border-rule rounded-lg p-3 text-center">
            <p className="text-[10px] font-medium text-charcoal-muted uppercase tracking-wide mb-1">
              {w.name}
            </p>
            <p className="text-lg font-semibold tabular-nums" style={{ color: w.fill }}>
              {w.value < 0 ? `(${fmtDollars(Math.abs(w.value))})` : fmtDollars(w.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* GST section */}
        <div className="bg-white border border-rule rounded-lg p-4">
          <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wide mb-1">
            May GST Collected
          </p>
          <p className="text-2xl font-semibold text-jade tabular-nums mb-1">
            {fmtDollars(stats.gstCollected)}
          </p>
          <p className="text-[11px] text-charcoal-muted mb-3">
            Effective rate: {fmtPct(stats.effectiveGstRate)} on net sales &middot; GST reserve before ITCs
          </p>
          <p className="text-[11px] text-charcoal-muted italic mb-3">
            Directional estimate, not tax advice. Actual remittance depends on input tax credits.
          </p>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={stats.dailyGst} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="gstGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.jade} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.jade} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#78716c" }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#faf6f0", border: "1px solid #c8d6c0", borderRadius: 6, fontSize: 11 }}
                formatter={(v: number) => [fmtDollars(v), "GST"]}
                labelFormatter={(d) => `May ${d}`}
              />
              <Area type="monotone" dataKey="gst" stroke={CHART_COLORS.jade} fill="url(#gstGrad)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment methods */}
        <div className="bg-white border border-rule rounded-lg p-4">
          <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wide mb-3">
            Payment Methods
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={stats.paymentBreakdown}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                animationDuration={800}
              >
                {stats.paymentBreakdown.map((p) => (
                  <Cell key={p.name} fill={methodColors[p.name] || "#a8a29e"} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#faf6f0", border: "1px solid #c8d6c0", borderRadius: 6, fontSize: 12 }}
                formatter={(v: number) => [fmtDollars(v), ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-1">
            {stats.paymentBreakdown.map((p) => (
              <div key={p.name} className="flex items-center gap-1 text-[11px] text-charcoal-muted">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: methodColors[p.name] || "#a8a29e" }} />
                {p.name} ({fmt(p.count)})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Channel comparison */}
      <div className="bg-white border border-rule rounded-lg p-4">
        <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-wide mb-3">
          Channel Breakdown
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {stats.channelData.map((ch) => (
            <div key={ch.name} className="border border-rule/50 rounded-lg p-3">
              <p className="text-sm font-semibold text-charcoal mb-2">{ch.name}</p>
              <div className="space-y-1 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Orders</span>
                  <span className="font-medium tabular-nums">{fmt(ch.count)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Revenue</span>
                  <span className="font-medium tabular-nums text-gold">{fmtDollars(ch.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Avg Ticket</span>
                  <span className="font-medium tabular-nums">{fmtDollars(ch.avgTicket)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Tips</span>
                  <span className="font-medium tabular-nums text-padma-green">{fmtDollars(ch.tips)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Tip Rate</span>
                  <span className="font-medium tabular-nums">{fmtPct(ch.tipRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">GST</span>
                  <span className="font-medium tabular-nums text-jade">{fmtDollars(ch.gst)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-charcoal-muted italic mt-3">
          Delivery tips are not tracked in POS — they flow through third-party platforms.
          Dine-in tipping orders averaged {fmtPct(stats.avgDineInTipPct)} on subtotal.
        </p>
      </div>
    </section>
  );
}
