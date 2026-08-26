import asyncio
import logging

from sqlalchemy import select

from app.db.database import SessionLocal
from app.models.asset import Asset
from app.services.alert_service import create_or_update_alert
from app.services.prometheus import query_prometheus


logger = logging.getLogger("campushub.alert_scheduler")
logger.setLevel(logging.INFO)

EVALUATION_INTERVAL = 60


def extract_value(result):
    if not result:
        return None

    try:
        return float(result[0]["value"][1])
    except (KeyError, IndexError, ValueError, TypeError):
        return None


async def evaluate_all_assets():
    db = SessionLocal()

    try:
        assets = db.scalars(
            select(Asset).where(
                Asset.monitoring_enabled.is_(True)
            )
        ).all()

        for asset in assets:
            if not asset.monitoring_target:
                continue

            target = asset.monitoring_target

            queries = {
                "cpu": (
                    "100 - (avg by (instance) "
                    "(rate(node_cpu_seconds_total{"
                    f'mode="idle",instance="{target}"'
                    "}[5m])) * 100)"
                ),
                "memory": (
                    "100 * (1 - ("
                    f'node_memory_MemAvailable_bytes{{instance="{target}"}}'
                    " / "
                    f'node_memory_MemTotal_bytes{{instance="{target}"}}'
                    "))"
                ),
                "disk": (
                    "100 * (1 - ("
                    f'node_filesystem_avail_bytes{{'
                    f'instance="{target}",mountpoint="/"}}'
                    " / "
                    f'node_filesystem_size_bytes{{'
                    f'instance="{target}",mountpoint="/"}}'
                    "))"
                ),
            }

            for metric, query in queries.items():
                try:
                    result = await query_prometheus(query)
                    value = extract_value(result)

                    if value is None:
                        continue

                    create_or_update_alert(
                        db=db,
                        asset=asset,
                        metric=metric,
                        value=value,
                    )

                except Exception:
                    logger.exception(
                        "Failed to evaluate %s for asset %s",
                        metric,
                        asset.asset_tag,
                    )

    finally:
        db.close()


async def alert_evaluation_loop():
    logger.info(
        "CampusHub alert evaluator started "
        "(interval=%ss)",
        EVALUATION_INTERVAL,
    )

    while True:
        try:
            logger.info(
                "Running automatic alert evaluation"
            )

            await evaluate_all_assets()

            logger.info(
                "Automatic alert evaluation completed"
            )

        except Exception:
            logger.exception(
                "Alert evaluation cycle failed"
            )

        await asyncio.sleep(
            EVALUATION_INTERVAL
        )