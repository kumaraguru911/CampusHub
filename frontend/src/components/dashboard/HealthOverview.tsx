interface HealthOverviewProps {
  healthy: number;
  warning: number;
  critical: number;
}

export default function HealthOverview({
  healthy,
  warning,
  critical,
}: HealthOverviewProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Infrastructure Health
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Current health across monitored infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-emerald-50 p-5">
          <p className="text-sm font-medium text-emerald-700">
            Healthy
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-900">
            {healthy}
          </p>
        </div>

        <div className="rounded-lg bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-700">
            Warning
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-900">
            {warning}
          </p>
        </div>

        <div className="rounded-lg bg-red-50 p-5">
          <p className="text-sm font-medium text-red-700">
            Critical
          </p>

          <p className="mt-2 text-3xl font-bold text-red-900">
            {critical}
          </p>
        </div>
      </div>
    </div>
  );
}