from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.asset import Asset


THRESHOLDS = {
    "cpu": {
        "warning": 75.0,
        "critical": 90.0,
    },
    "memory": {
        "warning": 75.0,
        "critical": 85.0,
    },
    "disk": {
        "warning": 75.0,
        "critical": 90.0,
    },
}


def determine_severity(
    metric: str,
    value: float,
) -> tuple[str, float] | None:
    thresholds = THRESHOLDS[metric]

    if value >= thresholds["critical"]:
        return "CRITICAL", thresholds["critical"]

    if value >= thresholds["warning"]:
        return "WARNING", thresholds["warning"]

    return None


def create_or_update_alert(
    db: Session,
    asset: Asset,
    metric: str,
    value: float,
) -> Alert | None:
    result = determine_severity(metric, value)

    if result is None:
        resolve_alert(
            db,
            asset.id,
            metric,
        )
        return None

    severity, threshold = result

    existing = db.scalar(
        select(Alert)
        .where(
            Alert.asset_id == asset.id,
            Alert.metric == metric,
            Alert.status == "ACTIVE",
        )
    )

    message = (
        f"{asset.asset_tag} {metric} usage "
        f"reached {value:.1f}% "
        f"(threshold: {threshold:.1f}%)"
    )

    if existing:
        existing.value = value
        existing.severity = severity
        existing.threshold = threshold
        existing.message = message

        db.commit()
        db.refresh(existing)

        return existing

    alert = Alert(
        asset_id=asset.id,
        metric=metric,
        severity=severity,
        message=message,
        value=value,
        threshold=threshold,
        status="ACTIVE",
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert


def resolve_alert(
    db: Session,
    asset_id: int,
    metric: str,
) -> None:
    alerts = db.scalars(
        select(Alert)
        .where(
            Alert.asset_id == asset_id,
            Alert.metric == metric,
            Alert.status == "ACTIVE",
        )
    ).all()

    for alert in alerts:
        alert.status = "RESOLVED"
        alert.resolved_at = datetime.utcnow()

    db.commit()
