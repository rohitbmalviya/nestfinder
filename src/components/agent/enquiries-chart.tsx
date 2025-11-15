"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { EnquiriesSeriesPoint } from "@/lib/actions/agent";

interface EnquiriesChartProps {
  data: EnquiriesSeriesPoint[];
}

export function EnquiriesChart({ data }: EnquiriesChartProps) {
  const chartData = data.map((d) => ({
    date: format(parseISO(d.date), "dd MMM"),
    count: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart
        data={chartData}
        margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="enquiriesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="oklch(0.30 0.10 242)"
              stopOpacity={0.25}
            />
            <stop
              offset="95%"
              stopColor="oklch(0.30 0.10 242)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="oklch(0.888 0.012 242 / 50%)"
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "oklch(0.48 0.02 242)" }}
          tickLine={false}
          axisLine={false}
          interval={Math.floor(data.length / 6)}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "oklch(0.48 0.02 242)" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={30}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "oklch(1 0 0)",
            border: "1px solid oklch(0.888 0.012 242)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value) => [Number(value ?? 0), "Enquiries"]}
          labelStyle={{ fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="oklch(0.30 0.10 242)"
          strokeWidth={2}
          fill="url(#enquiriesGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "oklch(0.30 0.10 242)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
