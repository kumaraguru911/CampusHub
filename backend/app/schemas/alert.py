from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AlertResponse(BaseModel):
    id: int
    asset_id: int
    metric: str
    severity: str
    message: str
    value: float
    threshold: float
    status: str
    created_at: datetime
    resolved_at: datetime | None

    model_config = ConfigDict(
        from_attributes=True,
    )
