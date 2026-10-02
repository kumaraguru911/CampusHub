import type {
  AssetMetrics,
  AssetMetricsHistory,
} from "../types/metrics";

const API_URL = "http://127.0.0.1:8000";

export interface Building {
  id: number;
  name: string;
  code: string | null;
  location: string | null;
  description: string | null;
}

export interface Room {
  id: number;
  building_id: number;
  name: string;
  room_number: string;
  room_type: string;
  capacity: number;
}

export interface Asset {
  id: number;
  room_id: number;
  name: string;
  asset_tag: string;
  asset_type: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  status: string;
  purchase_date: string | null;
  monitoring_enabled: boolean;
  monitoring_target: string | null;
}

export interface Alert {
  id: number;
  asset_id: number;
  metric: string;
  severity: "WARNING" | "CRITICAL";
  message: string;
  value: number;
  threshold: number;
  status: "ACTIVE" | "RESOLVED";
  created_at: string;
  resolved_at: string | null;
}

async function request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export function getBuildings(): Promise<Building[]> {
  return request<Building[]>("/api/buildings");
}

export function getRooms(): Promise<Room[]> {
  return request<Room[]>("/api/rooms");
}

export function getAssets(): Promise<Asset[]> {
  return request<Asset[]>("/api/assets");
}

export function getAssetMetrics(
  assetId: number,
): Promise<AssetMetrics> {
  return request<AssetMetrics>(
    `/api/assets/${assetId}/metrics`,
  );
}

export type MetricsRange = "1h" | "6h" | "24h" | "7d";

export function getAssetMetricsHistory(
  assetId: number,
  range: MetricsRange,
): Promise<AssetMetricsHistory> {
  return request<AssetMetricsHistory>(
    `/api/assets/${assetId}/metrics/history?range=${range}`,
  );
}

export function getAsset(assetId: number): Promise<Asset> {
  return request<Asset>(`/api/assets/${assetId}`);
}

export function getAlerts(): Promise<Alert[]> {
  return request<Alert[]>("/api/alerts");
}

export function getActiveAlerts(): Promise<Alert[]> {
  return request<Alert[]>("/api/alerts/active");
}

export function resolveAlert(
  alertId: number,
): Promise<Alert> {
  return request<Alert>(
    `/api/alerts/${alertId}/resolve`,
  );
}