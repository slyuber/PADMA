import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import {
  completedOrders, filterByChannel, filterByDate,
  getOrderItems,
} from "./data";
import type { Order, OrderItem, Metric, Channel } from "./types";

interface Filters {
  channel: Channel;
  setChannel: (c: Channel) => void;
  selectedDate: string | null;
  setSelectedDate: (d: string | null) => void;
  metric: Metric;
  setMetric: (m: Metric) => void;
  orders: Order[];
  items: OrderItem[];
}

const Ctx = createContext<Filters | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [channel, setChannel] = useState<Channel>("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>("revenue");

  const orders = useMemo(() => {
    let o = filterByChannel(completedOrders, channel);
    o = filterByDate(o, selectedDate);
    return o;
  }, [channel, selectedDate]);

  const items = useMemo(() => getOrderItems(orders), [orders]);

  return (
    <Ctx.Provider value={{ channel, setChannel, selectedDate, setSelectedDate, metric, setMetric, orders, items }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFilters must be inside FilterProvider");
  return ctx;
}
