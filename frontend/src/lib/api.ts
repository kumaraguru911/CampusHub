const API_URL = "http://127.0.0.1:8000";

async function request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export function getBuildings() {
  return request("/api/buildings");
}

export function getRooms() {
  return request("/api/rooms");
}

export function getAssets() {
  return request("/api/assets");
}

export function getAssetMetrics(assetId: number) {
  return request(`/api/assets/${assetId}/metrics`);
}

export type MetricsRange = "1h" | "6h" | "24h" | "7d";

export function getAssetMetricsHistory(
  assetId: number,
  range: MetricsRange,
) {
  return request(
    `/api/assets/${assetId}/metrics/history?range=${range}`,
  );
}

export function getAsset(assetId: number) {
  return request(`/api/assets/${assetId}`);
}