import json

import redis.asyncio as redis

import os

REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://localhost:6379",
)

redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True,
)


async def get_cached_metrics(key: str):
    value = await redis_client.get(key)

    if value is None:
        return None

    return json.loads(value)


async def cache_metrics(
    key: str,
    data: dict,
    ttl: int = 15,
):
    await redis_client.set(
        key,
        json.dumps(data),
        ex=ttl,
    )
