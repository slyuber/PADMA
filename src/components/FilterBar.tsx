import { useFilters } from "@/lib/FilterContext";
import { CHANNELS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { BarChart3, Hash } from "lucide-react";

export function FilterBar() {
  const { channel, setChannel, metric, setMetric, selectedDate, setSelectedDate } = useFilters();

  return (
    <div className="sticky top-0 z-40 bg-rice/90 backdrop-blur-sm border-b border-rule">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-2.5 flex items-center gap-3 flex-wrap text-sm">
        {/* Channel */}
        <div className="flex rounded-md border border-rule overflow-hidden">
          {CHANNELS.map((c) => (
            <button
              key={c.value}
              onClick={() => setChannel(c.value)}
              className={cn(
                "px-3 py-1 text-xs font-medium transition-colors",
                channel === c.value
                  ? "bg-padma-green text-white"
                  : "bg-white text-charcoal-muted hover:bg-padma-green-pale"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Metric toggle */}
        <div className="flex rounded-md border border-rule overflow-hidden">
          <button
            onClick={() => setMetric("revenue")}
            className={cn(
              "px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1",
              metric === "revenue"
                ? "bg-gold text-white"
                : "bg-white text-charcoal-muted hover:bg-gold-pale"
            )}
          >
            <BarChart3 size={12} /> Revenue
          </button>
          <button
            onClick={() => setMetric("quantity")}
            className={cn(
              "px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1",
              metric === "quantity"
                ? "bg-jade text-white"
                : "bg-white text-charcoal-muted hover:bg-jade-pale"
            )}
          >
            <Hash size={12} /> Quantity
          </button>
        </div>

        {/* Date clear */}
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(null)}
            className="text-xs text-chili hover:underline"
          >
            Clear date filter: {selectedDate}
          </button>
        )}
      </div>
    </div>
  );
}
