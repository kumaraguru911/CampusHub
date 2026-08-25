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
import type { MetricsRange } from "../../lib/api";

interface AssetMetricsChartProps {
  title: string;
  data: MetricPoint[];
  range: MetricsRange;
  onRangeChange: (range: MetricsRange) => void;
}

const ranges: {
  label: string;
  value: MetricsRange;
}[] = [
  {
    label: "1H",
    value: "1h",
  },
  {
    label: "6H",
    value: "6h",
  },
  {
    label: "24H",
    value: "24h",
  },
  {
    label: "7D",
    value: "7d",
  },
];

function formatTimestamp(
  timestamp: number,
  range: MetricsRange,
) {
  const date = new Date(timestamp * 1000);

  if (range === "7d") {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }

  if (range === "24h") {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AssetMetricsChart({
  title,
  data,
  range,
  onRangeChange,
}: AssetMetricsChartProps) {
  const chartData = data.map((point) => ({
    time: formatTimestamp(point.timestamp, range),
    value: point.value,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Infrastructure utilization
          </p>
        </div>

        <div className="flex shrink-0 rounded-lg border border-slate-200 p-1">
          {ranges.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onRangeChange(item.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                range === item.value
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-400">
              No historical data available.
            </p>
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="time"
                tick={{
                  fontSize: 12,
                }}
              />

              <YAxis
                domain={[0, 100]}
                tick={{
                  fontSize: 12,
                }}
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
        )}
      </div>
    </div>
  );
}