from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.asset import Asset
from app.schemas.metrics import AssetMetrics
from app.services.cache import (
    get_cached_metrics,
    cache_metrics,
)
from app.services.prometheus import query_prometheus

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
        f'instance="{target}",mountpoint="/"}}'
        " / "
        f'node_filesystem_size_bytes{{'
        f'instance="{target}",mountpoint="/"}}'
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