import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  HardDrive,
  MemoryStick,
} from "lucide-react";

import {
  getAlerts,
  resolveAlert,
  type Alert,
} from "../lib/api";

function getSeverityClasses(
  severity: Alert["severity"],
) {
  switch (severity) {
    case "CRITICAL":
      return "border-red-200 bg-red-50 text-red-700";

    case "WARNING":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getMetricIcon(metric: string) {
  switch (metric) {
    case "cpu":
      return <Cpu size={18} />;

    case "memory":
      return <MemoryStick size={18} />;

    case "disk":
      return <HardDrive size={18} />;

    default:
      return <AlertTriangle size={18} />;
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

export default function Alerts() {
  const queryClient = useQueryClient();

  const {
    data: alerts = [],
    isLoading,
    isError,
  } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: getAlerts,
    refetchInterval: 15000,
  });

  const resolveMutation = useMutation({
    mutationFn: resolveAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["alerts"],
      });
    },
  });

  const activeAlerts = alerts.filter(
    (alert) => alert.status === "ACTIVE",
  );

  const resolvedAlerts = alerts.filter(
    (alert) => alert.status === "RESOLVED",
  );

  if (isLoading) {
    return (
      <main className="p-8">
        <p className="text-sm text-slate-500">
          Loading alerts...
        </p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-medium text-red-800">
            Unable to load alerts.
          </p>

          <p className="mt-1 text-sm text-red-600">
            Check that the CampusHub backend is running.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <AlertTriangle
            size={26}
            className="text-slate-700"
          />

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Alerts
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Infrastructure alerts and system events.
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard
          icon={
            <AlertTriangle
              size={20}
              className="text-amber-600"
            />
          }
          label="Active Alerts"
          value={activeAlerts.length}
        />

        <SummaryCard
          icon={
            <CheckCircle2
              size={20}
              className="text-emerald-600"
            />
          }
          label="Resolved Alerts"
          value={resolvedAlerts.length}
        />
      </div>

      {/* Active alerts */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Active Alerts
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Alerts currently requiring attention.
          </p>
        </div>

        {activeAlerts.length === 0 ? (
          <EmptyState
            icon={
              <CheckCircle2
                size={32}
                className="text-emerald-500"
              />
            }
            message="No active alerts."
          />
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onResolve={() =>
                  resolveMutation.mutate(alert.id)
                }
                isResolving={
                  resolveMutation.isPending &&
                  resolveMutation.variables === alert.id
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Alert History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Previously triggered alerts.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Alert
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Severity
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Resolved
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {resolvedAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        {getMetricIcon(alert.metric)}
                      </div>

                      <div>
                        <p className="font-medium text-slate-900">
                          {alert.message}
                        </p>

                        <p className="text-xs text-slate-500">
                          Asset #{alert.asset_id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getSeverityClasses(
                        alert.severity,
                      )}`}
                    >
                      {alert.severity}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                      <CheckCircle2 size={15} />
                      Resolved
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(alert.created_at)}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(alert.resolved_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {resolvedAlerts.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              No alert history yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function SummaryCard({
  icon,
  label,
  value,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
          {icon}
        </div>

        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

interface AlertCardProps {
  alert: Alert;
  onResolve: () => void;
  isResolving: boolean;
}

function AlertCard({
  alert,
  onResolve,
  isResolving,
}: AlertCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
            {getMetricIcon(alert.metric)}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">
                {alert.metric.toUpperCase()} Alert
              </h3>

              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getSeverityClasses(
                  alert.severity,
                )}`}
              >
                {alert.severity}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-600">
              {alert.message}
            </p>

            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <span>
                Value:{" "}
                <strong className="text-slate-700">
                  {alert.value.toFixed(1)}%
                </strong>
              </span>

              <span>
                Threshold:{" "}
                <strong className="text-slate-700">
                  {alert.threshold.toFixed(1)}%
                </strong>
              </span>

              <span className="flex items-center gap-1">
                <Clock size={13} />
                {formatDate(alert.created_at)}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onResolve}
          disabled={isResolving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResolving ? "Resolving..." : "Resolve"}
        </button>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
}

function EmptyState({
  icon,
  message,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
      <div className="flex justify-center">
        {icon}
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}
