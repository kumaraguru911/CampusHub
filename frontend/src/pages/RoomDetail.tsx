import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  DoorOpen,
  Monitor,
  MapPin,
  Users,
  Activity,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  getRooms,
  getAssets,
} from "../lib/api";

import type {
  Room,
  Asset,
} from "../lib/api";

export default function RoomDetail() {
  const { roomId } = useParams();

  const id = Number(roomId);

  const roomsQuery = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const assetsQuery = useQuery<Asset[]>({
    queryKey: ["assets"],
    queryFn: getAssets,
  });

  if (
    roomsQuery.isLoading ||
    assetsQuery.isLoading
  ) {
    return (
      <main className="p-8">
        <p className="text-sm text-slate-500">
          Loading room...
        </p>
      </main>
    );
  }

  if (
    roomsQuery.isError ||
    assetsQuery.isError
  ) {
    return (
      <main className="space-y-4 p-8">
        <Link
          to="/buildings"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Buildings
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="font-semibold text-red-900">
            Unable to load room
          </h1>

          <p className="mt-1 text-sm text-red-700">
            Make sure the CampusHub API is running.
          </p>
        </div>
      </main>
    );
  }

  const room = roomsQuery.data?.find(
    (item) => item.id === id,
  );

  if (!room) {
    return (
      <main className="space-y-4 p-8">
        <Link
          to="/buildings"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Buildings
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-lg font-semibold text-slate-900">
            Room not found
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            No room exists with ID {id}.
          </p>
        </div>
      </main>
    );
  }

  const assets =
    assetsQuery.data?.filter(
      (asset) => asset.room_id === room.id,
    ) ?? [];

  const monitoredAssets = assets.filter(
    (asset) => asset.monitoring_enabled,
  );

  return (
    <main className="space-y-6 p-8">
      {/* Back */}
      <Link
        to={`/buildings/${room.building_id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Building
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <DoorOpen
              size={24}
              className="text-slate-700"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {room.name}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {room.room_number}
            </p>
          </div>
        </div>
      </div>

      {/* Room information */}
      <div className="grid gap-4 md:grid-cols-4">
        <InfoCard
          icon={<DoorOpen size={18} />}
          label="Room Number"
          value={room.room_number}
        />

        <InfoCard
          icon={<MapPin size={18} />}
          label="Type"
          value={room.room_type}
        />

        <InfoCard
          icon={<Users size={18} />}
          label="Capacity"
          value={String(room.capacity)}
        />

        <InfoCard
          icon={<Monitor size={18} />}
          label="Assets"
          value={String(assets.length)}
        />
      </div>

      {/* Monitoring summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Activity
            size={18}
            className="text-slate-500"
          />

          <h2 className="font-semibold text-slate-900">
            Monitoring
          </h2>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-2xl font-bold text-slate-900">
            {monitoredAssets.length}
          </span>

          <span className="text-sm text-slate-500">
            of {assets.length} assets monitored
          </span>
        </div>
      </div>

      {/* Assets */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Assets
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Infrastructure assets assigned to this room.
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
                  Type
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Manufacturer
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Monitoring
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {assets.map((asset) => (
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
                          {asset.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {asset.asset_tag}
                        </p>
                      </div>
                    </Link>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {asset.asset_type}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {asset.manufacturer ?? "—"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        asset.status === "ACTIVE"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {asset.monitoring_enabled ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Enabled
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">
                        Disabled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {assets.length === 0 && (
            <div className="p-10 text-center">
              <Monitor
                size={32}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm text-slate-500">
                No assets assigned to this room.
              </p>
            </div>
          )}
        </div>
      </div>
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

      <p className="mt-3 text-lg font-semibold capitalize text-slate-900">
        {value}
      </p>
    </div>
  );
}