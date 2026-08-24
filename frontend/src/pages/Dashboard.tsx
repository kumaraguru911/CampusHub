import { useQueries, useQuery } from "@tanstack/react-query";

import StatCard from "../components/dashboard/StatCard";
import HealthOverview from "../components/dashboard/HealthOverview";
import AssetMonitoringCard from "../components/dashboard/AssetMonitoringCard";

import {
  getBuildings,
  getRooms,
  getAssets,
  getAssetMetrics,
} from "../lib/api";

import type { AssetMetrics } from "../types/metrics";

interface Asset {
  id: number;
  asset_tag: string;
  monitoring_enabled: boolean;
}

export default function Dashboard() {
  const buildingsQuery = useQuery({
    queryKey: ["buildings"],
    queryFn: getBuildings,
  });

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const assetsQuery = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: getAssets,
  });

  const buildings = buildingsQuery.data ?? [];
  const rooms = roomsQuery.data ?? [];
  const assets = assetsQuery.data ?? [];

  const monitoredAssets = assets.filter(
    (asset) => asset.monitoring_enabled,
  );

  const metricsQueries = useQueries({
    queries: monitoredAssets.map((asset) => ({
      queryKey: ["asset-metrics", asset.id],
      queryFn: () => getAssetMetrics(asset.id) as Promise<AssetMetrics>,
      refetchInterval: 15000,
    })),
  });

  const isLoading =
    buildingsQuery.isLoading ||
    roomsQuery.isLoading ||
    assetsQuery.isLoading;

  const hasError =
    buildingsQuery.isError ||
    roomsQuery.isError ||
    assetsQuery.isError;

  if (isLoading) {
    return (
      <main className="p-8">
        <p className="text-sm text-slate-500">
          Loading CampusHub...
        </p>
      </main>
    );
  }

  if (hasError) {
    return (
      <main className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-800">
            Unable to connect to CampusHub API.
          </p>

          <p className="mt-1 text-sm text-red-600">
            Make sure the FastAPI backend is running on port 8000.
          </p>
        </div>
      </main>
    );
  }

  const metrics = metricsQueries
    .map((query) => query.data)
    .filter(
      (metric): metric is AssetMetrics =>
        metric !== undefined,
    );

  const healthy = metrics.filter(
    (metric) => metric.health === "healthy",
  ).length;

  const warning = metrics.filter(
    (metric) => metric.health === "warning",
  ).length;

  const critical = metrics.filter(
    (metric) => metric.health === "critical",
  ).length;

  return (
    <main className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Overview
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor your campus infrastructure from one place.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <StatCard
          title="Buildings"
          value={buildings.length}
          description="Registered buildings"
        />

        <StatCard
          title="Rooms"
          value={rooms.length}
          description="Managed rooms"
        />

        <StatCard
          title="Assets"
          value={assets.length}
          description={`${monitoredAssets.length} currently monitored`}
        />
      </div>

      <HealthOverview
        healthy={healthy}
        warning={warning}
        critical={critical}
      />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Monitored Infrastructure
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Live health and resource utilization.
          </p>
        </div>

        {monitoredAssets.map((asset) => (
          <AssetMonitoringCard
            key={asset.id}
            assetId={asset.id}
            assetTag={asset.asset_tag}
          />
        ))}
      </div>
    </main>
  );
}