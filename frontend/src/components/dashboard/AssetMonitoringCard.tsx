import { useQuery } from "@tanstack/react-query";
import {
  Cpu,
  HardDrive,
  MemoryStick,
  Clock,
} from "lucide-react";

import {
  getAssetMetrics,
  getAssetMetricsHistory,
} from "../../lib/api";

import type {
  AssetMetrics,
  AssetMetricsHistory,
} from "../../types/metrics";

import AssetMetricsChart from "./AssetMetricsChart";

interface AssetMonitoringCardProps {
  assetId: number;
  assetTag: string;
}

function formatUptime(seconds: number | null) {
  if (seconds === null) {
    return "Unknown";
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function getHealthClasses(
  health: AssetMetrics["health"],
) {
  switch (health) {
    case "healthy":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "warning":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "critical":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

export default function AssetMonitoringCard({
  assetId,
  assetTag,
}: AssetMonitoringCardProps) {
  const metricsQuery = useQuery<AssetMetrics>({
    queryKey: ["asset-metrics", assetId],
    queryFn: () => getAssetMetrics(assetId),
    refetchInterval: 15000,
  });

  const historyQuery = useQuery<AssetMetricsHistory>({
    queryKey: ["asset-metrics-history", assetId],
    queryFn: () => getAssetMetricsHistory(assetId),
    refetchInterval: 60000,
  });

  if (metricsQuery.isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">
          Loading {assetTag} metrics...
        </p>
      </div>
    );
  }

  if (metricsQuery.isError || !metricsQuery.data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-medium text-red-800">
          Unable to load {assetTag} metrics.
        </p>

        <p className="mt-1 text-sm text-red-600">
          Check the monitoring target and Prometheus.
        </p>
      </div>
    );
  }

  const data = metricsQuery.data;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      {/* Asset header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Monitored Asset
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {data.asset_tag}
          </h2>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getHealthClasses(
            data.health,
          )}`}
        >
          {data.health}
        </span>
      </div>

      {/* Current metrics */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <Metric
          icon={<Cpu size={18} />}
          label="CPU"
          value={data.cpu_percent}
          suffix="%"
        />

        <Metric
          icon={<MemoryStick size={18} />}
          label="Memory"
          value={data.memory_percent}
          suffix="%"
        />

        <Metric
          icon={<HardDrive size={18} />}
          label="Disk"
          value={data.disk_percent}
          suffix="%"
        />

        <div className="rounded-lg bg-slate-50 p-4">
          <Clock size={18} className="text-slate-500" />

          <p className="mt-3 text-xs text-slate-500">
            Uptime
          </p>

          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatUptime(data.uptime_seconds)}
          </p>
        </div>
      </div>

      {/* Historical metrics */}
      <div className="mt-6">
        {historyQuery.isLoading && (
          <div className="rounded-lg border border-slate-200 p-6">
            <p className="text-sm text-slate-500">
              Loading historical metrics...
            </p>
          </div>
        )}

        {historyQuery.isError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">
              Historical metrics are currently unavailable.
            </p>
          </div>
        )}

        {historyQuery.data && (
  <div className="grid gap-6 lg:grid-cols-2">
    <AssetMetricsChart
      title="CPU Usage"
      data={historyQuery.data.cpu}
    />

    <AssetMetricsChart
      title="Memory Usage"
      data={historyQuery.data.memory}
    />

    <AssetMetricsChart
      title="Disk Usage"
      data={historyQuery.data.disk}
    />
  </div>
)}
      </div>
    </div>
  );
}

interface MetricProps {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  suffix: string;
}

function Metric({
  icon,
  label,
  value,
  suffix,
}: MetricProps) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <div className="text-slate-500">
        {icon}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-900">
        {value !== null
          ? `${value.toFixed(1)}${suffix}`
          : "N/A"}
      </p>
    </div>
  );
}