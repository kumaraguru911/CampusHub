import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Activity,
  Server,
  Target,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  getAsset,
  getAssetMetrics,
} from "../lib/api";

import type { AssetMetrics } from "../types/metrics";

import AssetMonitoringCard from "../components/dashboard/AssetMonitoringCard";

interface Asset {
  id: number;
  asset_tag: string;
  name?: string;
  asset_type?: string;
  monitoring_enabled: boolean;
  monitoring_target?: string | null;
}

export default function AssetDetail() {
  const { assetId } = useParams();

  const id = Number(assetId);

  const assetQuery = useQuery<Asset>({
    queryKey: ["asset", id],
    queryFn: () => getAsset(id),
    enabled: Number.isFinite(id),
  });

  const metricsQuery = useQuery<AssetMetrics>({
    queryKey: ["asset-metrics", id],
    queryFn: () => getAssetMetrics(id),
    enabled:
      Number.isFinite(id) &&
      !!assetQuery.data?.monitoring_enabled,
    refetchInterval: 15000,
  });

  if (assetQuery.isLoading) {
    return (
      <main className="p-8">
        <p className="text-sm text-slate-500">
          Loading asset...
        </p>
      </main>
    );
  }

  if (assetQuery.isError || !assetQuery.data) {
    return (
      <main className="space-y-4 p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="font-semibold text-red-900">
            Asset not found
          </h1>

          <p className="mt-1 text-sm text-red-700">
            The requested asset could not be loaded.
          </p>
        </div>
      </main>
    );
  }

  const asset = assetQuery.data;

  return (
    <main className="space-y-6 p-8">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Infrastructure Asset
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {asset.asset_tag}
          </h1>

          {asset.name && (
            <p className="mt-1 text-sm text-slate-500">
              {asset.name}
            </p>
          )}
        </div>

        {metricsQuery.data && (
          <HealthBadge
            health={metricsQuery.data.health}
          />
        )}
      </div>

      {/* Asset information */}
      <div className="grid gap-5 md:grid-cols-3">
        <InfoCard
          icon={<Server size={18} />}
          label="Asset Type"
          value={asset.asset_type ?? "Infrastructure"}
        />

        <InfoCard
          icon={<Activity size={18} />}
          label="Monitoring"
          value={
            asset.monitoring_enabled
              ? "Enabled"
              : "Disabled"
          }
        />

        <InfoCard
          icon={<Target size={18} />}
          label="Monitoring Target"
          value={
            asset.monitoring_target ??
            "Not configured"
          }
        />
      </div>

      {/* Monitoring */}
      {asset.monitoring_enabled ? (
        <AssetMonitoringCard
          assetId={asset.id}
          assetTag={asset.asset_tag}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Monitoring Disabled
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enable monitoring for this asset to
            collect infrastructure metrics.
          </p>
        </div>
      )}
    </main>
  );
}

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoCard({
  icon,
  label,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-sm">
          {label}
        </span>
      </div>

      <p className="mt-3 break-all text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function HealthBadge({
  health,
}: {
  health: AssetMetrics["health"];
}) {
  const classes = {
    healthy:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning:
      "border-amber-200 bg-amber-50 text-amber-700",
    critical:
      "border-red-200 bg-red-50 text-red-700",
    unknown:
      "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <span
      className={`rounded-full border px-4 py-2 text-sm font-semibold uppercase ${classes[health]}`}
    >
      {health}
    </span>
  );
}