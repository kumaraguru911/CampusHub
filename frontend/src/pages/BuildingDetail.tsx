import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  DoorOpen,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  getBuildings,
  getRooms,
} from "../lib/api";

import type {
  Building,
  Room,
} from "../lib/api";

export default function BuildingDetail() {
  const { buildingId } = useParams();

  const id = Number(buildingId);

  const buildingsQuery = useQuery<Building[]>({
    queryKey: ["buildings"],
    queryFn: getBuildings,
  });

  const roomsQuery = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  if (
    buildingsQuery.isLoading ||
    roomsQuery.isLoading
  ) {
    return (
      <main className="p-8">
        <p className="text-sm text-slate-500">
          Loading building...
        </p>
      </main>
    );
  }

  if (
    buildingsQuery.isError ||
    roomsQuery.isError
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
            Unable to load building
          </h1>

          <p className="mt-1 text-sm text-red-700">
            Make sure the CampusHub API is running.
          </p>
        </div>
      </main>
    );
  }

  const building = buildingsQuery.data?.find(
    (item) => item.id === id,
  );

  if (!building) {
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
            Building not found
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            No building exists with ID {id}.
          </p>
        </div>
      </main>
    );
  }

  const rooms =
    roomsQuery.data?.filter(
      (room) => room.building_id === building.id,
    ) ?? [];

  const totalCapacity = rooms.reduce(
    (total, room) => total + room.capacity,
    0,
  );

  return (
    <main className="space-y-6 p-8">
      {/* Back */}
      <Link
        to="/buildings"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Buildings
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Building2
              size={24}
              className="text-slate-700"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {building.name}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {building.code ?? "No building code"}
            </p>
          </div>
        </div>
      </div>

      {/* Building information */}
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={<Building2 size={18} />}
          label="Building Code"
          value={building.code ?? "—"}
        />

        <InfoCard
          icon={<MapPin size={18} />}
          label="Location"
          value={building.location ?? "—"}
        />

        <InfoCard
          icon={<DoorOpen size={18} />}
          label="Rooms"
          value={String(rooms.length)}
        />
      </div>

      {/* Capacity */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <Users
            size={18}
            className="text-slate-500"
          />

          <h2 className="font-semibold text-slate-900">
            Total Room Capacity
          </h2>
        </div>

        <p className="mt-3 text-3xl font-bold text-slate-900">
          {totalCapacity}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Maximum capacity across all rooms
        </p>
      </div>

      {/* Rooms */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Rooms
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Rooms registered under this building.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Room
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Number
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Capacity
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {rooms.map((room) => (
                <tr
                  key={room.id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <DoorOpen
                          size={18}
                          className="text-slate-600"
                        />
                      </div>

                      <div>
                        <Link
  to={`/rooms/${room.id}`}
  className="font-medium text-slate-900 hover:underline"
>
  {room.name}
</Link>

                        <p className="text-xs text-slate-500">
                          Room #{room.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {room.room_number}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                      {room.room_type}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {room.capacity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rooms.length === 0 && (
            <div className="p-10 text-center">
              <DoorOpen
                size={32}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm text-slate-500">
                No rooms registered for this building.
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

      <p className="mt-3 text-lg font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}