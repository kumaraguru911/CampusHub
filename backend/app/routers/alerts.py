from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.alert import Alert
from app.models.asset import Asset
from app.schemas.alert import AlertResponse
from app.services.alert_service import (
    create_or_update_alert,
)
from app.services.prometheus import query_prometheus


router = APIRouter(
    prefix="/api/alerts",
    tags=["alerts"],
)


def extract_value(result):
    if not result:
        return None

    try:
        return float(result[0]["value"][1])
    except (KeyError, IndexError, ValueError):
        return None


@router.get(
    "",
    response_model=list[AlertResponse],
)
def get_alerts(
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(Alert)
        .order_by(Alert.created_at.desc())
    ).all()


@router.get(
    "/active",
    response_model=list[AlertResponse],
)
def get_active_alerts(
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(Alert)
        .where(Alert.status == "ACTIVE")
        .order_by(Alert.created_at.desc())
    ).all()


@router.post(
    "/evaluate",
    response_model=list[AlertResponse],
)
async def evaluate_alerts(
    db: Session = Depends(get_db),
):
    assets = db.scalars(
        select(Asset).where(
            Asset.monitoring_enabled.is_(True),
        )
    ).all()

    generated_alerts: list[Alert] = []

    for asset in assets:
        if not asset.monitoring_target:
            continue

        target = asset.monitoring_target

        cpu_query = (
            "100 - (avg by (instance) "
            "(rate(node_cpu_seconds_total{"
            f'mode="idle",instance="{target}"'
            "}[5m])) * 100)"
        )

        memory_query = (
            "100 * (1 - ("
            f'node_memory_MemAvailable_bytes{{instance="{target}"}}'
            " / "
            f'node_memory_MemTotal_bytes{{instance="{target}"}}'
            "))"
        )

        disk_query = (
            "100 * (1 - ("
            f'node_filesystem_avail_bytes{{'
            f'instance="{target}",mountpoint="/"}}'
            " / "
            f'node_filesystem_size_bytes{{'
            f'instance="{target}",mountpoint="/"}}'
            "))"
        )

        metric_queries = {
            "cpu": cpu_query,
            "memory": memory_query,
            "disk": disk_query,
        }

        for metric, query in metric_queries.items():
            result = await query_prometheus(query)

            value = extract_value(result)

            if value is None:
                continue

            alert = create_or_update_alert(
                db=db,
                asset=asset,
                metric=metric,
                value=value,
            )

            if alert:
                generated_alerts.append(alert)

    return generated_alerts


@router.patch(
    "/{alert_id}/resolve",
    response_model=AlertResponse,
)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
):
    from datetime import datetime

    from fastapi import HTTPException

    alert = db.get(Alert, alert_id)

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    alert.status = "RESOLVED"
    alert.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(alert)

    return alert