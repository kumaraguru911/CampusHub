export interface AssetMetrics {
  asset_id: number;
  asset_tag: string;
  health: "healthy" | "warning" | "critical" | "unknown";
  cpu_percent: number | null;
  memory_percent: number | null;
  disk_percent: number | null;
  uptime_seconds: number | null;
}

export interface MetricPoint {
  timestamp: number;
  value: number;
}

export interface AssetMetricsHistory {
  asset_id: number;
  asset_tag: string;
  range_hours: number;
  cpu: MetricPoint[];
  memory: MetricPoint[];
  disk: MetricPoint[];
}