from pydantic import BaseModel


class AssetMetrics(BaseModel):
    asset_id: int
    asset_tag: str
    health: str

    cpu_percent: float | None = None
    memory_percent: float | None = None
    disk_percent: float | None = None
    uptime_seconds: float | None = None