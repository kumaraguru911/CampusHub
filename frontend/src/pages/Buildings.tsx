import { useQuery } from "@tanstack/react-query";
import { Building2, Search, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import { getBuildings } from "../lib/api";

import type { Building } from "../lib/api";

export default function Buildings() {
  const [search, setSearch] = useState("");

  const buildingsQuery = useQuery<Building[]>({
    queryKey: ["buildings"],
    queryFn: getBuildings,
  });

  if (buildingsQuery.isLoading) {
    return (
      <main className="p-8">
        <p className="text-sm text-slate-500">
          Loading buildings...
        </p>
      </main>
    );
  }

  if (buildingsQuery.isError) {
    return (
      <main className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="font-medium text-red-800">
            Unable to load buildings.
          </p>

          <p className="mt-1 text-sm text-red-600">
            Make sure the CampusHub API is running.
          </p>
        </div>
      </main>
    );
  }

  const buildings = buildingsQuery.data ?? [];

  const filteredBuildings = buildings.filter(
    (building) => {
      const value = search.toLowerCase();

      return (
        building.name
          .toLowerCase()
          .includes(value) ||
        building.code
          ?.toLowerCase()
          .includes(value) ||
        building.location
          ?.toLowerCase()
          .includes(value)
      );
    },
  );

  return (
    <main className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Buildings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage campus buildings and their infrastructure.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search buildings..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
        />
      </div>

      {/* Building list */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Building
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Code
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredBuildings.map((building) => (
              <tr
                key={building.id}
                className="hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <Link
                    to={`/buildings/${building.id}`}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Building2
                        size={18}
                        className="text-slate-600"
                      />
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">
                        {building.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        Building #{building.id}
                      </p>
                    </div>
                  </Link>
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {building.code ?? "—"}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={15} />
                    {building.location ?? "—"}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  {building.description ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBuildings.length === 0 && (
          <div className="p-10 text-center">
            <Building2
              size={32}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm text-slate-500">
              No buildings found.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
