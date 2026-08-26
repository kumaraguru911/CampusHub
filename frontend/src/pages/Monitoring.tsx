import { useQueries } from "@tanstack/react-query";
import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
} from "lucide-react";

import {
  getAssets,
  getAssetMetrics,
} from "../lib/api";

import type {
  Asset,
} from "../lib/api";

interface AssetMetrics {
  asset_id: number;
  asset_tag: string;
  health: "healthy" | "warning" | "critical" | string;
  cpu_percent: number | null;
  memory_percent: number | null;
  disk_percent: number | null;
  uptime_seconds: number | null;
}

function getHealthClasses(
  health: AssetMetrics["health"],
) {
  switch (health) {
    case "healthy":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "critical":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function formatUptime(seconds: number | null) {
  if (seconds === null) {
    return "Unknown";
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(
    (seconds % 86400) / 3600,
  );
  const minutes = Math.floor(
    (seconds % 3600) / 60,
  );

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export default function Monitoring() {
  const assetsQuery = useQueries({
    queries: [
      {
        queryKey: ["monitoring-assets"],
        queryFn: getAssets,
        refetchInterval: 15000,
      },
    ],
  });

  const assets = assetsQuery[0].data as
    | Asset[]
    | undefined;

  const metricsQueries = useQueries({
    queries: (assets ?? [])
      .filter(
        (asset) => asset.monitoring_enabled,
      )
      .map((asset) => ({
        queryKey: [
          "monitoring-metrics",
          asset.id,
        ],
        queryFn: () =>
          getAssetMetrics(asset.id),
        refetchInterval: 15000,
      })),
  });

  const isLoading =
    assetsQuery[0].isLoading ||
    metricsQueries.some(
      (query) => query.isLoading,
    );

  if (isLoading) {
    return (
      <main className="p-8">
        <p className="text-sm text-slate-500">
          Loading monitoring data...
        </p>
      </main>
    );
  }

  const monitoredAssets =
    assets?.filter(
      (asset) => asset.monitoring_enabled,
    ) ?? [];

  const metrics =
    metricsQueries
      .map((query) => query.data as AssetMetrics)
      .filter(Boolean);

  const healthyCount = metrics.filter(
    (item) => item.health === "healthy",
  ).length;

  const warningCount = metrics.filter(
    (item) => item.health === "warning",
  ).length;

  const criticalCount = metrics.filter(
    (item) => item.health === "critical",
  ).length;

  return (
    <main className="space-y-6 p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <Activity
            size={26}
            className="text-slate-700"
          />

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Monitoring
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Live infrastructure health and performance.
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          label="Monitored Assets"
          value={monitoredAssets.length}
        />

        <SummaryCard
          label="Healthy"
          value={healthyCount}
          valueClass="text-emerald-600"
        />

        <SummaryCard
          label="Warning"
          value={warningCount}
          valueClass="text-amber-600"
        />

        <SummaryCard
          label="Critical"
          value={criticalCount}
          valueClass="text-red-600"
        />
      </div>

      {/* Assets */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Monitored Assets
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Live metrics from Prometheus.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Asset
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Health
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  CPU
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Memory
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Disk
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Uptime
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {metrics.map((item) => (
                <tr
                  key={item.asset_id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <Monitor
                          size={18}
                          className="text-slate-600"
                        />
                      </div>

                      <div>
                        <p className="font-medium text-slate-900">
                          {item.asset_tag}
                        </p>

                        <p className="text-xs text-slate-500">
                          Asset #{item.asset_id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getHealthClasses(
                        item.health,
                      )}`}
                    >
                      {item.health}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <MetricValue
                      icon={<Cpu size={15} />}
                      value={item.cpu_percent}
                    />
                  </td>

                  <td className="px-6 py-4">
                    <MetricValue
                      icon={
                        <MemoryStick size={15} />
                      }
                      value={item.memory_percent}
                    />
                  </td>

                  <td className="px-6 py-4">
                    <MetricValue
                      icon={
                        <HardDrive size={15} />
                      }
                      value={item.disk_percent}
                    />
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatUptime(
                      item.uptime_seconds,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {metrics.length === 0 && (
            <div className="p-10 text-center">
              <Activity
                size={32}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm text-slate-500">
                No monitored assets available.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  valueClass?: string;
}

function SummaryCard({
  label,
  value,
  valueClass = "text-slate-900",
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

interface MetricValueProps {
  icon: React.ReactNode;
  value: number | null;
}

function MetricValue({
  icon,
  value,
}: MetricValueProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      {icon}

      <span>
        {value !== null
          ? `${value.toFixed(1)}%`
          : "N/A"}
      </span>
    </div>
  );
}