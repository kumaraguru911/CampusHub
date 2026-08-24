from pydantic import BaseModel


class MetricPoint(BaseModel):
    timestamp: float
    value: float


class AssetMetricsHistory(BaseModel):
    asset_id: int
    asset_tag: str
    range_hours: int
    cpu: list[MetricPoint]
    memory: list[MetricPoint]
    disk: list[MetricPoint]