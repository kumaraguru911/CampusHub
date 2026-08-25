import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Monitor, Search } from "lucide-react";
import { useState } from "react";

import { getAssets } from "../lib/api";

interface Asset {
  id: number;
  asset_tag: string;
  name?: string;
  asset_type?: string;
  monitoring_enabled: boolean;
  monitoring_target?: string | null;
}

export default function Assets() {
  const [search, setSearch] = useState("");

  const assetsQuery = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: getAssets,
  });

  if (assetsQuery.isLoading) {
    return (
      <main className="p-8">
        <p className="text-sm text-slate-500">
          Loading assets...
        </p>
      </main>
    );
  }

  if (assetsQuery.isError) {
    return (
      <main className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-800">
            Unable to load assets.
          </p>
        </div>
      </main>
    );
  }

  const assets = assetsQuery.data ?? [];

  const filteredAssets = assets.filter((asset) => {
    const value = search.toLowerCase();

    return (
      asset.asset_tag.toLowerCase().includes(value) ||
      asset.name?.toLowerCase().includes(value) ||
      asset.asset_type?.toLowerCase().includes(value)
    );
  });

  return (
    <main className="space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Assets
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage and monitor campus infrastructure.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search assets..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Asset
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Monitoring
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Target
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredAssets.map((asset) => (
              <tr
                key={asset.id}
                className="hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <Link
                    to={`/assets/${asset.id}`}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Monitor
                        size={18}
                        className="text-slate-600"
                      />
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">
                        {asset.asset_tag}
                      </p>

                      {asset.name && (
                        <p className="text-xs text-slate-500">
                          {asset.name}
                        </p>
                      )}
                    </div>
                  </Link>
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {asset.asset_type ?? "Infrastructure"}
                </td>

                <td className="px-6 py-4">
                  {asset.monitoring_enabled ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      Disabled
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  {asset.monitoring_target ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAssets.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-500">
              No assets found.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
