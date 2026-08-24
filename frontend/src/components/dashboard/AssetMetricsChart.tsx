import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import type { MetricPoint } from "../../types/metrics";

interface AssetMetricsChartProps {
  title: string;
  data: MetricPoint[];
}

export default function AssetMetricsChart({
  title,
  data,
}: AssetMetricsChartProps) {
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp * 1000).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    ),
    value: point.value,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Last 1 hour
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
            />

            <YAxis
  domain={[0, 100]}
  tick={{ fontSize: 12 }}
  tickFormatter={(value) => `${value}%`}
/>

            <Tooltip
  formatter={(value) => [
    `${Number(value).toFixed(1)}%`,
    "Usage",
  ]}
/>

            <Line
              type="monotone"
              dataKey="value"
              stroke="currentColor"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}