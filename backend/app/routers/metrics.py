from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.asset import Asset
from app.schemas.metrics import AssetMetrics
from app.services.cache import (
    get_cached_metrics,
    cache_metrics,
)

import time

from app.schemas.metrics_history import (
    AssetMetricsHistory,
    MetricPoint,
)

from app.services.prometheus import (
    query_prometheus,
    query_prometheus_range,
)

router = APIRouter(
    prefix="/api/assets",
    tags=["Metrics"],
)


def extract_value(result):
    if not result:
        return None

    return float(result[0]["value"][1])


@router.get(
    "/{asset_id}/metrics",
    response_model=AssetMetrics,
)
async def get_asset_metrics(
    asset_id: int,
    db: Session = Depends(get_db),
):
    asset = (
        db.query(Asset)
        .filter(Asset.id == asset_id)
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found",
        )

    if not asset.monitoring_enabled:
        raise HTTPException(
            status_code=400,
            detail="Monitoring is not enabled for this asset",
        )

    if not asset.monitoring_target:
        raise HTTPException(
            status_code=400,
            detail="Monitoring target is not configured",
        )

    # Redis cache
    cache_key = f"asset_metrics:{asset.id}"

    cached_metrics = await get_cached_metrics(cache_key)

    if cached_metrics is not None:
        return AssetMetrics(**cached_metrics)

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
        f'instance="{target}",mountpoint="/data"}}'
        " / "
        f'node_filesystem_size_bytes{{'
        f'instance="{target}",mountpoint="/data"}}'
        "))"
    )

    uptime_query = (
        f'time() - node_boot_time_seconds{{'
        f'instance="{target}"}}'
    )

    cpu_result = await query_prometheus(cpu_query)
    memory_result = await query_prometheus(memory_query)
    disk_result = await query_prometheus(disk_query)
    uptime_result = await query_prometheus(uptime_query)

    cpu = extract_value(cpu_result)
    memory = extract_value(memory_result)
    disk = extract_value(disk_result)
    uptime = extract_value(uptime_result)

    health = "unknown"

    if cpu is not None and memory is not None and disk is not None:
        if cpu >= 90 or memory >= 90 or disk >= 90:
            health = "critical"
        elif cpu >= 75 or memory >= 75 or disk >= 75:
            health = "warning"
        else:
            health = "healthy"

    metrics = AssetMetrics(
        asset_id=asset.id,
        asset_tag=asset.asset_tag,
        health=health,
        cpu_percent=round(cpu, 2) if cpu is not None else None,
        memory_percent=round(memory, 2) if memory is not None else None,
        disk_percent=round(disk, 2) if disk is not None else None,
        uptime_seconds=round(uptime, 2)
        if uptime is not None
        else None,
    )

    await cache_metrics(
        cache_key,
        metrics.model_dump(),
        ttl=15,
    )

    return metrics

@router.get(
    "/{asset_id}/metrics/history",
    response_model=AssetMetricsHistory,
)
async def get_asset_metrics_history(
    asset_id: int,
    range: str = "1h",
    db: Session = Depends(get_db),
):
    asset = (
        db.query(Asset)
        .filter(Asset.id == asset_id)
        .first()
    )

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found",
        )

    if not asset.monitoring_enabled:
        raise HTTPException(
            status_code=400,
            detail="Monitoring is not enabled for this asset",
        )

    if not asset.monitoring_target:
        raise HTTPException(
            status_code=400,
            detail="Monitoring target is not configured",
        )

    target = asset.monitoring_target

    end = int(time.time())

    range_config = {
    "1h": {
        "seconds": 60 * 60,
        "step": 60,
    },
    "6h": {
        "seconds": 6 * 60 * 60,
        "step": 5 * 60,
    },
    "24h": {
        "seconds": 24 * 60 * 60,
        "step": 15 * 60,
    },
    "7d": {
        "seconds": 7 * 24 * 60 * 60,
        "step": 60 * 60,
    },
    }

    if range not in range_config:
        raise HTTPException(
            status_code=400,
            detail="Invalid range. Use 1h, 6h, 24h, or 7d.",
        )

    config = range_config[range]

    end = int(time.time())
    start = end - config["seconds"]
    step = config["step"]

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
        f'instance="{target}",mountpoint="/data"}}'
        " / "
        f'node_filesystem_size_bytes{{'
        f'instance="{target}",mountpoint="/data"}}'
        "))"
    )

    cpu_result = await query_prometheus_range(
        cpu_query,
        start,
        end,
        step,
    )

    memory_result = await query_prometheus_range(
        memory_query,
        start,
        end,
        step,
    )

    disk_result = await query_prometheus_range(
        disk_query,
        start,
        end,
        step,
    )

    def convert_result(result):
        if not result:
            return []

        values = result[0].get("values", [])

        return [
            MetricPoint(
                timestamp=float(timestamp),
                value=round(float(value), 2),
            )
            for timestamp, value in values
        ]

    return AssetMetricsHistory(
        asset_id=asset.id,
        asset_tag=asset.asset_tag,
        range_hours=config["seconds"] // 3600,
        cpu=convert_result(cpu_result),
        memory=convert_result(memory_result),
        disk=convert_result(disk_result),
    )
